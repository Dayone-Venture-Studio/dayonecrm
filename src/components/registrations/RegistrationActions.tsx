'use client'

import { approveRegistration, rejectRegistration } from '@/features/registrations/actions'
import { useServerAction } from '@/lib/hooks/useServerAction'
import type { RegistrationRequestWithStartup } from '@/types'
import { useState } from 'react'

interface Props {
  request: RegistrationRequestWithStartup
}

export function RegistrationActions({ request }: Props) {
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [executeApprove, approvePending] = useServerAction()
  const [executeReject, rejectPending] = useServerAction({
    onSuccess: () => setShowRejectForm(false),
  })

  if (request.status !== 'PENDING') {
    return (
      <span
        className={`badge ${request.status === 'APPROVED' ? 'badge-success' : 'badge-danger'}`}
      >
        {request.status}
      </span>
    )
  }

  const startupName = request.startup?.name ?? 'startup'

  function handleApprove(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    executeApprove(() => approveRegistration({}, formData), {
      success: {
        title: 'Registration approved.',
        description: `“${startupName}” can now log in.`,
      },
      error: (message) => ({ title: 'Could not approve registration.', description: message }),
    })
  }

  function handleReject(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    executeReject(() => rejectRegistration({}, formData), {
      success: {
        title: 'Registration rejected.',
        description: `“${startupName}” was not approved.`,
      },
      error: (message) => ({ title: 'Could not reject registration.', description: message }),
    })
  }

  return (
    <div>
      {!showRejectForm && (
        <div style={{ display: 'flex', gap: 8 }}>
          <form onSubmit={handleApprove}>
            <input type="hidden" name="requestId" value={request.id} />
            <input type="hidden" name="startupId" value={request.startup_id} />
            <button type="submit" disabled={approvePending} className="btn btn-primary btn-sm">
              {approvePending ? 'Approving…' : '✓ Approve'}
            </button>
          </form>
          <button
            onClick={() => setShowRejectForm(true)}
            className="btn btn-danger btn-sm"
          >
            ✕ Reject
          </button>
        </div>
      )}

      {showRejectForm && (
        <form onSubmit={handleReject} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input type="hidden" name="requestId" value={request.id} />
          <input type="hidden" name="startupId" value={request.startup_id} />
          <textarea
            name="rejection_reason"
            className="input"
            placeholder="Reason for rejection…"
            rows={2}
            required
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" disabled={rejectPending} className="btn btn-danger btn-sm">
              {rejectPending ? 'Rejecting…' : 'Confirm Rejection'}
            </button>
            <button
              type="button"
              onClick={() => setShowRejectForm(false)}
              className="btn btn-ghost btn-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
