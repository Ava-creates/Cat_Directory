# Cat Directory — MVP Product Requirements Document

**Version:** 1.0 — MVP Scope
**Status:** Draft
**Date:** May 2026

---

## Overview

A community web app where people submit cat sightings. An AI pipeline groups sightings of the same cat into individual profiles. The public can browse a directory of cats in their neighbourhood, report lost cats, and find basic welfare resources.

**Deployment cost: $0** — built on free tiers only.

---

## MVP Principles

- Build only what is needed to validate the core idea.
- No auth complexity — use magic-link email login only.
- No admin panel — moderation done directly in the Supabase dashboard for now.
- AI runs asynchronously — if it's slow or fails, the sighting still saves.
- Ship fast, cut scope ruthlessly.

---

## Tech Stack (Free Tier)

| Layer | Tool | Why |
|---|---|---|
| Frontend | Next.js on Vercel | Free hosting, easy deployment |
| Backend | FastAPI on Railway or Render | Free tier, Python, async support for AI pipeline |
| Database | Supabase (Postgres + pgvector) | Free, pgvector built in for embeddings |
| File storage | Supabase Storage | 1 GB free, enough for early photos |
| AI embeddings | Hugging Face Inference API | Free CLIP embeddings for image matching |
| Email | Resend | 3,000 free emails/month |

No auth library needed. No sessions. No JWTs.

---

## User Roles (MVP — No Auth)

| Role | How they access it |
|---|---|
| **Visitor** | No login — can browse directory, lost cats, and resources |
| **Submitter** | No login — can submit sightings anonymously, lost cat reports and pet claims require an email address |
| **Moderator (you)** | Simple password-protected `/admin` route — approve claims and manage content directly in Supabase |

---

## Pages & Features

### 1. Home Page
- Brief description of what Cat Directory is.
- Links to: Browse Cats, Report a Sighting, Lost Cats, Resources.
- Show a count of cats in the directory (e.g., "127 cats logged so far").

---

### 2. Submit a Sighting
**No login required — fully anonymous.**

A simple form with exactly these fields:

| Field | Input |
|---|---|
| Photo | Image upload (required) |
| Coat colour | Dropdown — Black / White / Orange / Grey / Tabby / Tortoiseshell / Calico / Bi-colour / Other |
| Health status | Dropdown — Healthy / Minor injury / Looks unwell / Unknown |
| Temperament | Dropdown — Friendly / Shy / Feral / Unknown |
| Neighbourhood | Dropdown — predefined list of neighbourhoods in your city (e.g. "Riverdale", "Mill Woods") |

On submit:
- Save the sighting to the DB with the selected neighbourhood stored directly — no geocoding needed.
- Show confirmation: "Thanks! We'll process this shortly."
- Trigger the AI pipeline in the background (see AI section).

**MVP limits:** No rate limiting for now. Add it later if spam is a problem.

---

### 3. Cat Directory (Main Page)
**No login needed.**

A grid of cat cards. Each card shows:
- Photo
- Coat colour
- Neighbourhood (the dropdown value the submitter selected)
- Status — Pet · Community Cat · Unknown
- Last seen date

Clicking a card opens a simple **Cat Detail Page** showing:
- All photos from all sightings of this cat
- All attributes
- Sighting history (date + neighbourhood only)
- A "This is my cat" button (sends a simple claim — see below)

**MVP filtering:** Just a neighbourhood dropdown filter. No fancy search yet.

> **Note on the neighbourhood list:** Hardcode the list of neighbourhoods as a constant in the codebase to start. When you need to add or remove one, just update the file and redeploy. No DB table needed until the list grows unwieldy.

---

### 4. Pet Claim
**No login required — email address collected instead.**

User clicks "This is my cat" on a cat detail page. A simple form:
- Their name
- Their email address (used to notify them of the moderator's decision)
- Short message: "Why do you think this is your cat?"

This saves a row to a `pet_claims` table with status `pending`. You review it in Supabase and manually flip the cat's status to `pet` if you approve. No built-out moderator UI needed for MVP.

---

### 5. Lost Cat Page
**Two sub-sections:**

#### Report a Lost Cat (no login — email required)
Form fields:
- Cat's name
- Up to 3 photos
- Coat colour (same dropdown)
- Short description of distinguishing features (free text, 200 chars)
- Neighbourhood last seen (same dropdown as the sighting form)
- Your contact email (shown publicly on the listing)

Saved immediately and published to the lost cat board.

#### Lost Cat Board (no login)
- Grid of active lost cat reports.
- Each card: name, photo, neighbourhood, date lost, contact email.
- Reports auto-archive after 60 days. Owner can manually mark as "Found".

**MVP AI matching:** When a lost cat report is submitted, run it against the last 30 days of sightings and email the owner if there's a likely match. No in-app notification UI — just an email.

---

### 6. Resources Page
**Static content — no CMS needed for MVP. Just hardcode it.**

Three sections:

**Local Shelters**
A simple list: name, phone, website. You update this by editing the page directly.

**Spay / Neuter & TNR Services**
Same format — list of local services with contact info.

**What to Do If You Find a Cat**
A short article covering:
- How to tell if a cat is stray, feral, or lost.
- Don't bring it inside immediately — check the directory first.
- How to safely help without making things worse.
- When to call animal control vs. a rescue.

---

## AI Pipeline (MVP — Keep It Simple)

The AI does two things: **merge sightings into cats** and **match lost cats to sightings**.

### How Merging Works

When a sighting is submitted:

1. Call the Hugging Face CLIP API to get a 512-dim embedding for the photo.
2. Compare against embeddings of all existing cats using cosine similarity (via Supabase `pgvector`).
3. Also check: does the coat colour match?
4. If best match score is above **0.75** AND coat colours match → merge sighting into that cat (update last seen, add photo to gallery).
5. If no good match → create a new cat record.

That's it. No complex scoring for MVP — just image similarity + coat colour check.

### How Lost Cat Matching Works

When a lost cat report is submitted:

1. Get embeddings for the lost cat's photos.
2. Compare against all sightings from the past 30 days.
3. If any sighting scores above **0.70** → email the owner: "We found a possible match — Cat #N was seen in [neighbourhood] on [date]. [Link]"

### Fallback

If the Hugging Face API is down: save the sighting, mark embedding as `pending`, retry via a Vercel cron job (once per hour). The directory still works — the sighting just won't be merged until the retry succeeds.

---

## Data Model

Four tables. No users table.

```
sightings
  id, photo_url, embedding (vector 512),
  coat_colour, health_status, temperament, neighbourhood,
  cat_id (nullable — set after AI merging),
  sighted_at, created_at

cats
  id, primary_photo_url, coat_colour, health_status, temperament,
  neighbourhood, status (pet / community_cat / unknown),
  last_seen_at, sighting_count, embedding (vector 512), created_at

lost_cats
  id, cat_name, coat_colour, description, neighbourhood,
  last_seen_at, contact_email, status (active / found / archived),
  created_at, expires_at

pet_claims
  id, cat_id, submitter_name, contact_email, message,
  status (pending / approved / denied), created_at
```

---

## What You Are NOT Building in MVP

Skip these entirely. Revisit if the app gets traction.

- User accounts or auth of any kind.
- Moderator dashboard UI — use Supabase directly for now.
- In-app notifications — email only.
- Map with exact location pins.
- Sighting rate limiting.
- Comment / tip submission on lost cat listings.
- Events calendar — just a static placeholder on the resources page.
- Native mobile app.

---

## Build Order

Build in this sequence — each step is independently usable:

1. **Supabase setup** — schema, storage bucket, auth (magic link).
2. **Sighting form** — saves to DB, no AI yet.
3. **Cat directory page** — shows all cats (all separate until merging is added).
4. **AI pipeline** — add CLIP embeddings + merging logic.
5. **Cat detail page** — photo gallery, attributes, sighting history.
6. **Lost cat form + board.**
7. **AI lost cat matching + email notification.**
8. **Pet claim form** — saves to DB, you approve manually in Supabase.
9. **Resources page** — static content, write it last.

---

## Definition of Done (MVP Launch)

The MVP is ready to share when all of these are true:

- [ ] A user can submit a sighting and see it appear in the directory.
- [ ] The AI merges obvious duplicates (same cat, different days).
- [ ] A user can report a lost cat and it appears on the lost cat board.
- [ ] The owner gets an email if a likely sighting match is found.
- [ ] Anyone can browse the cat directory without logging in.
- [ ] The resources page has at least local shelter info.
- [ ] The whole thing works on mobile.
- [ ] Everything runs on free-tier infrastructure.
