from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from datetime import datetime
from typing import Optional
import uuid
from pathlib import Path

from supabase import create_client, Client

from config import (
    ENVIRONMENT,
    CORS_ORIGINS,
    NEIGHBOURHOODS,
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    MAX_FILE_SIZE,
    ALLOWED_EXTENSIONS,
)
from models import SightingCreate, Sighting, Cat, CatDetail, LostCatCreate, LostCat, PetClaimCreate, PetClaim

app = FastAPI(
    title="Cat Directory API",
    description="Backend API for the Cat Directory app",
    version="0.1.0",
)

# Enable CORS for local development and deployed frontend hosts.
origins = [
    "http://localhost:3000",
    "http://localhost:8000",
    "https://cat-directory.vercel.app",
    *CORS_ORIGINS,
]

origins = list(dict.fromkeys(origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== Supabase Client =====
supabase: Optional[Client] = None


def get_supabase_client() -> Client:
    global supabase
    if supabase is None:
        if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
            raise HTTPException(status_code=500, detail="Supabase is not configured")
        supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    return supabase

client = get_supabase_client()

# ===== Health Check =====
@app.get("/health")
def health_check():
    """Simple health check endpoint"""
    return {"status": "ok", "environment": ENVIRONMENT}

# ===== Sightings Endpoints =====
@app.post("/api/sightings")
def create_sighting(
    photo: Optional[UploadFile] = File(default=None),
    coat_colour: str = Form(...),
    health_status: str = Form(...),
    temperament: str = Form(...),
    neighbourhood: str = Form(...),
    sighted_at: datetime = Form(...),
    lost_cat_id: Optional[str] = Form(default=None),
):
    """
    Submit a new cat sighting.
    - Saves to database immediately
    - Triggers AI pipeline in background
    """

    photo_url: Optional[str] = None
    if photo:
        file_ext = Path(photo.filename or "").suffix.lower().lstrip(".")
        if file_ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(status_code=400, detail="Unsupported file type")

        file_bytes = photo.file.read()
        if len(file_bytes) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="File too large")

        object_name = f"{uuid.uuid4()}.{file_ext}"
        try:
            client.storage.from_("sightings").upload(
                path=object_name,
                file=file_bytes,
                file_options={"content-type": photo.content_type or "application/octet-stream"},
            )
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"Failed to upload photo: {exc}")

        photo_url = client.storage.from_("sightings").get_public_url(object_name)
    elif lost_cat_id:
        photo_response = (
            client.table("lost_cat_photos")
            .select("photo_url")
            .eq("lost_cat_id", lost_cat_id)
            .limit(1)
            .execute()
        )
        if photo_response.data:
            photo_url = photo_response.data[0].get("photo_url")
    else:
        raise HTTPException(status_code=400, detail="Photo is required")

    if not photo_url:
        raise HTTPException(status_code=400, detail="Photo is required")

    sighting_type = "lost_cat" if lost_cat_id else "normal"

    payload = SightingCreate(
        photo_url=photo_url,
        sighting_type=sighting_type,
        coat_colour=coat_colour,
        health_status=health_status,
        temperament=temperament,
        neighbourhood=neighbourhood,
        sighted_at=sighted_at,
        lost_cat_id=lost_cat_id,
    ).model_dump(mode="json")
    try:
        response = client.table("sightings").insert(payload).execute()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to save sighting: {exc}")

    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to save sighting")

    sighting_id = response.data[0].get("id")

    # TODO: Trigger AI merging pipeline
    return {
        "success": True,
        "message": "Thanks! We'll process this shortly.",
        "data": {
            "sighting_id": sighting_id,
        }
    }

#not needed at all 
# @app.get("/api/sightings/{sighting_id}")
# def get_sighting(sighting_id: str):
#     """Get a specific sighting"""
#     client = get_supabase_client()

#     # TODO: Fetch from Supabase
#     return {"error": "Not implemented"}

# ===== Cats Directory Endpoints =====
@app.get("/api/cats")
def list_cats(neighbourhood: Optional[str] = None):
    """
    Get all cats in the directory.
    Can filter by neighbourhood.
    """

    response = client.table("cats").select("*").execute()
    if not response.data:
        return {
            "cats": [],
            "total": 0,
        }

    return {
        "cats": response.data,
        "total": len(response.data),
    }

@app.get("/api/cats/{cat_id}")
def get_cat(cat_id: str):
    """Get detailed info about a specific cat"""
    # TODO: Fetch cat + all sightings from Supabase
    return {"error": "Not implemented"}

@app.get("/api/cats/count")
def get_cat_count():
    """Get total count of unique cats in the directory"""
    # TODO: Count unique cats from Supabase
    return {"count": 0}

@app.get("/api/neighbourhoods")
def get_neighbourhoods():
    """Get list of available neighbourhoods"""
    return {"neighbourhoods": NEIGHBOURHOODS}

# ===== Lost Cats Endpoints =====
@app.post("/api/lost-cats")
def create_lost_cat(
    cat_name: str = Form(...),
    coat_colour: str = Form(...),
    description: str = Form(...),
    neighbourhood: str = Form(...),
    last_seen_at: datetime = Form(...),
    contact_email: str = Form(...),
    photos: list[UploadFile] = File(default=[]),
):
    """
    Report a lost cat.
    - Saves immediately
    - Triggers AI matching in background to email owner if matches found
    """
    if len(photos) > 3:
        raise HTTPException(status_code=400, detail="You can upload up to 3 photos")

    photo_urls: list[str] = []
    for photo in photos:
        file_ext = Path(photo.filename or "").suffix.lower().lstrip(".")
        if file_ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(status_code=400, detail="Unsupported file type")

        file_bytes = photo.file.read()
        if len(file_bytes) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="File too large")

        object_name = f"{uuid.uuid4()}.{file_ext}"
        try:
            client.storage.from_("lost-cats").upload(
                path=object_name,
                file=file_bytes,
                file_options={"content-type": photo.content_type or "application/octet-stream"},
            )
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"Failed to upload photo: {exc}")

        photo_urls.append(client.storage.from_("lost-cats").get_public_url(object_name))

    payload = {
        "cat_name": cat_name,
        "coat_colour": coat_colour,
        "description": description,
        "neighbourhood": neighbourhood,
        "last_seen_at": last_seen_at.isoformat(),
        "contact_email": contact_email,
    }
    try:
        response = client.table("lost_cats").insert(payload).execute()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to save lost cat: {exc}")

    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to save lost cat")

    lost_cat_id = response.data[0].get("id")

    if photo_urls:
        photo_rows = [
            {"lost_cat_id": lost_cat_id, "photo_url": url}
            for url in photo_urls
        ]
        try:
            client.table("lost_cat_photos").insert(photo_rows).execute()
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"Failed to save photos: {exc}")

    # TODO: Trigger AI matching pipeline
    return {
        "success": True,
        "message": "Lost cat report submitted",
        "data": {
            "lost_cat_id": lost_cat_id,
        }
    }

@app.get("/api/lost-cats")
def list_lost_cats(neighbourhood: Optional[str] = None):
    """Get all active lost cat reports (not archived or found)"""
    response = client.table("lost_cats").select("*").execute()
    lost_cats = response.data or []
    if not lost_cats:
        return {
            "lost_cats": [],
            "total": 0,
        }

    lost_cat_ids = [cat["id"] for cat in lost_cats]
    photo_response = (
        client.table("lost_cat_photos")
        .select("lost_cat_id, photo_url")
        .in_("lost_cat_id", lost_cat_ids)
        .execute()
    )
    photo_map: dict[str, str] = {}
    for photo in photo_response.data or []:
        if photo["lost_cat_id"] not in photo_map:
            photo_map[photo["lost_cat_id"]] = photo["photo_url"]

    enriched = [
        {
            **cat,
            "photo_url": photo_map.get(cat["id"]),
        }
        for cat in lost_cats
    ]

    return {
        "lost_cats": enriched,
        "total": len(enriched),
    }

@app.get("/api/lost-cats/{lost_cat_id}")
def get_lost_cat(lost_cat_id: str):
    """Get details of a specific lost cat report"""
    # TODO: Fetch from Supabase
    return {"error": "Not implemented"}

# ===== Pet Claims Endpoints =====
@app.post("/api/pet-claims")
def create_pet_claim(claim: PetClaimCreate):
    """
    Submit a claim that a cat in the directory is owned by the submitter.
    Status starts as 'pending' - moderator approves in Supabase.
    """
    # TODO: Save to Supabase
    return {
        "success": True,
        "message": "Claim submitted for review",
        "data": {
            "claim_id": "temp-id",
        }
    }

# ===== Error Handlers =====
@app.exception_handler(HTTPException)
def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "message": exc.detail,
            "code": exc.status_code,
        },
    )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
