'use client'

import { useEffect, useState } from 'react'
import {
  API_BASE_URL,
  COAT_COLOURS,
  HEALTH_STATUS,
  TEMPERAMENT,
  NEIGHBOURHOODS,
} from '@/lib/constants'

type StatusState = {
  type: 'idle' | 'loading' | 'success' | 'error'
  message: string
}

type LostCat = {
  id: string
  cat_name: string
  coat_colour: string
  description: string
  neighbourhood: string
  last_seen_at: string
  contact_email: string
  status: string
  photo_url?: string | null
}

export default function LostCatsPage() {
  const [catName, setCatName] = useState('')
  const [coatColour, setCoatColour] = useState(COAT_COLOURS[0])
  const [description, setDescription] = useState('')
  const [neighbourhood, setNeighbourhood] = useState(NEIGHBOURHOODS[0])
  const [lastSeenAt, setLastSeenAt] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [photos, setPhotos] = useState<File[]>([])
  const [status, setStatus] = useState<StatusState>({
    type: 'idle',
    message: '',
  })
  const [lostCats, setLostCats] = useState<LostCat[]>([])
  const [activeLostCatId, setActiveLostCatId] = useState<string | null>(null)
  const [lostSightingPhoto, setLostSightingPhoto] = useState<File | null>(null)
  const [lostSightingHealth, setLostSightingHealth] = useState(HEALTH_STATUS[0])
  const [lostSightingTemperament, setLostSightingTemperament] = useState(TEMPERAMENT[0])
  const [lostSightingNeighbourhood, setLostSightingNeighbourhood] = useState(NEIGHBOURHOODS[0])
  const [lostSightingStatus, setLostSightingStatus] = useState<StatusState>({
    type: 'idle',
    message: '',
  })

  useEffect(() => {
    const loadLostCats = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/lost-cats`)
        if (!response.ok) {
          return
        }
        const data = await response.json()
        setLostCats(data.lost_cats || [])
      } catch {
        // Ignore fetch errors for now
      }
    }

    loadLostCats()
  }, [])

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = Array.from(event.target.files || [])
    setPhotos(fileList.slice(0, 3))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (photos.length === 0) {
      setStatus({ type: 'error', message: 'Please add at least one photo.' })
      return
    }

    if (!lastSeenAt) {
      setStatus({ type: 'error', message: 'Please add the last seen date.' })
      return
    }

    setStatus({ type: 'loading', message: 'Submitting lost cat report...' })

    const formData = new FormData()
    photos.forEach((photo) => formData.append('photos', photo))
    formData.append('cat_name', catName)
    formData.append('coat_colour', coatColour)
    formData.append('description', description)
    formData.append('neighbourhood', neighbourhood)
    formData.append('last_seen_at', new Date(lastSeenAt).toISOString())
    formData.append('contact_email', contactEmail)

    try {
      const response = await fetch(`${API_BASE_URL}/api/lost-cats`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null)
        const errorMessage =
          errorBody?.message || errorBody?.detail || 'Failed to submit report.'
        throw new Error(errorMessage)
      }

      setStatus({
        type: 'success',
        message: 'Lost cat report submitted. We will notify you if we find a match.',
      })
      setCatName('')
      setDescription('')
      setContactEmail('')
      setLastSeenAt('')
      setPhotos([])
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Something went wrong.'
      setStatus({ type: 'error', message })
    }
  }

  const handleLostSightingSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
    lostCat: LostCat,
  ) => {
    event.preventDefault()

    setLostSightingStatus({ type: 'loading', message: 'Submitting sighting...' })

    const formData = new FormData()
    if (lostSightingPhoto) {
      formData.append('photo', lostSightingPhoto)
    }
    formData.append('coat_colour', lostCat.coat_colour)
    formData.append('health_status', lostSightingHealth)
    formData.append('temperament', lostSightingTemperament)
    formData.append('neighbourhood', lostSightingNeighbourhood)
    formData.append('sighted_at', new Date().toISOString())
    formData.append('lost_cat_id', lostCat.id)

    try {
      const response = await fetch(`${API_BASE_URL}/api/sightings`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null)
        const errorMessage =
          errorBody?.message || errorBody?.detail || 'Failed to submit sighting.'
        throw new Error(errorMessage)
      }

      setLostSightingStatus({
        type: 'success',
        message: 'Thanks! We will share this with the owner.',
      })
      setLostSightingPhoto(null)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Something went wrong.'
      setLostSightingStatus({ type: 'error', message })
    }
  }

  return (
    <div className="stack">
      <section className="card">
        <h1>Lost Cats</h1>
        <p>
          Report a lost cat and browse recent reports from your neighborhood.
        </p>
      </section>

      <section className="card">
        <h2>Report a Lost Cat</h2>
        <form className="form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Cat's name</span>
            <input
              type="text"
              value={catName}
              onChange={(event) => setCatName(event.target.value)}
              required
            />
          </label>

          <label className="field">
            <span>Photos (up to 3)</span>
            <input type="file" accept="image/*" multiple onChange={handlePhotoChange} />
          </label>

          <label className="field">
            <span>Coat colour</span>
            <select
              value={coatColour}
              onChange={(event) => setCoatColour(event.target.value)}
            >
              {COAT_COLOURS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Distinguishing features</span>
            <input
              type="text"
              maxLength={200}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="e.g., white patch on nose, green collar"
              required
            />
          </label>

          <label className="field">
            <span>Neighbourhood last seen</span>
            <select
              value={neighbourhood}
              onChange={(event) => setNeighbourhood(event.target.value)}
            >
              {NEIGHBOURHOODS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Last seen date</span>
            <input
              type="date"
              value={lastSeenAt}
              onChange={(event) => setLastSeenAt(event.target.value)}
              required
            />
          </label>

          <label className="field">
            <span>Contact email</span>
            <input
              type="email"
              value={contactEmail}
              onChange={(event) => setContactEmail(event.target.value)}
              required
            />
          </label>

          <button className="button" type="submit" disabled={status.type === 'loading'}>
            {status.type === 'loading' ? 'Submitting...' : 'Submit report'}
          </button>

          {status.message ? (
            <div className={`notice ${status.type}`}>{status.message}</div>
          ) : null}
        </form>
      </section>

      <section className="card">
        <h2>Lost Cat Board</h2>
        {lostCats.length === 0 ? (
          <p>No active reports yet. Check back soon.</p>
        ) : (
          <div className="grid">
            {lostCats.map((cat) => (
              <div className="lost-card" key={cat.id}>
                <div>
                  {cat.photo_url ? (
                    <img
                      className="lost-photo"
                      src={cat.photo_url}
                      alt={`${cat.cat_name} photo`}
                    />
                  ) : null}
                  <h3>{cat.cat_name}</h3>
                  <p>{cat.coat_colour} · {cat.neighbourhood}</p>
                  <p>Last seen: {new Date(cat.last_seen_at).toLocaleDateString()}</p>
                  <p className="muted">{cat.description}</p>
                </div>
                <div className="lost-meta">
                  <span className="badge">{cat.status}</span>
                  <button
                    className="button"
                    type="button"
                    onClick={() => {
                      setActiveLostCatId((current) => (current === cat.id ? null : cat.id))
                      setLostSightingStatus({ type: 'idle', message: '' })
                      setLostSightingPhoto(null)
                    }}
                  >
                    Seen this cat?
                  </button>
                </div>
                {activeLostCatId === cat.id ? (
                  <form
                    className="form"
                    onSubmit={(event) => handleLostSightingSubmit(event, cat)}
                  >
                    <label className="field">
                      <span>Photo (optional)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) =>
                          setLostSightingPhoto(event.target.files?.[0] ?? null)
                        }
                      />
                    </label>

                    <label className="field">
                      <span>Health status</span>
                      <select
                        value={lostSightingHealth}
                        onChange={(event) => setLostSightingHealth(event.target.value)}
                      >
                        {HEALTH_STATUS.map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="field">
                      <span>Temperament</span>
                      <select
                        value={lostSightingTemperament}
                        onChange={(event) => setLostSightingTemperament(event.target.value)}
                      >
                        {TEMPERAMENT.map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="field">
                      <span>Neighbourhood seen</span>
                      <select
                        value={lostSightingNeighbourhood}
                        onChange={(event) => setLostSightingNeighbourhood(event.target.value)}
                      >
                        {NEIGHBOURHOODS.map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </label>

                    <button
                      className="button"
                      type="submit"
                      disabled={lostSightingStatus.type === 'loading'}
                    >
                      {lostSightingStatus.type === 'loading'
                        ? 'Submitting...'
                        : 'Submit sighting'}
                    </button>

                    {lostSightingStatus.message ? (
                      <div className={`notice ${lostSightingStatus.type}`}>
                        {lostSightingStatus.message}
                      </div>
                    ) : null}
                  </form>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
