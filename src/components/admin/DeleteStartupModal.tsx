'use client'

import { useState, useEffect, useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteStartup } from '@/features/startups/actions'
import { ModalOverlay } from '@/components/ui/ModalOverlay'
import { AlertTriangle, X } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  startupId: string
  startupName: string
}

export function DeleteStartupModal({
  isOpen,
  onClose,
  startupId,
  startupName,
}: Props) {
  const [confirmText, setConfirmText] = useState('')
  const [state, formAction, isPending] = useActionState(deleteStartup, {})
  const router = useRouter()

  const isConfirmValid = confirmText === startupName

  // Handle successful deletion
  useEffect(() => {
    if (state.success) {
      onClose()
      // Redirect to admin dashboard after successful deletion
      router.push('/admin')
    }
  }, [state.success, onClose, router])

  // Reset confirmation text when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setConfirmText('')
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <div
        style={{
          background: 'var(--color-surface)',
          borderRadius: 16,
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--modal-shadow)',
          width: '100%',
          maxWidth: 500,
          maxHeight: 'calc(100dvh - 48px)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                background: 'var(--color-danger-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle
                size={20}
                style={{ color: 'var(--color-danger)' }}
              />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
              Delete Startup
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isPending}
            className="btn-icon"
            style={{ padding: 8 }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form
          action={formAction}
          style={{
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            flex: 1,
            overflowY: 'auto',
          }}
        >
          <input type="hidden" name="startup_id" value={startupId} />

          {/* Warning Message */}
          <div
            style={{
              padding: 16,
              borderRadius: 8,
              background: 'var(--color-danger-subtle)',
              border: '1px solid var(--color-danger)',
            }}
          >
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.5,
                color: 'var(--color-text-primary)',
                margin: 0,
              }}
            >
              <strong>Warning:</strong> This action cannot be undone. Deleting
              this startup will permanently remove:
            </p>
            <ul
              style={{
                margin: '12px 0 0 20px',
                padding: 0,
                fontSize: 13,
                color: 'var(--color-text-secondary)',
              }}
            >
              <li>All team members and their associations</li>
              <li>All tasks and task updates</li>
              <li>All domains and weekly plans</li>
              <li>All activity logs and performance data</li>
            </ul>
          </div>

          {/* Confirmation Input */}
          <div>
            <label
              htmlFor="confirm-text"
              style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 8,
                color: 'var(--color-text-primary)',
              }}
            >
              Type <strong>{startupName}</strong> to confirm:
            </label>
            <input
              id="confirm-text"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Enter startup name"
              disabled={isPending}
              autoComplete="off"
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: 14,
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                background: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
              }}
            />
            {confirmText && !isConfirmValid && (
              <p
                style={{
                  fontSize: 12,
                  color: 'var(--color-danger)',
                  marginTop: 6,
                  marginBottom: 0,
                }}
              >
                Name does not match (case-sensitive)
              </p>
            )}
          </div>

          {/* Error Message */}
          {state.error && (
            <div
              style={{
                padding: 12,
                borderRadius: 8,
                background: 'var(--color-danger-subtle)',
                border: '1px solid var(--color-danger)',
              }}
            >
              <p
                style={{
                  fontSize: 13,
                  color: 'var(--color-danger)',
                  margin: 0,
                }}
              >
                {state.error}
              </p>
            </div>
          )}

          {/* Modal Footer */}
          <div
            style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'flex-end',
              paddingTop: 8,
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isConfirmValid || isPending}
              className="btn btn-danger"
              style={{
                opacity: !isConfirmValid || isPending ? 0.5 : 1,
                cursor:
                  !isConfirmValid || isPending ? 'not-allowed' : 'pointer',
              }}
            >
              {isPending ? 'Deleting...' : 'Delete Startup'}
            </button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  )
}
