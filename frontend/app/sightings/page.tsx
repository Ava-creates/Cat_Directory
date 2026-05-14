'use client'

import { useState } from 'react'
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

export default function SightingFormPage() {
  const [photo, setPhoto] = useState<File | null>(null)
  const [coatColour, setCoatColour] = useState(COAT_COLOURS[0])
  const [healthStatus, setHealthStatus] = useState(HEALTH_STATUS[0])
  const [temperament, setTemperament] = useState(TEMPERAMENT[0])
  const [neighbourhood, setNeighbourhood] = useState(NEIGHBOURHOODS[0])
  const [status, setStatus] = useState<StatusState>({
    type: 'idle',
    message: '',
  })

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!photo) {
      setStatus({ type: 'error', message: 'Please add a photo.' })
      return
    }

    setStatus({ type: 'loading', message: 'Uploading sighting...' })

    const formData = new FormData()
    formData.append('photo', photo)
    formData.append('coat_colour', coatColour)
    formData.append('health_status', healthStatus)
    formData.append('temperament', temperament)
    formData.append('neighbourhood', neighbourhood)
    formData.append('sighted_at', new Date().toISOString())

    try {
      const response = await fetch(`${API_BASE_URL}/api/sightings`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null)
        const errorMessage =
          errorBody?.message || errorBody?.detail || 'Failed to save sighting.'
        throw new Error(errorMessage)
      }

      setStatus({
        type: 'success',
        message: "Thanks! We'll process this shortly.",
      })
      setPhoto(null)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Something went wrong.'
      setStatus({ type: 'error', message })
    }
  }

  return (
    <div className="stack">
      <section className="card">
        <h1>Report a Sighting</h1>
        <p>Submit a quick sighting with a photo and a few details.</p>
      </section>

      <form className="card form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Photo</span>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setPhoto(event.target.files?.[0] ?? null)}
            required
          />
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
          <span>Health status</span>
          <select
            value={healthStatus}
            onChange={(event) => setHealthStatus(event.target.value)}
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
            value={temperament}
            onChange={(event) => setTemperament(event.target.value)}
          >
            {TEMPERAMENT.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Neighbourhood</span>
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

        <button className="button" type="submit" disabled={status.type === 'loading'}>
          {status.type === 'loading' ? 'Submitting...' : 'Submit sighting'}
        </button>

        {status.message ? (
          <div className={`notice ${status.type}`}>{status.message}</div>
        ) : null}
      </form>
    </div>
  )
}
