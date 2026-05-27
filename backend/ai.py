from typing import Tuple, List
import base64
from io import BytesIO
import os
import tempfile
from huggingface_hub import InferenceClient
import httpx
from PIL import Image

from config import (
    HF_TOKEN,
    HUGGING_FACE_API_KEY,
    HF_CAT_CLASSIFIER_MODEL,
    HF_IMAGE_EMBEDDING_MODEL,
    HF_MIN_CAT_SCORE,
    USE_LOCAL_EMBEDDINGS,
    LOCAL_EMBEDDING_MODEL,
)


class HFServiceError(RuntimeError):
    pass


_local_model = None
_local_processor = None


def _load_local_clip():
    global _local_model, _local_processor
    if _local_model is not None and _local_processor is not None:
        return _local_model, _local_processor

    try:
        from transformers import CLIPModel, CLIPProcessor
        import torch
    except Exception as exc:
        raise HFServiceError(f"Local embedding dependencies missing: {exc}")

    _local_processor = CLIPProcessor.from_pretrained(LOCAL_EMBEDDING_MODEL)
    _local_model = CLIPModel.from_pretrained(LOCAL_EMBEDDING_MODEL)
    _local_model.eval()
    _local_model.to("cpu")
    return _local_model, _local_processor


def _get_client() -> InferenceClient:
    api_key = HF_TOKEN or HUGGING_FACE_API_KEY
    # Use the modern Inference Providers routing (router.huggingface.co under the hood)
    # instead of the legacy api-inference.huggingface.co host (decommissioned).
    return InferenceClient(provider="hf-inference", api_key=api_key)


def _hf_headers() -> dict:
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/octet-stream",
    }
    api_key = HF_TOKEN or HUGGING_FACE_API_KEY
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"
    return headers


def _post_image_embedding(model: str, file_bytes: bytes) -> object:
    # Legacy host api-inference.huggingface.co has been decommissioned.
    # Use the router-backed hf-inference provider endpoint instead.
    url = f"https://router.huggingface.co/hf-inference/models/{model}"
    image_data = base64.b64encode(file_bytes).decode("utf-8")
    try:
        with httpx.Client(timeout=30.0) as client:
            response = client.post(
                url,
                headers={"Authorization": _hf_headers().get("Authorization", "")},
                json={"inputs": {"image": image_data}},
            )
    except httpx.HTTPError as exc:
        raise HFServiceError(f"Hugging Face request failed: {exc}")

    if response.status_code >= 400:
        raise HFServiceError(
            f"Hugging Face error {response.status_code}: {response.text}"
        )

    data = response.json()
    if isinstance(data, dict) and data.get("error"):
        raise HFServiceError(data.get("error"))
    return data


def _local_image_embedding(file_bytes: bytes) -> List[float]:
    from transformers import CLIPProcessor
    import torch

    image = Image.open(BytesIO(file_bytes)).convert("RGB")
    model, processor = _load_local_clip()
    if not isinstance(processor, CLIPProcessor):
        raise HFServiceError("Local CLIP processor not initialized")

    inputs = processor(images=image, return_tensors="pt")
    with torch.no_grad():
        features = model.get_image_features(**inputs)

    features = features / features.norm(p=2, dim=-1, keepdim=True)
    vector = features[0].cpu().tolist()
    return [float(x) for x in vector]


def _with_temp_image_path(file_bytes: bytes) -> str:
    image_io = BytesIO(file_bytes)
    image = Image.open(image_io).convert("RGB")
    temp_file = tempfile.NamedTemporaryFile(suffix=".jpg", delete=False)
    try:
        image.save(temp_file, format="JPEG")
    finally:
        temp_file.close()
    return temp_file.name


def _cleanup_temp_path(path: str) -> None:
    try:
        os.remove(path)
    except OSError:
        pass


def verify_cat_image(file_bytes: bytes) -> Tuple[bool, float, str]:
    try:
        client = _get_client()
        temp_path = _with_temp_image_path(file_bytes)
        # Use zero-shot classification so we can directly ask "cat" vs "not a cat".
        # This is more reliable than generic ImageNet labels (which can misclassify).
        data = client.zero_shot_image_classification(
            temp_path,
            candidate_labels=[
                "a photo of a cat",
                "a photo of a human face",
                "a photo of a dog",
                "a photo of an object",
            ],
            model=HF_CAT_CLASSIFIER_MODEL,
        )
    except Exception as exc:
        raise HFServiceError(f"Hugging Face request failed: {exc}")
    finally:
        if "temp_path" in locals():
            _cleanup_temp_path(temp_path)
    if not isinstance(data, list):
        raise HFServiceError("Unexpected classifier response format")

    top_label = ""
    top_score = 0.0
    cat_score = 0.0
    for item in data:
        label = str(item.get("label", "")).lower()
        score = float(item.get("score", 0.0))
        if score > top_score:
            top_score = score
            top_label = label
        if "cat" in label:
            cat_score = max(cat_score, score)

    is_cat = cat_score >= HF_MIN_CAT_SCORE
    return is_cat, cat_score, top_label


def get_image_embedding(file_bytes: bytes) -> List[float]:
    if USE_LOCAL_EMBEDDINGS:
        return _local_image_embedding(file_bytes)

    data = _post_image_embedding(HF_IMAGE_EMBEDDING_MODEL, file_bytes)

    if isinstance(data, list) and data and isinstance(data[0], list):
        return [float(x) for x in data[0]]
    if isinstance(data, list) and data and isinstance(data[0], (int, float)):
        return [float(x) for x in data]
    raise HFServiceError("Unexpected embedding response format")
