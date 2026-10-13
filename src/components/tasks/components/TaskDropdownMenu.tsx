import { useState } from 'react'
import { Pencil, Play, CheckCircle, RotateCcw, Trash2, MoreVertical } from 'lucide-react'
import type { Task } from '@/types'

interface TaskDropdownMenuProps {
  task: Task
  canEdit: boolean
  canDelete: boolean
  isPendingUpdate: boolean
  onEdit: () => void
  onStatusChange: (taskId: string, status: Task['status']) => Promise<void>
  onDelete: () => void
}

export function TaskDropdownMenu({
  task,
  canEdit,
  canDelete,
  isPendingUpdate,
  onEdit,
  onStatusChange,
  onDelete,
}: TaskDropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="dropdown-container task-card-actions">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-ghost btn-sm btn-icon"
        title="More actions"
      >
        <MoreVertical size={16} />
      </button>

      {isOpen && (
        <>
          <div 
            className="dropdown-backdrop"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="dropdown-menu">
            {/* Edit option */}
            {canEdit && (
              <button
                type="button"
                onClick={() => {
                  onEdit()
                  setIsOpen(false)
                }}
                className="dropdown-item"
              >
                <Pencil size={14} />
                <span>Edit Task</span>
              </button>
            )}

            {/* Status change options */}
            {task.status === 'TODO' && (
              <button
                type="button"
                onClick={async () => {
                  setIsOpen(false)
                  await onStatusChange(task.id, 'IN_PROGRESS')
                }}
                disabled={isPendingUpdate}
                className="dropdown-item dropdown-item-info"
              >
                <Play size={14} />
                <span>Start Task</span>
              </button>
            )}

            {task.status === 'IN_PROGRESS' && (
              <button
                type="button"
                onClick={async () => {
                  setIsOpen(false)
                  await onStatusChange(task.id, 'DONE')
                }}
                disabled={isPendingUpdate}
                className="dropdown-item dropdown-item-success"
              >
                <CheckCircle size={14} />
                <span>Mark as Done</span>
              </button>
            )}

            {task.status === 'DONE' && (
              <button
                type="button"
                onClick={async () => {
                  setIsOpen(false)
                  await onStatusChange(task.id, 'TODO')
                }}
                disabled={isPendingUpdate}
                className="dropdown-item"
              >
                <RotateCcw size={14} />
                <span>Reopen Task</span>
              </button>
            )}

            {/* Delete option */}
            {canDelete && (
              <>
                <div className="dropdown-divider" />
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false)
                    onDelete()
                  }}
                  disabled={isPendingUpdate}
                  className="dropdown-item dropdown-item-danger"
                >
                  <Trash2 size={14} />
                  <span>Delete Task</span>
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
