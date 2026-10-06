'use client'

import { useActionState, useState, startTransition } from 'react'
import { createTask, updateTaskStatus, deleteTask } from '@/features/tasks/actions'
import { DomainSelectWithQuickAdd } from '@/components/domains/DomainSelectWithQuickAdd'
import { TaskEditModal, type StaffMemberOption } from '@/components/tasks/TaskEditModal'
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
  const [createState, createAction, createPending] = useActionState<ActionState, FormData>(createTask, {})
  const [statusState, statusAction, statusPending] = useActionState<ActionState, FormData>(updateTaskStatus, {})
  const [deleteState, deleteAction, deletePending] = useActionState<ActionState, FormData>(deleteTask, {})

  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('ALL')
  const [filterDomain, setFilterDomain] = useState<string>('ALL')
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)

  const priorityColors: Record<string, string> = {
    LOW: 'badge-neutral',
    MEDIUM: 'badge-warning',
    HIGH: 'badge-danger',
  }

  // Filter by status and domain
  const filteredTasks = tasks.filter((t) => {
    const statusMatch = filterStatus === 'ALL' || t.status === filterStatus
    const domainMatch = filterDomain === 'ALL' || t.domain_id === filterDomain
    return statusMatch && domainMatch
  })

  // Organize tasks by status
  const todoTasks = filteredTasks.filter((t) => t.status === 'TODO')
  const inProgressTasks = filteredTasks.filter((t) => t.status === 'IN_PROGRESS')
  const doneTasks = filteredTasks.filter((t) => t.status === 'DONE')

  const todoCt = tasks.filter((t) => t.status === 'TODO').length
  const ipCt = tasks.filter((t) => t.status === 'IN_PROGRESS').length
  const doneCt = tasks.filter((t) => t.status === 'DONE').length

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

    // Update status in background using FormData wrapped in startTransition
    const formData = new FormData()
    formData.append('task_id', draggedTask.id)
    formData.append('status', newStatus)

    // Call the action within a transition for proper React state handling
    startTransition(() => {
      statusAction(formData)
    })
    
    setDraggedTask(null)
  }

  // Helper to render a task card
  const renderTaskCard = (task: Task) => {
    const domainName = domains.find((d) => d.id === task.domain_id)?.name
    const assignedMember = staffMembers.find((m) => m.user_id === task.assigned_to)
    const isOpen = openDropdown === task.id
    const isDragging = draggedTask?.id === task.id

    return (
      <div 
        key={task.id} 
        className={`task-card ${task.status === 'DONE' ? 'done' : ''} ${isDragging ? 'dragging' : ''}`} 
        style={{ marginBottom: 12, cursor: 'grab' }}
        draggable
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
                    <form action={statusAction} onSubmit={() => setOpenDropdown(null)} style={{ margin: 0 }}>
                      <input type="hidden" name="task_id" value={task.id} />
                      <button
                        type="submit"
                        name="status"
                        value="IN_PROGRESS"
                        disabled={statusPending}
                        className="dropdown-item dropdown-item-info"
                      >
                        <Play size={14} />
                        <span>Start Task</span>
                      </button>
                    </form>
                  )}

                  {task.status === 'IN_PROGRESS' && (
                    <form action={statusAction} onSubmit={() => setOpenDropdown(null)} style={{ margin: 0 }}>
                      <input type="hidden" name="task_id" value={task.id} />
                      <button
                        type="submit"
                        name="status"
                        value="DONE"
                        disabled={statusPending}
                        className="dropdown-item dropdown-item-success"
                      >
                        <CheckCircle size={14} />
                        <span>Mark as Done</span>
                      </button>
                    </form>
                  )}

                  {task.status === 'DONE' && (
                    <form action={statusAction} onSubmit={() => setOpenDropdown(null)} style={{ margin: 0 }}>
                      <input type="hidden" name="task_id" value={task.id} />
                      <button
                        type="submit"
                        name="status"
                        value="TODO"
                        disabled={statusPending}
                        className="dropdown-item"
                      >
                        <RotateCcw size={14} />
                        <span>Reopen Task</span>
                      </button>
                    </form>
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
      {(createState?.error || statusState?.error || deleteState?.error) && (
        <div className="alert alert-error mb-20">
          {createState?.error || statusState?.error || deleteState?.error}
        </div>
      )}
      {(createState?.success || statusState?.success || deleteState?.success) && (
        <div className="alert alert-success mb-20">
          {createState?.success || statusState?.success || deleteState?.success}
        </div>
      )}

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { label: 'Todo', value: todoCt, badge: 'badge-neutral' },
          { label: 'In Progress', value: ipCt, badge: 'badge-info' },
          { label: 'Done', value: doneCt, badge: 'badge-success' },
        ].map((s) => (
          <div key={s.label} className="stat-card" style={{ padding: '12px 20px', flex: 1, minWidth: 100 }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-primary)' }}>{s.value}</div>
            <span className={`badge ${s.badge}`} style={{ marginTop: 4, display: 'inline-flex' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input"
          style={{ width: 'auto', minWidth: 140 }}
        >
          <option value="ALL">All Statuses</option>
          <option value="TODO">Todo</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DONE">Done</option>
        </select>
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
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn btn-primary"
          >
            {showCreateForm ? '✕ Cancel' : '+ New Task'}
          </button>
        )}
      </div>

      {/* Create form */}
      {showCreateForm && canCreateTask && (
        <div className="card" style={{ marginBottom: 24, borderColor: 'var(--color-brand)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Create Task</h3>
          <form action={createAction} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <input type="hidden" name="startup_id" value={startupId} />
            {!isFounder && currentPlanId && <input type="hidden" name="weekly_plan_id" value={currentPlanId} />}
            {isStaff && currentUserId && <input type="hidden" name="self_assign" value="true" />}

            <div className="form-group">
              <label className="label">Title *</label>
              <input name="title" className="input" placeholder="Task title" required />
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
                    <option value="">None</option>
                    {weeklyPlans.map((p) => {
                      const startStr = new Date(p.week_start + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      const endStr = new Date(p.week_end + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
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
              <textarea name="description" className="input" rows={2} placeholder="Optional…" />
            </div>

            <button type="submit" disabled={createPending} className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-start' }}>
              {createPending ? 'Creating…' : 'Create Task'}
            </button>
          </form>
        </div>
      )}

      {/* Kanban Board */}
      {tasks.length === 0 ? (
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
