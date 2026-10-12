'use client'

import { useTransition, useState } from 'react'
import { ModalOverlay } from '@/components/ui/ModalOverlay'
import {
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
} from '@/features/team/member-actions'
import { DEPARTMENTS } from '@/lib/team/constants'
import type { Profile } from '@/types'

interface Props {
  members: Profile[]
}

const ROLE_LABEL: Record<string, string> = {
  EMPLOYEE: 'Employee',
  PROJECT_MANAGER: 'Project Manager',
}

type Banner = { type: 'success' | 'error'; message: string } | null

type MemberFormProps = {
  action: (formData: FormData) => void
  error?: string
  pending: boolean
  member?: Profile
  onCancel: () => void
}

function MemberForm({ action, error, pending, member, onCancel }: MemberFormProps) {
  const isEdit = Boolean(member)

  return (
    <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {isEdit && <input type="hidden" name="id" value={member!.id} />}

      {error && <div className="alert alert-error">{error}</div>}

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

export function TeamClient({ members }: Props) {
  const [banner, setBanner] = useState<Banner>(null)
  const [addError, setAddError] = useState<string | undefined>()
  const [editError, setEditError] = useState<string | undefined>()
  const [deleteError, setDeleteError] = useState<string | undefined>()

  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<Profile | null>(null)
  const [deleting, setDeleting] = useState<Profile | null>(null)

  const [addPending, startAdd] = useTransition()
  const [editPending, startEdit] = useTransition()
  const [deletePending, startDelete] = useTransition()

  function handleCreate(formData: FormData) {
    setAddError(undefined)
    setBanner(null)
    startAdd(async () => {
      const result = await createTeamMember({}, formData)
      if (result.error) {
        setAddError(result.error)
      } else {
        setBanner({ type: 'success', message: result.success ?? 'Member added.' })
        setShowAdd(false)
      }
    })
  }

  function handleUpdate(formData: FormData) {
    setEditError(undefined)
    setBanner(null)
    startEdit(async () => {
      const result = await updateTeamMember({}, formData)
      if (result.error) {
        setEditError(result.error)
      } else {
        setBanner({ type: 'success', message: result.success ?? 'Member updated.' })
        setEditing(null)
      }
    })
  }

  function handleDelete(formData: FormData) {
    setDeleteError(undefined)
    setBanner(null)
    startDelete(async () => {
      const result = await deleteTeamMember({}, formData)
      if (result.error) {
        setDeleteError(result.error)
      } else {
        setBanner({ type: 'success', message: result.success ?? 'Member deleted.' })
        setDeleting(null)
      }
    })
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <button onClick={() => setShowAdd(true)} className="btn btn-primary">
          + Add Member
        </button>
      </div>

      {banner && (
        <div className={`alert alert-${banner.type}`} style={{ marginBottom: 16 }}>
          {banner.message}
        </div>
      )}

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
            error={addError}
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
              error={editError}
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
          {deleteError && (
            <div className="alert alert-error" style={{ marginBottom: 12 }}>
              {deleteError}
            </div>
          )}
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
    </div>
  )
}
