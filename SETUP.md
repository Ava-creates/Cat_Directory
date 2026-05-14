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

## CI/CD Deployment

The repository now includes a GitHub Actions workflow that:
- runs frontend and backend checks on every pull request
- deploys the frontend to Vercel on pushes to `main`
- triggers the backend deploy hook on Render on pushes to `main`

### Required GitHub Secrets
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `RENDER_DEPLOY_HOOK_URL`

### Required App Environment Variables
- Frontend: `NEXT_PUBLIC_API_URL`
- Backend: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ENVIRONMENT`
- Backend CORS: `CORS_ORIGINS` set to your deployed frontend URL(s), separated by commas

### Flow
1. Open a pull request to run CI checks.
2. Merge to `main` to deploy both apps.
3. Keep adding functions as normal; each merge will rebuild and redeploy the latest code.
