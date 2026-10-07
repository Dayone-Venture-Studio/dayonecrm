'use client'

import { useActionState, useState, useOptimistic, useTransition } from 'react'
import { deleteTask, updateTaskStatusOptimistic } from '@/features/tasks/actions'
import { TaskEditModal } from '@/components/tasks/TaskEditModal'
import { TaskCreateModal } from '@/components/tasks/TaskCreateModal'
import type { ActionState, Task, Domain, WeeklyPlan } from '@/types'
import { 
  Pencil, 
  Play, 
  CheckCircle, 
  RotateCcw, 
  Trash2, 
  Calendar, 
  User,
  ClipboardList,
  Rocket,
  CheckCheck,
  MoreVertical
} from 'lucide-react'

interface StaffMemberEntry {
  user_id: string
  role?: string
  profile: { id: string; full_name: string; email?: string | null } | null
}

interface Props {
  startupId: string
  tasks: Task[]
  domains: Domain[]
  weeklyPlans: Pick<WeeklyPlan, 'id' | 'week_start' | 'week_end' | 'title' | 'goal'>[]
  staffMembers: StaffMemberEntry[]
  isFounder?: boolean
  isStaff?: boolean
  currentUserId?: string
  currentPlanId?: string
}

export function TasksClient({
  startupId,
  tasks,
  domains,
  weeklyPlans,
  staffMembers,
  isFounder = false,
  isStaff = false,
  currentUserId,
  currentPlanId,
}: Props) {
  const canCreateTask = isFounder || isStaff
  const canEditTask = (task: Task) => isFounder || (isStaff && task.created_by === currentUserId)
  const canDeleteTask = isFounder
  
  const [deleteState, deleteAction, deletePending] = useActionState<ActionState, FormData>(deleteTask, {})

  // Optimistic state for task status updates
  const [optimisticTasks, updateOptimisticTasks] = useOptimistic(
    tasks,
    (currentTasks, updatedTask: { id: string; status: string }) => {
      return currentTasks.map((task) =>
        task.id === updatedTask.id
          ? { ...task, status: updatedTask.status as Task['status'] }
          : task
      )
    }
  )
  
  const [, startTransition] = useTransition()
  const [pendingUpdates, setPendingUpdates] = useState<Set<string>>(new Set())

  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [filterDomain, setFilterDomain] = useState<string>('ALL')
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)

  const priorityColors: Record<string, string> = {
    LOW: 'badge-neutral',
    MEDIUM: 'badge-warning',
    HIGH: 'badge-danger',
  }

  // Filter by domain (using optimistic tasks)
  const filteredTasks = optimisticTasks.filter((t) => {
    const domainMatch = filterDomain === 'ALL' || t.domain_id === filterDomain
    return domainMatch
  })

  // Organize tasks by status
  const todoTasks = filteredTasks.filter((t) => t.status === 'TODO')
  const inProgressTasks = filteredTasks.filter((t) => t.status === 'IN_PROGRESS')
  const doneTasks = filteredTasks.filter((t) => t.status === 'DONE')

  // Handler for optimistic status updates with race condition protection
  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    const originalTask = optimisticTasks.find((t) => t.id === taskId)
    if (!originalTask || originalTask.status === newStatus) return

    // Prevent concurrent updates on the same task
    if (pendingUpdates.has(taskId)) {
      console.warn(`Update already pending for task ${taskId}`)
      return
    }

    // Mark task as pending
    setPendingUpdates((prev) => new Set(prev).add(taskId))

    // Optimistically update the UI
    startTransition(() => {
      updateOptimisticTasks({ id: taskId, status: newStatus })
    })

    try {
      // Call the server action
      const result = await updateTaskStatusOptimistic(taskId, newStatus, startupId)

      // Handle errors - revert and log
      if (!result.success) {
        startTransition(() => {
          updateOptimisticTasks({ id: taskId, status: originalTask.status })
        })
        console.error('Failed to update task status:', result.error)
      }
    } catch (error) {
      // Handle unexpected errors
      startTransition(() => {
        updateOptimisticTasks({ id: taskId, status: originalTask.status })
      })
      console.error('handleStatusChange error:', error)
    } finally {
      // Remove task from pending set
      setPendingUpdates((prev) => {
        const newSet = new Set(prev)
        newSet.delete(taskId)
        return newSet
      })
    }
  }

  // Drag and drop handlers
  const handleDragStart = (task: Task) => {
    setDraggedTask(task)
    setOpenDropdown(null) // Close any open dropdown when dragging starts
  }

  const handleDragEnd = () => {
    setDraggedTask(null)
    setDragOverColumn(null)
  }

  const handleDragOver = (e: React.DragEvent, columnStatus: string) => {
    e.preventDefault()
    setDragOverColumn(columnStatus)
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    setDragOverColumn(null)

    if (!draggedTask || draggedTask.status === newStatus) {
      setDraggedTask(null)
      return
    }

    // Use optimistic update handler
    await handleStatusChange(draggedTask.id, newStatus as Task['status'])
    
    setDraggedTask(null)
  }

  // Helper to render a task card
  const renderTaskCard = (task: Task) => {
    const domainName = domains.find((d) => d.id === task.domain_id)?.name
    const assignedMember = staffMembers.find((m) => m.user_id === task.assigned_to)
    const isOpen = openDropdown === task.id
    const isDragging = draggedTask?.id === task.id
    const isPendingUpdate = pendingUpdates.has(task.id)

    return (
      <div 
        key={task.id} 
        className={`task-card ${task.status === 'DONE' ? 'done' : ''} ${isDragging ? 'dragging' : ''} ${isPendingUpdate ? 'updating' : ''}`} 
        style={{ marginBottom: 12, cursor: 'grab', opacity: isPendingUpdate ? 0.7 : 1 }}
        draggable={!isPendingUpdate}
        onDragStart={() => handleDragStart(task)}
        onDragEnd={handleDragEnd}
      >
        <div className="task-card-header">
          <div className="task-card-content">
            <div className="task-card-title">
              {task.title}
            </div>
            {task.description && (
              <div className="task-card-description">
                {task.description}
              </div>
            )}
            <div className="task-card-badges">
              <span className={`badge ${priorityColors[task.priority] || 'badge-neutral'}`} style={{ fontSize: 10 }}>
                {task.priority}
              </span>
              {domainName && <span className="badge badge-info" style={{ fontSize: 10 }}>{domainName}</span>}
              {task.completion_status && (
                <span className={`badge ${task.completion_status === 'EARLY' ? 'badge-success' : task.completion_status === 'ON_TIME' ? 'badge-info' : 'badge-warning'}`} style={{ fontSize: 10 }}>
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

          {/* More button with dropdown */}
          <div className="dropdown-container task-card-actions">
            <button
              type="button"
              onClick={() => setOpenDropdown(isOpen ? null : task.id)}
              className="btn btn-ghost btn-sm btn-icon"
              title="More actions"
            >
              <MoreVertical size={16} />
            </button>

            {isOpen && (
              <>
                <div 
                  className="dropdown-backdrop"
                  onClick={() => setOpenDropdown(null)}
                />
                
                <div className="dropdown-menu">
                  {/* Edit option */}
                  {canEditTask(task) && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTask(task)
                        setOpenDropdown(null)
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
                        setOpenDropdown(null)
                        await handleStatusChange(task.id, 'IN_PROGRESS')
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
                        setOpenDropdown(null)
                        await handleStatusChange(task.id, 'DONE')
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
                        setOpenDropdown(null)
                        await handleStatusChange(task.id, 'TODO')
                      }}
                      disabled={isPendingUpdate}
                      className="dropdown-item"
                    >
                      <RotateCcw size={14} />
                      <span>Reopen Task</span>
                    </button>
                  )}

                  {/* Delete option */}
                  {canDeleteTask && (
                    <>
                      <div className="dropdown-divider" />
                      <form action={deleteAction} onSubmit={() => setOpenDropdown(null)} style={{ margin: 0 }}>
                        <input type="hidden" name="id" value={task.id} />
                        <button
                          type="submit"
                          disabled={deletePending}
                          className="dropdown-item dropdown-item-danger"
                        >
                          <Trash2 size={14} />
                          <span>Delete Task</span>
                        </button>
                      </form>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {deleteState?.error && (
        <div className="alert alert-error mb-20">
          {deleteState.error}
        </div>
      )}
      {deleteState?.success && (
        <div className="alert alert-success mb-20">
          {deleteState.success}
        </div>
      )}

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <select
          value={filterDomain}
          onChange={(e) => setFilterDomain(e.target.value)}
          className="input"
          style={{ width: 'auto', minWidth: 140 }}
        >
          <option value="ALL">All Domains</option>
          {domains.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
        <div style={{ flex: 1 }} />
        {canCreateTask && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn btn-primary"
          >
            + New Task
          </button>
        )}
      </div>

      {/* Kanban Board */}
      {optimisticTasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>No tasks yet</h3>
          <p>Create a task to start tracking work</p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: 20,
          alignItems: 'start'
        }}>
          {/* TODO Column */}
          <div 
            className={`kanban-column ${dragOverColumn === 'TODO' ? 'drag-over' : ''}`}
            style={{ minHeight: 400 }}
            onDragOver={(e) => handleDragOver(e, 'TODO')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 'TODO')}
          >
            <div className="kanban-column-header">
              <h3 className="kanban-column-title" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                <ClipboardList size={16} />
                <span>TODO</span>
              </h3>
              <span className="badge badge-neutral">{todoTasks.length}</span>
            </div>
            <div>
              {todoTasks.length === 0 ? (
                <div className="kanban-empty-state">
                  {dragOverColumn === 'TODO' ? 'Drop here' : 'No tasks to do'}
                </div>
              ) : (
                todoTasks.map(renderTaskCard)
              )}
            </div>
          </div>

          {/* IN PROGRESS Column */}
          <div 
            className={`kanban-column ${dragOverColumn === 'IN_PROGRESS' ? 'drag-over' : ''}`}
            style={{ minHeight: 400 }}
            onDragOver={(e) => handleDragOver(e, 'IN_PROGRESS')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 'IN_PROGRESS')}
          >
            <div className="kanban-column-header" style={{ borderBottomColor: 'var(--color-info)' }}>
              <h3 className="kanban-column-title" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                <Rocket size={16} />
                <span>IN PROGRESS</span>
              </h3>
              <span className="badge badge-info">{inProgressTasks.length}</span>
            </div>
            <div>
              {inProgressTasks.length === 0 ? (
                <div className="kanban-empty-state">
                  {dragOverColumn === 'IN_PROGRESS' ? 'Drop here' : 'No tasks in progress'}
                </div>
              ) : (
                inProgressTasks.map(renderTaskCard)
              )}
            </div>
          </div>

          {/* DONE Column */}
          <div 
            className={`kanban-column ${dragOverColumn === 'DONE' ? 'drag-over' : ''}`}
            style={{ minHeight: 400 }}
            onDragOver={(e) => handleDragOver(e, 'DONE')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 'DONE')}
          >
            <div className="kanban-column-header" style={{ borderBottomColor: 'var(--color-success)' }}>
              <h3 className="kanban-column-title" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                <CheckCheck size={16} />
                <span>DONE</span>
              </h3>
              <span className="badge badge-success">{doneTasks.length}</span>
            </div>
            <div>
              {doneTasks.length === 0 ? (
                <div className="kanban-empty-state">
                  {dragOverColumn === 'DONE' ? 'Drop here' : 'No completed tasks'}
                </div>
              ) : (
                doneTasks.map(renderTaskCard)
              )}
            </div>
          </div>
        </div>
      )}

      {showCreateForm && canCreateTask && (
        <TaskCreateModal
          startupId={startupId}
          domains={domains}
          weeklyPlans={weeklyPlans}
          staffMembers={staffMembers}
          isFounder={isFounder}
          isStaff={isStaff}
          currentUserId={currentUserId}
          currentPlanId={currentPlanId}
          onClose={() => setShowCreateForm(false)}
        />
      )}

      {editingTask && (
        <TaskEditModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          domains={domains}
          startupId={startupId}
          weeklyPlans={weeklyPlans}
          staffMembers={staffMembers}
        />
      )}
    </div>
  )
}
