'use client'

import { useState } from 'react'
import { ModalOverlay } from '@/components/ui/ModalOverlay'
import {
  createVentureManager,
  updateVentureManager,
  deleteVentureManager,
} from '@/features/venture-managers/actions'
import { resetTeamMemberPassword } from '@/features/team/member-actions'
import { useServerAction } from '@/lib/hooks/useServerAction'
import type { Profile } from '@/types'

interface Props {
  members: Profile[]
}

type ResetResult = {
  password: string
  memberId: string
  memberName: string
}

export function VentureManagersClient({ members }: Props) {
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<Profile | null>(null)
  const [deleting, setDeleting] = useState<Profile | null>(null)
  const [resetResult, setResetResult] = useState<ResetResult | null>(null)
  const [resettingId, setResettingId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const [executeCreate, addPending] = useServerAction({
    onSuccess: () => setShowAdd(false),
  })
  const [executeUpdate, editPending] = useServerAction({
    onSuccess: () => setEditing(null),
  })
  const [executeDelete, deletePending] = useServerAction({
    onSuccess: () => setDeleting(null),
  })
  const [executeReset] = useServerAction<ResetResult>({
    onSuccess: (data) => {
      setResettingId(null)
      if (data?.password) {
        setResetResult(data)
        setCopied(false)
      }
    },
    onError: () => setResettingId(null),
  })

  function handleCreate(formData: FormData) {
    const name = String(formData.get('full_name') ?? 'Venture Manager')
    executeCreate(() => createVentureManager({}, formData), {
      success: { title: 'Venture manager added.', description: `“${name}” has been added.` },
      error: (error) => ({ title: 'Could not add venture manager.', description: error }),
    })
  }

  function handleUpdate(formData: FormData) {
    const name = String(formData.get('full_name') ?? 'Venture Manager')
    executeUpdate(() => updateVentureManager({}, formData), {
      success: { title: 'Updated.', description: `Changes to “${name}” saved.` },
      error: (error) => ({ title: 'Could not update.', description: error }),
    })
  }

  function handleDelete(formData: FormData) {
    const name = deleting?.full_name ?? 'Venture Manager'
    executeDelete(() => deleteVentureManager({}, formData), {
      success: { title: 'Deleted.', description: `“${name}” removed.` },
      error: (error) => ({ title: 'Could not delete.', description: error }),
    })
  }

  function handleReset(member: Profile) {
    if (resettingId) return
    setResettingId(member.id)
    const formData = new FormData()
    formData.set('id', member.id)
    executeReset(() => resetTeamMemberPassword({}, formData), {
      success: { title: 'Password reset.', description: 'Share the temporary password.' },
      error: (error) => ({ title: 'Could not reset password.', description: error }),
    })
  }

  async function handleCopyPassword() {
    if (!resetResult?.password) return
    try {
      await navigator.clipboard.writeText(resetResult.password)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <button onClick={() => setShowAdd(true)} className="btn btn-primary">
          + Add Venture Manager
        </button>
      </div>

      {members.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🧭</div>
          <h3>No venture managers yet</h3>
          <p>Add venture managers to oversee the portfolio.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Member</th>
                <th>Department</th>
                <th>Phone</th>
                <th>Joined</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        className="avatar avatar-sm"
                        style={{
                          background: 'linear-gradient(135deg, #ca2f2b 0%, #9e1f1c 100%)',
                          color: '#ffffff',
                          fontWeight: 700,
                        }}
                      >
                        {member.full_name?.charAt(0)?.toUpperCase() || 'V'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          {member.full_name}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                          {member.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    {member.department ? (
                      <span className="badge badge-neutral">{member.department}</span>
                    ) : (
                      <span style={{ color: 'var(--color-text-muted)' }}>—</span>
                    )}
                  </td>
                  <td>{member.phone || '—'}</td>
                  <td style={{ fontSize: 12 }}>
                    {new Date(member.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => setEditing(member)}
                        className="btn btn-secondary btn-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleReset(member)}
                        className="btn btn-secondary btn-sm"
                        disabled={resettingId !== null}
                      >
                        {resettingId === member.id ? 'Resetting…' : 'Reset Password'}
                      </button>
                      <button
                        onClick={() => setDeleting(member)}
                        className="btn btn-danger btn-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add */}
      <ModalOverlay isOpen={showAdd} onClose={() => setShowAdd(false)}>
        <div className="card" style={{ width: '100%', maxWidth: 560 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Add Venture Manager</h2>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 20 }}>
            They&apos;ll be able to log in immediately with the credentials you set.
          </p>
          <form action={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="grid-2">
              <div className="form-group">
                <label className="label">Full Name *</label>
                <input name="full_name" className="input" placeholder="Jane Smith" required />
              </div>
              <div className="form-group">
                <label className="label">Email *</label>
                <input name="email" type="email" className="input" placeholder="jane@dayone.com" required />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="label">Phone</label>
                <input name="phone" type="tel" className="input" placeholder="+1 234 567 8900" />
              </div>
              <div className="form-group">
                <label className="label">Department</label>
                <input name="department" className="input" placeholder="Portfolio" />
              </div>
            </div>
            <div className="form-group">
              <label className="label">Temporary Password *</label>
              <input name="password" type="password" className="input" placeholder="Min 8 characters" minLength={8} required />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowAdd(false)} className="btn btn-ghost">
                Cancel
              </button>
              <button type="submit" disabled={addPending} className="btn btn-primary">
                {addPending ? 'Saving…' : 'Add Venture Manager'}
              </button>
            </div>
          </form>
        </div>
      </ModalOverlay>

      {/* Edit */}
      <ModalOverlay isOpen={!!editing} onClose={() => setEditing(null)}>
        <div className="card" style={{ width: '100%', maxWidth: 560 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Edit Venture Manager</h2>
          {editing && (
            <form action={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <input type="hidden" name="id" value={editing.id} />
              <div className="grid-2">
                <div className="form-group">
                  <label className="label">Full Name *</label>
                  <input name="full_name" className="input" defaultValue={editing.full_name} required />
                </div>
                <div className="form-group">
                  <label className="label">Phone</label>
                  <input name="phone" type="tel" className="input" defaultValue={editing.phone ?? ''} />
                </div>
              </div>
              <div className="form-group">
                <label className="label">Department</label>
                <input name="department" className="input" defaultValue={editing.department ?? ''} />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setEditing(null)} className="btn btn-ghost">
                  Cancel
                </button>
                <button type="submit" disabled={editPending} className="btn btn-primary">
                  {editPending ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </ModalOverlay>

      {/* Delete */}
      <ModalOverlay isOpen={!!deleting} onClose={() => setDeleting(null)}>
        <div className="card" style={{ width: '100%', maxWidth: 440 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Delete Venture Manager</h2>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
            This permanently deletes{' '}
            <strong style={{ color: 'var(--color-text-primary)' }}>{deleting?.full_name}</strong>{' '}
            and their login account. This cannot be undone.
          </p>
          <form
            action={handleDelete}
            style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12 }}
          >
            <input type="hidden" name="id" value={deleting?.id ?? ''} />
            <button type="button" onClick={() => setDeleting(null)} className="btn btn-ghost">
              Cancel
            </button>
            <button type="submit" disabled={deletePending} className="btn btn-danger">
              {deletePending ? 'Deleting…' : 'Delete Permanently'}
            </button>
          </form>
        </div>
      </ModalOverlay>

      {/* Reset password result */}
      <ModalOverlay isOpen={!!resetResult} onClose={() => { setResetResult(null); setCopied(false) }}>
        <div className="card" style={{ width: '100%', maxWidth: 480 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Password reset successfully</h2>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 16 }}>
            Share this temporary password with{' '}
            <strong style={{ color: 'var(--color-text-primary)' }}>{resetResult?.memberName}</strong>.
            They will be asked to change it on their next login.
          </p>
          <div className="form-group">
            <label className="label">Temporary password</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="input" value={resetResult?.password ?? ''} readOnly onFocus={(e) => e.currentTarget.select()} style={{ fontFamily: 'monospace' }} />
              <button type="button" onClick={handleCopyPassword} className="btn btn-secondary" style={{ whiteSpace: 'nowrap' }}>
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
            <button type="button" onClick={() => { setResetResult(null); setCopied(false) }} className="btn btn-primary">
              Done
            </button>
          </div>
        </div>
      </ModalOverlay>
    </div>
  )
}