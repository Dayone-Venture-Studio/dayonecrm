'use client'

import { useActionState, useEffect } from 'react'
import { updateTask } from '@/features/tasks/actions'
import { DomainSelectWithQuickAdd } from '@/components/domains/DomainSelectWithQuickAdd'
import { ModalOverlay } from '@/components/ui/ModalOverlay'
import type { ActionState, Task, Domain, WeeklyPlan } from '@/types'

export interface StaffMemberOption {
  user_id: string
  role?: string
  profile: {
    id: string
    full_name: string
    email?: string | null
  } | null
}

interface Props {
  task: Task | null
  onClose: () => void
  domains: Domain[]
  startupId: string
  weeklyPlans: Pick<WeeklyPlan, 'id' | 'week_start' | 'week_end' | 'title' | 'goal'>[]
  staffMembers: StaffMemberOption[]
}

export function TaskEditModal({
  task,
  onClose,
  domains,
  startupId,
  weeklyPlans,
  staffMembers,
}: Props) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(updateTask, {})

  useEffect(() => {
    if (state?.success) {
      onClose()
    }
  }, [state, onClose])

  if (!task) return null

  return (
    <ModalOverlay isOpen={!!task} onClose={onClose}>
      <div className="card w-[640px] max-w-[calc(100vw-48px)] max-h-[90vh] overflow-y-auto bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-[var(--modal-shadow)] p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="m-0 text-lg font-bold text-[var(--color-text-primary)]">
            Edit Task
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-icon text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {state?.error && (
          <div className="alert alert-error mb-4">
            {state.error}
          </div>
        )}

        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="id" value={task.id} />

          <div className="form-group">
            <label className="label">Task Title *</label>
            <input
              name="title"
              defaultValue={task.title}
              className="input"
              required
              placeholder="e.g. Implement user authentication"
            />
          </div>

          <div className="grid-2">
            <DomainSelectWithQuickAdd
              startupId={startupId}
              initialDomains={domains}
              defaultValue={task.domain_id || ''}
            />
            <div className="form-group">
              <label className="label">Priority</label>
              <select name="priority" defaultValue={task.priority} className="input">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="label">Weekly Plan</label>
              <select name="weekly_plan_id" defaultValue={task.weekly_plan_id || ''} className="input">
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
            <div className="form-group">
              <label className="label">Due Date</label>
              <input
                name="due_date"
                type="date"
                defaultValue={task.due_date ? task.due_date.split('T')[0] : ''}
                className="input"
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="label">Assign To</label>
              <select name="assigned_to" defaultValue={task.assigned_to || ''} className="input">
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
            </div>
            <div className="form-group">
              <label className="label">Status</label>
              <select name="status" defaultValue={task.status} className="input">
                <option value="TODO">Todo</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="label">Description</label>
            <textarea
              name="description"
              defaultValue={task.description || ''}
              className="input"
              rows={3}
              placeholder="Task details, acceptance criteria, or links…"
            />
          </div>

          <div className="flex justify-end gap-2.5 mt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isPending}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isPending}>
              {isPending ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  )
}
