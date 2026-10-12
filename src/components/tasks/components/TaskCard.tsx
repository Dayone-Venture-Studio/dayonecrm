import { Calendar, User } from 'lucide-react'
import type { Task, Domain } from '@/types'
import type { StaffMemberEntry } from '../types'
import { PRIORITY_COLORS, COMPLETION_STATUS_COLORS } from '../constants'
import { TaskDropdownMenu } from './TaskDropdownMenu'

interface TaskCardProps {
  task: Task
  domains: Domain[]
  staffMembers: StaffMemberEntry[]
  draggedTask: Task | null
  justDraggedRef: React.RefObject<boolean>
  pendingUpdates: Set<string>
  canEdit: boolean
  canDelete: boolean
  onDragStart: (task: Task) => void
  onDragEnd: () => void
  onEdit: (task: Task) => void
  onView: (task: Task) => void
  onStatusChange: (taskId: string, status: Task['status']) => Promise<void>
  onDelete: (taskId: string) => void
}

export function TaskCard({
  task,
  domains,
  staffMembers,
  draggedTask,
  justDraggedRef,
  pendingUpdates,
  canEdit,
  canDelete,
  onDragStart,
  onDragEnd,
  onEdit,
  onView,
  onStatusChange,
  onDelete,
}: TaskCardProps) {
  const domainName = domains.find((d) => d.id === task.domain_id)?.name
  const assignedMember = staffMembers.find((m) => m.user_id === task.assigned_to)
  const isDragging = draggedTask?.id === task.id
  const isPendingUpdate = pendingUpdates.has(task.id)

  return (
    <div 
      className={`task-card mb-3 cursor-grab ${task.status === 'DONE' ? 'done' : ''} ${isDragging ? 'dragging' : ''} ${isPendingUpdate ? 'updating opacity-70' : ''}`} 
      draggable={!isPendingUpdate}
      onDragStart={() => onDragStart(task)}
      onDragEnd={onDragEnd}
    >
      <div className="task-card-header">
        <div
          className="task-card-content cursor-pointer"
          onClick={() => {
            if (draggedTask || justDraggedRef.current) return
            onView(task)
          }}
          title="View task details"
        >
          <div className="task-card-title">
            {task.title}
          </div>
          {task.description && (
            <div className="task-card-description">
              {task.description}
            </div>
          )}
          <div className="task-card-badges">
            <span className={`badge ${PRIORITY_COLORS[task.priority] || 'badge-neutral'} text-[10px]`}>
              {task.priority}
            </span>
            {domainName && <span className="badge badge-info text-[10px]">{domainName}</span>}
            {task.completion_status && (
              <span className={`badge ${COMPLETION_STATUS_COLORS[task.completion_status] || 'badge-neutral'} text-[10px]`}>
                {task.completion_status}
              </span>
            )}
          </div>
          {task.due_date && (
            <div className="task-card-meta">
              <Calendar size={12} />
              <span>Due {new Date(task.due_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
          )}
          {assignedMember?.profile && (
            <div className="task-card-meta">
              <User size={12} />
              <span>{assignedMember.profile.full_name}</span>
            </div>
          )}
        </div>

        <TaskDropdownMenu
          task={task}
          canEdit={canEdit}
          canDelete={canDelete}
          isPendingUpdate={isPendingUpdate}
          onEdit={() => onEdit(task)}
          onStatusChange={onStatusChange}
          onDelete={() => onDelete(task.id)}
        />
      </div>
    </div>
  )
}
