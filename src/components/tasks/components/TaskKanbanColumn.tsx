import type { Task, Domain } from '@/types'
import type { StaffMemberEntry } from '../types'
import { TaskCard } from './TaskCard'

interface TaskKanbanColumnProps {
  title: string
  icon: React.ReactNode
  status: string
  tasks: Task[]
  count: number
  badgeClass: string
  borderColor?: string
  dragOverColumn: string | null
  draggedTask: Task | null
  justDraggedRef: React.RefObject<boolean>
  pendingUpdates: Set<string>
  domains: Domain[]
  staffMembers: StaffMemberEntry[]
  canEditTask: (task: Task) => boolean
  canDeleteTask: boolean
  onDragOver: (e: React.DragEvent, status: string) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent, status: string) => void
  onDragStart: (task: Task) => void
  onDragEnd: () => void
  onEdit: (task: Task) => void
  onView: (task: Task) => void
  onStatusChange: (taskId: string, status: Task['status']) => Promise<void>
  onDelete: (taskId: string) => void
}

export function TaskKanbanColumn({
  title,
  icon,
  status,
  tasks,
  count,
  badgeClass,
  borderColor,
  dragOverColumn,
  draggedTask,
  justDraggedRef,
  pendingUpdates,
  domains,
  staffMembers,
  canEditTask,
  canDeleteTask,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragStart,
  onDragEnd,
  onEdit,
  onView,
  onStatusChange,
  onDelete,
}: TaskKanbanColumnProps) {
  return (
    <div 
      className={`kanban-column min-h-[400px] ${dragOverColumn === status ? 'drag-over' : ''}`}
      onDragOver={(e) => onDragOver(e, status)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, status)}
    >
      <div className={`kanban-column-header ${borderColor ? `[border-bottom-color:${borderColor}]` : ''}`}>
        <h3 className="kanban-column-title flex items-center gap-2 m-0">
          {icon}
          <span>{title}</span>
        </h3>
        <span className={`badge ${badgeClass}`}>{count}</span>
      </div>
      <div>
        {tasks.length === 0 ? (
          <div className="kanban-empty-state">
            {dragOverColumn === status ? 'Drop here' : `No ${title.toLowerCase()} tasks`}
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              domains={domains}
              staffMembers={staffMembers}
              draggedTask={draggedTask}
              justDraggedRef={justDraggedRef}
              pendingUpdates={pendingUpdates}
              canEdit={canEditTask(task)}
              canDelete={canDeleteTask}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onEdit={onEdit}
              onView={onView}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  )
}
