from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# ===== Sighting Models =====
class SightingCreate(BaseModel):
    photo_url: str
    sighting_type: str
    coat_colour: str
    health_status: str
    temperament: str
    neighbourhood: str
    sighted_at: datetime
    lost_cat_id: Optional[str] = None

class Sighting(SightingCreate):
    id: str
    cat_id: Optional[str] = None
    created_at: datetime

# ===== Cat Models =====
class CatCreate(BaseModel):
    primary_photo_url: str
    coat_colour: str
    health_status: str
    temperament: str
    neighbourhood: str
    last_seen_at: datetime

class Cat(CatCreate):
    id: str
    status: str = "unknown"
    sighting_count: int = 1
    created_at: datetime

class CatDetail(Cat):
    sightings: list[Sighting] = []

# ===== Lost Cat Models =====
class LostCatCreate(BaseModel):
    cat_name: str
    coat_colour: str
    description: str
    neighbourhood: str
    last_seen_at: datetime
    contact_email: EmailStr
    photos: list[str]  # Photo URLs

class LostCat(LostCatCreate):
    id: str
    status: str = "active"
    created_at: datetime
    expires_at: datetime

# ===== Pet Claim Models =====
class PetClaimCreate(BaseModel):
    cat_id: str
    submitter_name: str
    contact_email: EmailStr
    message: str

class PetClaim(PetClaimCreate):
    id: str
    status: str = "pending"
    created_at: datetime

# ===== API Response Models =====
class SuccessResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None

class ErrorResponse(BaseModel):
    error: bool
    message: str
    code: Optional[str] = None
