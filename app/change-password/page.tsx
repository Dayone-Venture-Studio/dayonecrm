'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useActionState } from 'react'
import { changePassword } from '@/features/auth/actions'
import type { ActionState } from '@/types'

export default function ChangePasswordPage() {
  const router = useRouter()
  const [state, formAction, pending] = useActionState<ActionState, FormData>(changePassword, {})

  useEffect(() => {
    if (state?.success && (state.data as { redirectTo?: string } | undefined)?.redirectTo) {
      router.push((state.data as { redirectTo: string }).redirectTo)
      router.refresh()
    }
  }, [state, router])

  const busy = pending

  function handleSubmit(formData: FormData) {
    formAction(formData)
  }

  return (
    <div style={{ width: '100%', maxWidth: 440 }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Change your password</h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
          For security, you must set a new password before continuing. This is required only once.
        </p>
      </div>

      <div className="card">
        {state?.error && (
          <div className="alert alert-error" style={{ marginBottom: 20 }}>
            {state.error}
          </div>
        )}
        {state?.success && (
          <div className="alert alert-success" style={{ marginBottom: 20 }}>
            {state.success} Redirecting…
          </div>
        )}

        <form action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label htmlFor="currentPassword" className="label">
              Current (temporary) password
            </label>
            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              className="input"
              autoComplete="current-password"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword" className="label">
              New password
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              className="input"
              minLength={8}
              autoComplete="new-password"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="label">
              Confirm new password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className="input"
              minLength={8}
              autoComplete="new-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
          >
            {busy ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  )
}