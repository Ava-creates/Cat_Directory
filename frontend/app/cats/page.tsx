import Link from 'next/link'
import { API_BASE_URL } from '@/lib/constants'
import ClaimPet from '@/app/components/ClaimPet'

const formatDate = (value?: string | null) => {
  if (!value) return 'Unknown'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown'
  return date.toLocaleDateString()
}

const formatStatus = (value?: string | null) => {
  if (!value) return 'Unknown'
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

const formatValue = (value?: string | null) => value?.trim() || 'Unknown'

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <span>
      <strong className="detail-label">{label}:</strong> {value}
    </span>
  )
}

type Cat = {
  id: string
  primary_photo_url: string
  coat_colour: string
  health_status: string
  temperament: string
  neighbourhood: string
  status: string
  last_seen_at: string
  sighting_count?: number
}

export default async function CatsPage() {
  let cats: Cat[] = []
  let loadError = ''

  try {
    const response = await fetch(`${API_BASE_URL}/api/cats`, { cache: 'no-store' })
    if (!response.ok) {
      loadError = 'Could not load cats right now.'
    } else {
      const data = await response.json()
      cats = Array.isArray(data.cats) ? data.cats : []
    }
  } catch {
    loadError = 'Could not load cats right now.'
  }

  return (
    <div className="stack">
      <section className="card card--page">

        <h1>Cat Directory</h1>
        <p>Browse community cats and recent sightings.</p>
      </section>

      {loadError ? (
        <section className="card">
          <p>{loadError}</p>
        </section>
      ) : null}

      {!loadError && cats.length === 0 ? (
        <section className="card empty-state">
          <span className="empty-state__emoji" aria-hidden="true">
            🐈‍⬛
          </span>
          <h2>No cats yet — the directory is napping</h2>
          <p>
            Be the first to spot a neighbourhood legend. Upload a photo and
            we&apos;ll add them to the hall of fame.
          </p>
          <Link className="button" href="/sightings">
            📸 Report the first sighting
          </Link>
        </section>
      ) : null}

      {cats.length > 0 ? (
        <section className="grid">
          {cats.map((cat) => (
            <article className="lost-card lost-card--interactive" key={cat.id}>
              {cat.primary_photo_url ? (
                <img
                  className="lost-photo"
                  src={cat.primary_photo_url}
                  alt="Cat"
                />
              ) : (
                <div className="lost-photo" />
              )}
              <div>
                <div className="lost-meta">
                  <DetailRow label="Cat type" value={formatStatus(cat.status)} />
                  <DetailRow label="Coat colour" value={formatValue(cat.coat_colour)} />
                  <DetailRow label="Health status" value={formatValue(cat.health_status)} />
                  <DetailRow label="Temperament" value={formatValue(cat.temperament)} />
                  <DetailRow label="Neighbourhood" value={formatValue(cat.neighbourhood)} />
                  <DetailRow label="Last seen" value={formatDate(cat.last_seen_at)} />
                  {cat.sighting_count ? (
                    <DetailRow label="Sightings" value={String(cat.sighting_count)} />
                  ) : null}
                </div>
                <div style={{ marginTop: 8 }}>
                  {/* ClaimPet is a client component that posts a claim for this cat */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <ClaimPet catId={cat.id} />
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : null}
    </div>
  )
}
