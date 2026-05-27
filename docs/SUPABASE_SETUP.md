# Supabase Setup Guide

## Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Create a new project (free tier)
4. Wait for provisioning (2-5 minutes)
5. Note your **Project URL** and **Anon Key** (under Settings > API)

## Step 2: Enable Extensions
In the Supabase dashboard:
1. Go to SQL Editor
2. Run this command to enable pgvector:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

## Step 3: Create Tables
Run the following SQL in the SQL Editor:

### Cats Table
```sql
CREATE TABLE cats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_photo_url TEXT NOT NULL,
  coat_colour TEXT NOT NULL,
  health_status TEXT NOT NULL,
  temperament TEXT NOT NULL,
  neighbourhood TEXT NOT NULL,
  status TEXT DEFAULT 'unknown' CHECK (status IN ('pet', 'community_cat', 'unknown')),
  last_seen_at TIMESTAMP NOT NULL,
  sighting_count INTEGER DEFAULT 1,
  embedding vector(512),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX cats_neighbourhood_idx ON cats(neighbourhood);
CREATE INDEX cats_status_idx ON cats(status);
CREATE INDEX cats_embedding_idx ON cats USING ivfflat (embedding vector_cosine_ops);
```

### Sightings Table
```sql
CREATE TABLE sightings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_url TEXT NOT NULL,
  sighting_type TEXT NOT NULL DEFAULT 'normal' CHECK (sighting_type IN ('normal', 'lost_cat')),
  embedding vector(512),
  match_status TEXT DEFAULT 'pending' CHECK (match_status IN ('pending', 'approved', 'rejected', 'auto_created')),
  verification_label TEXT,
  verification_score REAL,
  coat_colour TEXT NOT NULL,
  health_status TEXT NOT NULL,
  temperament TEXT NOT NULL,
  neighbourhood TEXT NOT NULL,
  cat_id UUID REFERENCES cats(id),
  lost_cat_id UUID REFERENCES lost_cats(id),
  sighted_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX sightings_cat_id_idx ON sightings(cat_id);
CREATE INDEX sightings_lost_cat_id_idx ON sightings(lost_cat_id);
CREATE INDEX sightings_type_idx ON sightings(sighting_type);
CREATE INDEX sightings_neighbourhood_idx ON sightings(neighbourhood);
CREATE INDEX sightings_created_at_idx ON sightings(created_at);
```

If you already created the sightings table, run this update:
```sql
ALTER TABLE sightings
  ADD COLUMN IF NOT EXISTS sighting_type TEXT NOT NULL DEFAULT 'normal' CHECK (sighting_type IN ('normal', 'lost_cat')),
  ADD COLUMN IF NOT EXISTS lost_cat_id UUID REFERENCES lost_cats(id),
  ADD COLUMN IF NOT EXISTS match_status TEXT DEFAULT 'pending' CHECK (match_status IN ('pending', 'approved', 'rejected', 'auto_created')),
  ADD COLUMN IF NOT EXISTS verification_label TEXT,
  ADD COLUMN IF NOT EXISTS verification_score REAL;

CREATE INDEX IF NOT EXISTS sightings_lost_cat_id_idx ON sightings(lost_cat_id);
CREATE INDEX IF NOT EXISTS sightings_type_idx ON sightings(sighting_type);
```

### Match Candidates + Golden Set
```sql
CREATE TABLE sighting_match_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sighting_id UUID NOT NULL REFERENCES sightings(id) ON DELETE CASCADE,
  cat_id UUID NOT NULL REFERENCES cats(id) ON DELETE CASCADE,
  similarity REAL NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  source TEXT DEFAULT 'ai',
  reviewer_note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX sighting_match_candidates_sighting_idx ON sighting_match_candidates(sighting_id);
CREATE INDEX sighting_match_candidates_cat_idx ON sighting_match_candidates(cat_id);
CREATE INDEX sighting_match_candidates_status_idx ON sighting_match_candidates(status);

CREATE TABLE sighting_match_golden (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sighting_id UUID NOT NULL REFERENCES sightings(id) ON DELETE CASCADE,
  cat_id UUID NOT NULL REFERENCES cats(id) ON DELETE CASCADE,
  label TEXT NOT NULL CHECK (label IN ('correct', 'incorrect')),
  reviewer_note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX sighting_match_golden_sighting_idx ON sighting_match_golden(sighting_id);
CREATE INDEX sighting_match_golden_cat_idx ON sighting_match_golden(cat_id);
```

### Vector Match Function
```sql
CREATE OR REPLACE FUNCTION match_cats(
  query_embedding vector(512),
  match_threshold float,
  match_count int,
  match_neighbourhood text DEFAULT NULL,
  match_coat_colour text DEFAULT NULL
)
RETURNS TABLE (id uuid, similarity float)
LANGUAGE sql STABLE
AS $$
  SELECT id,
         1 - (embedding <=> query_embedding) AS similarity
  FROM cats
  WHERE embedding IS NOT NULL
    AND (match_neighbourhood IS NULL OR neighbourhood = match_neighbourhood)
    AND (match_coat_colour IS NULL OR coat_colour = match_coat_colour)
    AND 1 - (embedding <=> query_embedding) >= match_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;
```

### Lost Cats Table
```sql
CREATE TABLE lost_cats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cat_name TEXT NOT NULL,
  coat_colour TEXT NOT NULL,
  description TEXT,
  neighbourhood TEXT NOT NULL,
  last_seen_at TIMESTAMP NOT NULL,
  contact_email TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'found', 'archived')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '60 days')
);

CREATE INDEX lost_cats_neighbourhood_idx ON lost_cats(neighbourhood);
CREATE INDEX lost_cats_status_idx ON lost_cats(status);
```

### Lost Cat Photos Table
```sql
CREATE TABLE lost_cat_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lost_cat_id UUID NOT NULL REFERENCES lost_cats(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX lost_cat_photos_lost_cat_id_idx ON lost_cat_photos(lost_cat_id);
```

### Pet Claims Table
```sql
CREATE TABLE pet_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cat_id UUID NOT NULL REFERENCES cats(id) ON DELETE CASCADE,
  submitter_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX pet_claims_cat_id_idx ON pet_claims(cat_id);
CREATE INDEX pet_claims_status_idx ON pet_claims(status);
```

## Step 4: Enable Storage
1. Go to Storage in the Supabase dashboard
2. Create a new bucket called `sightings`
3. Create another bucket called `lost-cats`
4. Make both public (set public access policy)

## Step 5: Set Up Auth
1. Go to Authentication > Providers
2. Enable Email provider
3. Go to Settings > Email Templates
4. Update magic link template if desired

## Step 6: Save Credentials
In your `.env.local` (frontend) and `.env` (backend):
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

You're done! Your Supabase backend is ready.
