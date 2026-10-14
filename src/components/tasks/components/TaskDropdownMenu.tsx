import { useState } from 'react'
import { Pencil, Play, CheckCircle, RotateCcw, Trash2, MoreVertical } from 'lucide-react'
import type { Task } from '@/types'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

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
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    type: 'reopen' | 'markDone' | 'delete' | null
  }>({ isOpen: false, type: null })

  const openConfirmDialog = (type: 'reopen' | 'markDone' | 'delete') => {
    setConfirmDialog({ isOpen: true, type })
    setIsOpen(false)
  }

  const closeConfirmDialog = () => {
    setConfirmDialog({ isOpen: false, type: null })
  }

  const handleConfirm = async () => {
    if (!confirmDialog.type) return

    switch (confirmDialog.type) {
      case 'reopen':
        await onStatusChange(task.id, 'TODO')
        break
      case 'markDone':
        await onStatusChange(task.id, 'DONE')
        break
      case 'delete':
        onDelete()
        break
    }
    closeConfirmDialog()
  }

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
                onClick={() => openConfirmDialog('markDone')}
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
                onClick={() => openConfirmDialog('reopen')}
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
                  onClick={() => openConfirmDialog('delete')}
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

      {/* Confirmation Modals */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen && confirmDialog.type === 'reopen'}
        onClose={closeConfirmDialog}
        onConfirm={handleConfirm}
        title="Reopen Task"
        message={`Are you sure you want to reopen "${task.title}"? This will move the task back to TODO.`}
        confirmText="Reopen Task"
        cancelText="Cancel"
        variant="warning"
        icon={<RotateCcw size={20} />}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen && confirmDialog.type === 'markDone'}
        onClose={closeConfirmDialog}
        onConfirm={handleConfirm}
        title="Mark as Done"
        message={`Are you sure you want to mark "${task.title}" as done?`}
        confirmText="Mark as Done"
        cancelText="Cancel"
        variant="success"
        icon={<CheckCircle size={20} />}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen && confirmDialog.type === 'delete'}
        onClose={closeConfirmDialog}
        onConfirm={handleConfirm}
        title="Delete Task"
        message={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        icon={<Trash2 size={20} />}
      />
    </div>
  )
}
