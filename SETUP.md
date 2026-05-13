# Cat Directory - Setup Guide

## Prerequisites
- Node.js 18+
- Python 3.10+
- Git
- A Supabase account (free tier)

## Project Structure
```
Cat_Directory/
├── frontend/          # Next.js application
├── backend/           # FastAPI application
├── docs/              # Documentation
├── PRD.md             # Product Requirements Document
└── README.md          # Project overview
```

## Quick Start

### 1. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
# Runs on http://localhost:8000
```

### 3. Supabase Setup
Follow the step-by-step guide in `docs/SUPABASE_SETUP.md`

## Build Order
1. Supabase setup — schema, storage bucket
2. Sighting form — saves to DB, no AI yet
3. Cat directory page — shows all cats
4. AI pipeline — add CLIP embeddings + merging logic
5. Cat detail page — photo gallery, attributes, sighting history
6. Lost cat form + board
7. AI lost cat matching + email notification
8. Pet claim form — saves to DB
9. Resources page — static content

## Environment Variables
Copy `.env.example` to `.env.local` (frontend) and `.env` (backend), then fill in your API keys.

## Free Tier Services Used
- Vercel (frontend hosting)
- Railway/Render (backend hosting)
- Supabase (database, storage, magic link auth)
- Hugging Face Inference API (CLIP embeddings)
- Resend (email service)
