from typing import Optional, List, Union
from datetime import datetime

from fastapi import HTTPException
from supabase import create_client, Client
from io import BytesIO
from PIL import Image

from config import (
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    API_SECRET,
    SIGHTING_MERGE_THRESHOLD,
    SIGHTING_MATCH_CANDIDATE_LIMIT,
)

supabase: Optional[Client] = None


def get_supabase_client() -> Client:
    global supabase
    if supabase is None:
        if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
            raise HTTPException(status_code=500, detail="Supabase is not configured")
        supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    return supabase


# initialize client for convenience
client: Client = get_supabase_client()


def require_api_secret(api_secret: Optional[str]) -> None:
    if not api_secret or api_secret != API_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized")


def fetch_candidate_matches(
    embedding: list[float],
    coat_colour: str,
) -> list[dict]:
    response = client.rpc(
        "match_cats",
        {
            "query_embedding": embedding,
            "match_threshold": SIGHTING_MERGE_THRESHOLD,
            "match_count": SIGHTING_MATCH_CANDIDATE_LIMIT,
            "match_coat_colour": coat_colour,
        },
    ).execute()
    return response.data or []


def store_match_candidates(sighting_id: str, candidates: list[dict]) -> None:
    if not candidates:
        return
    rows = [
        {
            "sighting_id": sighting_id,
            "cat_id": candidate.get("id"),
            "similarity": candidate.get("similarity"),
            "status": "pending",
            "source": "ai",
        }
        for candidate in candidates
    ]
    client.table("sighting_match_candidates").insert(rows).execute()


def create_cat_from_sighting(
    photo_url: str,
    embedding: list[float],
    coat_colour: str,
    health_status: str,
    temperament: str,
    neighbourhood: str,
    sighted_at: Union[datetime, str],
) -> str:
    # accept either a datetime or an ISO string; parse strings robustly
    if isinstance(sighted_at, str):
        try:
            dt = datetime.fromisoformat(sighted_at)
        except Exception:
            try:
                from dateutil.parser import parse as _parse

                dt = _parse(sighted_at)
            except Exception:
                raise HTTPException(status_code=400, detail="Invalid sighted_at datetime")
    else:
        dt = sighted_at

    payload = {
        "primary_photo_url": photo_url,
        "embedding": embedding,
        "coat_colour": coat_colour,
        "health_status": health_status,
        "temperament": temperament,
        "neighbourhood": neighbourhood,
        "last_seen_at": dt.isoformat(),
    }
    response = client.table("cats").insert(payload).execute()
    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to create cat")
    return response.data[0].get("id")


def fetch_sighting_for_creation(sighting_id: str) -> dict:
    response = (
        client.table("sightings")
        .select(
            "id, photo_url, embedding, coat_colour, health_status, temperament, neighbourhood, sighted_at, cat_id"
        )
        .eq("id", sighting_id)
        .limit(1)
        .execute()
    )
    if not response.data:
        raise HTTPException(status_code=404, detail="Sighting not found")
    sighting = response.data[0]
    if sighting.get("cat_id"):
        raise HTTPException(status_code=400, detail="Sighting already linked to a cat")
    if not sighting.get("embedding"):
        raise HTTPException(status_code=400, detail="Sighting is missing an embedding")
    return sighting


def compress_image_bytes(img_bytes: bytes, max_size_bytes: int, max_dim: int = 1600, start_quality: int = 85) -> bytes:
    """Resize and compress image bytes to be under `max_size_bytes`.

    - Converts images to RGB JPEG.
    - Resizes the largest dimension to `max_dim` if larger.
    - Iteratively reduces JPEG quality until size is under the limit or quality reaches 20.
    """
    try:
        img = Image.open(BytesIO(img_bytes))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image data")

    if img.mode in ("RGBA", "LA"):
        bg = Image.new("RGB", img.size, (255, 255, 255))
        bg.paste(img, mask=img.split()[-1])
        img = bg
    else:
        img = img.convert("RGB")

    w, h = img.size
    if max(w, h) > max_dim:
        scale = max_dim / float(max(w, h))
        img = img.resize((int(w * scale), int(h * scale)), Image.LANCZOS)

    out = BytesIO()
    quality = start_quality
    img.save(out, format="JPEG", quality=quality, optimize=True)
    data = out.getvalue()

    while len(data) > max_size_bytes and quality > 20:
        quality -= 5
        out = BytesIO()
        img.save(out, format="JPEG", quality=quality, optimize=True)
        data = out.getvalue()

    return data
