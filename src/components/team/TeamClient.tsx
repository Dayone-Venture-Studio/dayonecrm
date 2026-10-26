'use client'

import { useState } from 'react'
import { ModalOverlay } from '@/components/ui/ModalOverlay'
import {
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  resetTeamMemberPassword,
} from '@/features/team/member-actions'
import { DEPARTMENTS } from '@/lib/team/constants'
import { useServerAction } from '@/lib/hooks/useServerAction'
import type { Profile } from '@/types'

interface Props {
  members: Profile[]
}

const ROLE_LABEL: Record<string, string> = {
  EMPLOYEE: 'Employee',
  PROJECT_MANAGER: 'Project Manager',
}

type MemberFormProps = {
  action: (formData: FormData) => void
  pending: boolean
  member?: Profile
  onCancel: () => void
}

function MemberForm({ action, pending, member, onCancel }: MemberFormProps) {
  const isEdit = Boolean(member)

  return (
    <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {isEdit && <input type="hidden" name="id" value={member!.id} />}

      <div className="grid-2">
        <div className="form-group">
          <label className="label">Full Name *</label>
          <input
            name="full_name"
            className="input"
            placeholder="Jane Smith"
            defaultValue={member?.full_name ?? ''}
            required
          />
        </div>
        <div className="form-group">
          <label className="label">Email *</label>
          <input
            name="email"
            type="email"
            className="input"
            placeholder="jane@dayone.com"
            defaultValue={member?.email ?? ''}
            disabled={isEdit}
            required
          />
        </div>
      </div>

      <div className="grid-2">
        <div className="form-group">
          <label className="label">Phone</label>
          <input
            name="phone"
            type="tel"
            className="input"
            placeholder="+1 234 567 8900"
            defaultValue={member?.phone ?? ''}
          />
        </div>
        <div className="form-group">
          <label className="label">Role *</label>
          <select name="role" className="input" defaultValue={member?.role ?? 'EMPLOYEE'} required>
            <option value="EMPLOYEE">Employee</option>
            <option value="PROJECT_MANAGER">Project Manager</option>
          </select>
        </div>
      </div>

      <div className="grid-2">
        <div className="form-group">
          <label className="label">Department *</label>
          <select
            name="department"
            className="input"
            defaultValue={member?.department ?? ''}
            required
          >
            <option value="" disabled>
              Select department
            </option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        {!isEdit && (
          <div className="form-group">
            <label className="label">Temporary Password *</label>
            <input
              name="password"
              type="password"
              className="input"
              placeholder="Min 8 characters"
              minLength={8}
              required
            />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button type="button" onClick={onCancel} className="btn btn-ghost">
          Cancel
        </button>
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Member'}
        </button>
      </div>
    </form>
  )
}

type ResetResult = {
  password: string
  memberId: string
  memberName: string
}

export function TeamClient({ members }: Props) {
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<Profile | null>(null)
  const [deleting, setDeleting] = useState<Profile | null>(null)
  const [resetResult, setResetResult] = useState<ResetResult | null>(null)
  const [resettingId, setResettingId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Replace useTransition with useServerAction for automatic toast notifications
  const [executeCreate, addPending] = useServerAction({
    onSuccess: () => {
      setShowAdd(false)
    },
  })

  const [executeUpdate, editPending] = useServerAction({
    onSuccess: () => {
      setEditing(null)
    },
  })

  const [executeDelete, deletePending] = useServerAction({
    onSuccess: () => {
      setDeleting(null)
    },
  })

  const [executeReset] = useServerAction<ResetResult>({
    onSuccess: (data) => {
      setResettingId(null)
      if (data?.password) {
        setResetResult(data)
        setCopied(false)
      }
    },
    onError: () => {
      setResettingId(null)
    },
  })

  function handleCreate(formData: FormData) {
    const name = String(formData.get('full_name') ?? 'Member')
    executeCreate(() => createTeamMember({}, formData), {
      success: {
        title: 'Member added successfully.',
        description: `“${name}” has been added to the team.`,
      },
      error: (error) => ({
        title: 'Could not add member.',
        description: error,
      }),
    })
  }

  function handleUpdate(formData: FormData) {
    const name = String(formData.get('full_name') ?? 'Member')
    executeUpdate(() => updateTeamMember({}, formData), {
      success: {
        title: 'Member updated successfully.',
        description: `Changes to “${name}” have been saved.`,
      },
      error: (error) => ({
        title: 'Could not update member.',
        description: error,
      }),
    })
  }

  function handleDelete(formData: FormData) {
    const name = deleting?.full_name ?? 'Member'
    executeDelete(() => deleteTeamMember({}, formData), {
      success: {
        title: 'Member deleted successfully.',
        description: `“${name}” has been removed from the team.`,
      },
      error: (error) => ({
        title: 'Could not delete member.',
        description: error,
      }),
    })
  }

  function handleReset(member: Profile) {
    if (resettingId) return
    setResettingId(member.id)
    const formData = new FormData()
    formData.set('id', member.id)
    executeReset(() => resetTeamMemberPassword({}, formData), {
      success: {
        title: 'Password reset.',
        description: `Share the new temporary password with ${member.full_name}.`,
      },
      error: (error) => ({
        title: 'Could not reset password.',
        description: error,
      }),
    })
  }

  async function handleCopyPassword() {
    if (!resetResult?.password) return
    try {
      await navigator.clipboard.writeText(resetResult.password)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard may be unavailable (e.g. insecure context); the field is still selectable.
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <button onClick={() => setShowAdd(true)} className="btn btn-primary">
          + Add Member
        </button>
      </div>

      {members.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <h3>No team members yet</h3>
          <p>Add employees and project managers to build your internal team</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Member</th>
                <th>Role</th>
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
                        {member.full_name?.charAt(0)?.toUpperCase() || 'M'}
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
                    <span
                      className={`badge ${
                        member.role === 'PROJECT_MANAGER' ? 'badge-brand' : 'badge-info'
                      }`}
                    >
                      {ROLE_LABEL[member.role] ?? member.role}
                    </span>
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

      {/* Add member */}
      <ModalOverlay isOpen={showAdd} onClose={() => setShowAdd(false)}>
        <div className="card" style={{ width: '100%', maxWidth: 560 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Add Team Member</h2>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 20 }}>
            They&apos;ll be able to log in immediately with the credentials you set.
          </p>
          <MemberForm
            action={handleCreate}
            pending={addPending}
            onCancel={() => setShowAdd(false)}
          />
        </div>
      </ModalOverlay>

      {/* Edit member */}
      <ModalOverlay isOpen={!!editing} onClose={() => setEditing(null)}>
        <div className="card" style={{ width: '100%', maxWidth: 560 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Edit Team Member</h2>
          {editing && (
            <MemberForm
              action={handleUpdate}
              pending={editPending}
              member={editing}
              onCancel={() => setEditing(null)}
            />
          )}
        </div>
      </ModalOverlay>

      {/* Delete confirmation */}
      <ModalOverlay isOpen={!!deleting} onClose={() => setDeleting(null)}>
        <div className="card" style={{ width: '100%', maxWidth: 440 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Delete Team Member</h2>
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

      {/* Password reset result */}
      <ModalOverlay
        isOpen={!!resetResult}
        onClose={() => {
          setResetResult(null)
          setCopied(false)
        }}
      >
        <div className="card" style={{ width: '100%', maxWidth: 480 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
            Password reset successfully
          </h2>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 16 }}>
            Share this temporary password with{' '}
            <strong style={{ color: 'var(--color-text-primary)' }}>
              {resetResult?.memberName}
            </strong>
            . They will be asked to change it on their next login. This password will not be shown
            again.
          </p>

          <div className="form-group">
            <label className="label">Temporary password</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="input"
                value={resetResult?.password ?? ''}
                readOnly
                onFocus={(event) => event.currentTarget.select()}
                style={{ fontFamily: 'monospace' }}
              />
              <button
                type="button"
                onClick={handleCopyPassword}
                className="btn btn-secondary"
                style={{ whiteSpace: 'nowrap' }}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
            <button
              type="button"
              onClick={() => {
                setResetResult(null)
                setCopied(false)
              }}
              className="btn btn-primary"
            >
              Done
            </button>
          </div>
        </div>
      </ModalOverlay>
    </div>
  )
}
