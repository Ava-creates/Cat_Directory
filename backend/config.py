import os
from dotenv import load_dotenv

load_dotenv()

# Supabase Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# API Configuration
API_SECRET = os.getenv("API_SECRET", "development-secret")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

# External APIs
HUGGING_FACE_API_KEY = os.getenv("HUGGING_FACE_API_KEY")
RESEND_API_KEY = os.getenv("RESEND_API_KEY")

# Neighbourhoods (hardcoded for MVP)
NEIGHBOURHOODS = [
    "Riverdale",
    "Mill Woods",
    "Downtown",
    "West End",
    "East Side",
    "North Central",
    "South Park",
    "Whyte Avenue",
]

# AI Thresholds
SIGHTING_MERGE_THRESHOLD = 0.75  # Cosine similarity threshold for merging sightings
LOST_CAT_MATCH_THRESHOLD = 0.70  # Threshold for lost cat matching

# Embedding Dimensions
EMBEDDING_DIMENSION = 512

# File Upload Limits
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "gif", "webp"}
