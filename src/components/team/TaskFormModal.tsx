'use client'

import { ModalOverlay, ModalCloseButton } from '@/components/ui/ModalOverlay'
import { DEPARTMENTS } from '@/lib/team/constants'
import type { TeamMemberSummary, TeamTaskWithDetails } from '@/types'

interface Props {
  mode: 'create' | 'edit'
  isOpen: boolean
  onClose: () => void
  action: (formData: FormData) => void
  pending: boolean
  task?: TeamTaskWithDetails
  members: TeamMemberSummary[]
  isProjectManager: boolean
}

export function TaskFormModal({
  mode,
  isOpen,
  onClose,
  action,
  pending,
  task,
  members,
  isProjectManager,
}: Props) {
  const isEdit = mode === 'edit'

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <div className="card" style={{ width: 720, maxWidth: '100%', minHeight: 420, position: 'relative' }}>
        <ModalCloseButton onClose={onClose} />
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>
          {isEdit ? 'Edit Task' : 'New Task'}
        </h2>

        <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {isEdit && task && <input type="hidden" name="id" value={task.id} />}

          <div className="form-group">
            <label className="label">Title *</label>
            <input
              name="title"
              className="input"
              placeholder="What needs to be done?"
              defaultValue={task?.title ?? ''}
              required
            />
          </div>

          <div className="form-group">
            <label className="label">Description</label>
            <textarea
              name="description"
              className="input"
              placeholder="Add details…"
              rows={3}
              defaultValue={task?.description ?? ''}
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="label">Priority *</label>
              <select name="priority" className="input" defaultValue={task?.priority ?? 'MEDIUM'} required>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div className="form-group">
              <label className="label">Due Date</label>
              <input
                name="due_date"
                type="date"
                className="input"
                defaultValue={task?.due_date ?? ''}
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="label">Department</label>
              <select name="department" className="input" defaultValue={task?.department ?? ''}>
                <option value="">None</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            {isProjectManager && (
              <div className="form-group">
                <label className="label">Assign To</label>
                <select
                  name="assigned_to"
                  className="input"
                  defaultValue={task?.assigned_to ?? ''}
                >
                  <option value="">Unassigned</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.full_name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="btn btn-ghost">
              Cancel
            </button>
            <button type="submit" disabled={pending} className="btn btn-primary">
              {pending ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  )
}
