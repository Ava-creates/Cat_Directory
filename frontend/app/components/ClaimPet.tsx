'use client'

import React, { useState } from 'react'
import { API_BASE_URL } from '@/lib/constants'

type Props = {
  catId: string
}

export default function ClaimPet({ catId }: Props) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE_URL}/api/pet-claims`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cat_id: catId,
          submitter_name: name,
          contact_email: email,
          message,
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.message || 'Failed to submit claim')
      }

      const data = await res.json()
      setSuccess(data?.message || 'Claim submitted')
      setName('')
      setEmail('')
      setMessage('')
      setOpen(false)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button type="button" className="button" style={{ marginTop: 8 }} onClick={() => setOpen(true)}>
        Claim pet
      </button>

      {success ? (
        <div className="notice success" style={{ marginTop: 10 }}>{success}</div>
      ) : null}

      {open ? (
        <div className="modal-overlay">
          <div className="modal card">
            <h3 style={{ marginTop: 0 }}>Claim this pet</h3>
            <form className="form" onSubmit={handleSubmit}>
              <label className="field">
                <span>Your name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </label>

              <label className="field">
                <span>Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>

              <label className="field">
                <span>Message</span>
                <textarea
                  className="field-textarea"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                />
              </label>

              {error ? (
                <div className="notice error">{error}</div>
              ) : null}

              <div className="modal-actions">
                <button type="submit" className="button" disabled={loading}>
                  {loading ? 'Submitting…' : 'Submit claim'}
                </button>
                <button
                  type="button"
                  className="button button--outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
