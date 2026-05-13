from fastapi import FastAPI, HTTPException, File, UploadFile, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from datetime import datetime
from typing import Optional

from config import ENVIRONMENT, NEIGHBOURHOODS
from models import SightingCreate, Sighting, Cat, CatDetail, LostCatCreate, LostCat, PetClaimCreate, PetClaim

app = FastAPI(
    title="Cat Directory API",
    description="Backend API for the Cat Directory app",
    version="0.1.0",
)

# Enable CORS for local development and Vercel
origins = [
    "http://localhost:3000",
    "http://localhost:8000",
    "https://cat-directory.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== TEMPORARY: Mock Data (will be replaced with DB calls) =====
mock_cats: dict[str, Cat] = {}
mock_sightings: dict[str, Sighting] = {}

# ===== Health Check =====
@app.get("/health")
async def health_check():
    """Simple health check endpoint"""
    return {"status": "ok", "environment": ENVIRONMENT}

# ===== Sightings Endpoints =====
@app.post("/api/sightings")
async def create_sighting(sighting: SightingCreate, background_tasks: BackgroundTasks):
    """
    Submit a new cat sighting.
    - Saves to database immediately
    - Triggers AI pipeline in background
    """
    # TODO: Save to Supabase
    # TODO: Trigger AI merging pipeline
    return {
        "success": True,
        "message": "Thanks! We'll process this shortly.",
        "data": {
            "sighting_id": "temp-id",
        }
    }

@app.get("/api/sightings/{sighting_id}")
async def get_sighting(sighting_id: str):
    """Get a specific sighting"""
    # TODO: Fetch from Supabase
    return {"error": "Not implemented"}

# ===== Cats Directory Endpoints =====
@app.get("/api/cats")
async def list_cats(neighbourhood: Optional[str] = None):
    """
    Get all cats in the directory.
    Can filter by neighbourhood.
    """
    # TODO: Fetch from Supabase with optional filter
    return {
        "cats": [],
        "total": 0,
        "neighbourhood_filter": neighbourhood,
    }

@app.get("/api/cats/{cat_id}")
async def get_cat(cat_id: str):
    """Get detailed info about a specific cat"""
    # TODO: Fetch cat + all sightings from Supabase
    return {"error": "Not implemented"}

@app.get("/api/cats/count")
async def get_cat_count():
    """Get total count of unique cats in the directory"""
    # TODO: Count unique cats from Supabase
    return {"count": 0}

@app.get("/api/neighbourhoods")
async def get_neighbourhoods():
    """Get list of available neighbourhoods"""
    return {"neighbourhoods": NEIGHBOURHOODS}

# ===== Lost Cats Endpoints =====
@app.post("/api/lost-cats")
async def create_lost_cat(lost_cat: LostCatCreate, background_tasks: BackgroundTasks):
    """
    Report a lost cat.
    - Saves immediately
    - Triggers AI matching in background to email owner if matches found
    """
    # TODO: Save to Supabase
    # TODO: Trigger AI matching pipeline
    return {
        "success": True,
        "message": "Lost cat report submitted",
        "data": {
            "lost_cat_id": "temp-id",
        }
    }

@app.get("/api/lost-cats")
async def list_lost_cats(neighbourhood: Optional[str] = None):
    """Get all active lost cat reports (not archived or found)"""
    # TODO: Fetch from Supabase
    return {
        "lost_cats": [],
        "total": 0,
    }

@app.get("/api/lost-cats/{lost_cat_id}")
async def get_lost_cat(lost_cat_id: str):
    """Get details of a specific lost cat report"""
    # TODO: Fetch from Supabase
    return {"error": "Not implemented"}

# ===== Pet Claims Endpoints =====
@app.post("/api/pet-claims")
async def create_pet_claim(claim: PetClaimCreate):
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
async def http_exception_handler(request, exc):
    return {
        "error": True,
        "message": exc.detail,
        "code": exc.status_code,
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
