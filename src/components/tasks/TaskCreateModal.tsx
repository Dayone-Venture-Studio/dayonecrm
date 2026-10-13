'use client'

import { createTask } from '@/features/tasks/actions'
import { DomainSelectWithQuickAdd } from '@/components/domains/DomainSelectWithQuickAdd'
import { ModalOverlay } from '@/components/ui/ModalOverlay'
import { useServerAction } from '@/lib/hooks/useServerAction'
import type { Domain, WeeklyPlan } from '@/types'

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
  const [executeCreate, createPending] = useServerAction({
    onSuccess: () => {
      onClose()
    },
  })

  function handleSubmit(formData: FormData) {
    const title = String(formData.get('title') ?? 'Task')
    executeCreate(() => createTask({}, formData), {
      success: {
        title: 'Task created successfully.',
        description: `“${title}” has been added.`,
      },
      error: (error) => ({
        title: 'Could not create task.',
        description: error,
      }),
    })
  }

  return (
    <ModalOverlay isOpen={true} onClose={onClose}>
      <div className="card w-[640px] max-w-[calc(100vw-48px)] max-h-[90vh] overflow-y-auto bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-[var(--modal-shadow)] p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="m-0 text-lg font-bold text-[var(--color-text-primary)]">
            Create New Task
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-icon text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <form action={handleSubmit} className="flex flex-col gap-4">
          <input type="hidden" name="startup_id" value={startupId} />
          {!isFounder && currentPlanId && <input type="hidden" name="weekly_plan_id" value={currentPlanId} />}
          {isStaff && currentUserId && <input type="hidden" name="self_assign" value="true" />}

          <div className="form-group mb-4">
            <label className="label">Task Title *</label>
            <input
              name="title"
              className="input"
              required
              placeholder="e.g. Implement user authentication"
            />
          </div>

          <div className="form-group mb-4">
            <label className="label">Description</label>
            <textarea
              name="description"
              className="input"
              rows={3}
              placeholder="Task details, acceptance criteria, or links…"
            />
          </div>

          <div className="grid-2 mb-4">
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
            <div className="form-group mb-4">
              <label className="label">Due Date</label>
              <input name="due_date" type="date" className="input" />
            </div>
          </div>

          {isFounder && (
            <div className="form-group mb-4">
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
                <span className="block mt-1 text-[11.5px] text-[var(--color-text-muted)]">
                  No staff members added yet. You can assign tasks after adding staff in the Staff page.
                </span>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2.5 mt-2">
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
