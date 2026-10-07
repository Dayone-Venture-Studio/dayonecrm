'use client'

import { useActionState, useEffect } from 'react'
import { createTask } from '@/features/tasks/actions'
import { DomainSelectWithQuickAdd } from '@/components/domains/DomainSelectWithQuickAdd'
import { ModalOverlay } from '@/components/ui/ModalOverlay'
import type { ActionState, Domain, WeeklyPlan } from '@/types'

interface StaffMemberEntry {
  user_id: string
  role?: string
  profile: { id: string; full_name: string; email?: string | null } | null
}

interface Props {
  startupId: string
  domains: Domain[]
  weeklyPlans: Pick<WeeklyPlan, 'id' | 'week_start' | 'week_end' | 'title' | 'goal'>[]
  staffMembers: StaffMemberEntry[]
  isFounder?: boolean
  isStaff?: boolean
  currentUserId?: string
  currentPlanId?: string
  onClose: () => void
}

export function TaskCreateModal({
  startupId,
  domains,
  weeklyPlans,
  staffMembers,
  isFounder = false,
  isStaff = false,
  currentUserId,
  currentPlanId,
  onClose,
}: Props) {
  const [createState, createAction, createPending] = useActionState<ActionState, FormData>(createTask, {})

  useEffect(() => {
    if (createState?.success) {
      onClose()
    }
  }, [createState, onClose])

  return (
    <ModalOverlay isOpen={true} onClose={onClose}>
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: 580,
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'var(--color-surface)',
          borderRadius: 12,
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--modal-shadow)',
          padding: 24,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
            Create New Task
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-icon"
            style={{ fontSize: 18, lineHeight: 1 }}
          >
            ✕
          </button>
        </div>

        {createState?.error && (
          <div className="alert alert-error" style={{ marginBottom: 16 }}>
            {createState.error}
          </div>
        )}

        <form action={createAction} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input type="hidden" name="startup_id" value={startupId} />
          {!isFounder && currentPlanId && <input type="hidden" name="weekly_plan_id" value={currentPlanId} />}
          {isStaff && currentUserId && <input type="hidden" name="self_assign" value="true" />}

          <div className="form-group">
            <label className="label">Task Title *</label>
            <input
              name="title"
              className="input"
              required
              placeholder="e.g. Implement user authentication"
            />
          </div>

          <div className="grid-2">
            <DomainSelectWithQuickAdd
              startupId={startupId}
              initialDomains={domains}
            />
            <div className="form-group">
              <label className="label">Priority</label>
              <select name="priority" className="input">
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>

          <div className="grid-2">
            {isFounder && (
              <div className="form-group">
                <label className="label">Weekly Plan</label>
                <select name="weekly_plan_id" defaultValue={currentPlanId || ''} className="input">
                  <option value="">No Plan</option>
                  {weeklyPlans.map((p) => {
                    const startStr = new Date(p.week_start + 'T00:00:00').toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })
                    const endStr = new Date(p.week_end + 'T00:00:00').toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })
                    const label = p.title || p.goal || 'Weekly Sprint'
                    return (
                      <option key={p.id} value={p.id}>
                        {label} ({startStr} → {endStr})
                      </option>
                    )
                  })}
                </select>
              </div>
            )}
            <div className="form-group">
              <label className="label">Due Date</label>
              <input name="due_date" type="date" className="input" />
            </div>
          </div>

          {isFounder && (
            <div className="form-group">
              <label className="label">Assign To</label>
              <select name="assigned_to" className="input">
                <option value="">Unassigned</option>
                {staffMembers.map((m) => {
                  if (!m.profile) return null
                  const roleBadge = m.role ? ` • ${m.role}` : ''
                  const emailStr = m.profile.email ? ` (${m.profile.email})` : ''
                  return (
                    <option key={m.user_id} value={m.user_id}>
                      {m.profile.full_name}{emailStr}{roleBadge}
                    </option>
                  )
                })}
              </select>
              {staffMembers.length === 0 && (
                <span style={{ fontSize: 11.5, color: 'var(--color-text-muted)', marginTop: 4, display: 'block' }}>
                  No staff members added yet. You can assign tasks after adding staff in the Staff page.
                </span>
              )}
            </div>
          )}

          <div className="form-group">
            <label className="label">Description</label>
            <textarea
              name="description"
              className="input"
              rows={3}
              placeholder="Task details, acceptance criteria, or links…"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={createPending}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={createPending}>
              {createPending ? 'Creating…' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  )
}
