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
  
  // Check if task is delegated
  const taskAny = task as any
  const delegation = taskAny.delegation
  const isDelegated = !!delegation
  
  // Show employee as assignee if delegated, otherwise show original assignee
  const displayedAssignee = isDelegated && delegation?.employee
    ? { user_id: delegation.employee.id, profile: delegation.employee }
    : staffMembers.find((m) => m.user_id === task.assigned_to)
  
  const isDragging = draggedTask?.id === task.id
  const isPendingUpdate = pendingUpdates.has(task.id)

  return (
    <div 
      className={`task-card mb-3 cursor-grab ${task.status === 'DONE' ? 'done' : ''} ${isDragging ? 'dragging' : ''} ${isPendingUpdate ? 'updating opacity-70' : ''} ${isDelegated ? 'border-l-4 border-l-purple-500 bg-purple-50/20' : ''}`} 
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
          {isDelegated && delegation?.employee && (
            <div className="mb-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold">
                Delegated to {delegation.employee.full_name}
              </span>
            </div>
          )}
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
          
          {/* Due date and Owner on same line */}
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {displayedAssignee?.profile && (
              <div className="flex items-center gap-2 mt-3">
                <div
                  className="avatar avatar-sm"
                  style={{
                    background: isDelegated 
                      ? 'linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)'
                      : 'linear-gradient(135deg, #ca2f2b 0%, #9e1f1c 100%)',
                    color: '#ffffff',
                    fontWeight: 700,
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    fontSize: '11px',
                  }}
                >
                  {displayedAssignee.profile.full_name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <span className="text-[12px] font-medium text-text-primary">
                  {displayedAssignee.profile.full_name}
                </span>
              </div>
            )}
            {task.due_date && (
              <div className="task-card-meta">
                <Calendar size={12} />
                <span>Due {new Date(task.due_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
            )}
          </div>
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
