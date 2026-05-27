import { revalidatePath } from 'next/cache'

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const apiSecret = process.env.ADMIN_API_SECRET || ''

async function fetchPendingMatches() {
  const response = await fetch(`${apiBaseUrl}/api/moderation/sighting-matches/pending`, {
    headers: {
      'X-API-SECRET': apiSecret,
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('Failed to load pending matches')
  }

  return response.json()
}

async function approveMatch(formData: FormData) {
  'use server'
  const sightingId = String(formData.get('sighting_id') || '')
  const catId = String(formData.get('cat_id') || '')

  if (!sightingId || !catId) {
    return
  }

  await fetch(`${apiBaseUrl}/api/moderation/sighting-matches/${sightingId}/approve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-SECRET': apiSecret,
    },
    body: JSON.stringify({
      cat_id: catId,
      mark_golden: true,
    }),
  })

  revalidatePath('/admin')
}

async function rejectMatch(formData: FormData) {
  'use server'
  const sightingId = String(formData.get('sighting_id') || '')
  const catId = String(formData.get('cat_id') || '')

  if (!sightingId || !catId) {
    return
  }

  await fetch(`${apiBaseUrl}/api/moderation/sighting-matches/${sightingId}/reject`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-SECRET': apiSecret,
    },
    body: JSON.stringify({
      cat_id: catId,
      mark_golden: true,
    }),
  })

  revalidatePath('/admin')
}

async function createNewCat(formData: FormData) {
  'use server'
  const sightingId = String(formData.get('sighting_id') || '')

  if (!sightingId) {
    return
  }

  await fetch(`${apiBaseUrl}/api/moderation/sightings/${sightingId}/create-cat`, {
    method: 'POST',
    headers: {
      'X-API-SECRET': apiSecret,
    },
  })

  revalidatePath('/admin')
}

export default async function AdminPage() {
  const data = await fetchPendingMatches()
  const matches = Array.isArray(data.matches) ? data.matches : []

  return (
    <div className="stack">
      <section className="card">
        <h1>Pending Match Review</h1>
        <p>Approve or reject suggested matches before they are merged.</p>
      </section>

      {matches.length === 0 ? (
        <section className="card">
          <p>No pending matches right now.</p>
        </section>
      ) : (
        matches.map((match: any) => (
          <section className="card" key={match.id}>
            <h2>Similarity: {Number(match.similarity || 0).toFixed(3)}</h2>
            <div className="grid">
              <div>
                <h3>Sighting</h3>
                {match.sighting?.photo_url ? (
                  <img
                    src={match.sighting.photo_url}
                    alt="Sighting"
                    style={{ width: '100%', borderRadius: '18px' }}
                  />
                ) : (
                  <p>No photo available.</p>
                )}
                <p>Coat: {match.sighting?.coat_colour || 'Unknown'}</p>
                <p>Neighbourhood: {match.sighting?.neighbourhood || 'Unknown'}</p>
              </div>
              <div>
                <h3>Candidate Cat</h3>
                {match.cat?.primary_photo_url ? (
                  <img
                    src={match.cat.primary_photo_url}
                    alt="Cat"
                    style={{ width: '100%', borderRadius: '18px' }}
                  />
                ) : (
                  <p>No photo available.</p>
                )}
                <p>Coat: {match.cat?.coat_colour || 'Unknown'}</p>
                <p>Neighbourhood: {match.cat?.neighbourhood || 'Unknown'}</p>
              </div>
            </div>
            <div className="actions">
              <form action={approveMatch}>
                <input type="hidden" name="sighting_id" value={match.sighting_id} />
                <input type="hidden" name="cat_id" value={match.cat_id} />
                <button className="button" type="submit">Approve</button>
              </form>
              <form action={rejectMatch}>
                <input type="hidden" name="sighting_id" value={match.sighting_id} />
                <input type="hidden" name="cat_id" value={match.cat_id} />
                <button className="button" type="submit">Reject</button>
              </form>
              <form action={createNewCat}>
                <input type="hidden" name="sighting_id" value={match.sighting_id} />
                <button className="button" type="submit">Create new cat</button>
              </form>
            </div>
          </section>
        ))
      )}
    </div>
  )
}
