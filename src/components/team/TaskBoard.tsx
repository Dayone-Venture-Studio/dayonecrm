'use client'

import { useOptimistic, useRef, useState, useTransition } from 'react'
import { Building2, Calendar, AlertTriangle } from 'lucide-react'
import { TaskFormModal } from '@/components/team/TaskFormModal'
import { TaskDetailModal } from '@/components/team/TaskDetailModal'
import { ModalOverlay, ModalCloseButton } from '@/components/ui/ModalOverlay'
import {
  createTeamTask,
  updateTeamTask,
  updateTeamTaskStatus,
  deleteTeamTask,
} from '@/features/team/task-actions'
import { addTeamTaskComment, fetchTeamTaskDetail } from '@/features/team/comment-actions'
import { DEPARTMENTS } from '@/lib/team/constants'
import { useServerAction } from '@/lib/hooks/useServerAction'
import type {
  TaskStatus,
  TeamMemberSummary,
  TeamTaskDetail,
  TeamTaskWithDetails,
} from '@/types'

interface Props {
  tasks: TeamTaskWithDetails[]
  members: TeamMemberSummary[]
  isProjectManager: boolean
}

const COLUMNS: { key: TaskStatus; label: string }[] = [
  { key: 'TODO', label: 'To Do' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'DONE', label: 'Done' },
]

const STATUS_LABEL: Record<string, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
}

const PRIORITY_BADGE: Record<string, string> = {
  LOW: 'badge-neutral',
  MEDIUM: 'badge-info',
  HIGH: 'badge-danger',
}

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function isOverdue(task: TeamTaskWithDetails) {
  return task.status !== 'DONE' && !!task.due_date && task.due_date < todayStr()
}

export function TaskBoard({ tasks, members, isProjectManager }: Props) {
  const [optimisticTasks, applyOptimistic] = useOptimistic(
    tasks,
    (state: TeamTaskWithDetails[], action: { id: string; status: TaskStatus }) =>
      state.map((t) => (t.id === action.id ? { ...t, status: action.status } : t))
  )

  const [filterAssignee, setFilterAssignee] = useState('')
  const [filterDepartment, setFilterDepartment] = useState('')
  const [filterPriority, setFilterPriority] = useState('')

  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null)
  const [pendingMove, setPendingMove] = useState<{ task: TeamTaskWithDetails; to: TaskStatus } | null>(null)

  const [showCreate, setShowCreate] = useState(false)

  const [editing, setEditing] = useState<TeamTaskWithDetails | null>(null)

  const [deleting, setDeleting] = useState<TeamTaskWithDetails | null>(null)

  const [detailId, setDetailId] = useState<string | null>(null)
  const [detail, setDetail] = useState<TeamTaskDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const commentTargetRef = useRef<string | null>(null)

  const [executeCreate, createPending] = useServerAction({
    onSuccess: () => setShowCreate(false),
  })

  const [executeUpdate, editPending] = useServerAction({
    onSuccess: () => setEditing(null),
  })

  const [executeDelete, deletePending] = useServerAction({
    onSuccess: () => setDeleting(null),
  })

  const [executeStatus, statusPending] = useServerAction()

  const [detailPending, startDetail] = useTransition()
  const [executeComment, commentPending] = useServerAction({
    onSuccess: async () => {
      const id = commentTargetRef.current
      if (!id) return
      const d = await fetchTeamTaskDetail(id)
      if (d) setDetail(d)
    },
  })

  const visible = optimisticTasks.filter((t) => {
    if (!isProjectManager) return true
    if (filterAssignee && t.assigned_to !== filterAssignee) return false
    if (filterDepartment && t.department !== filterDepartment) return false
    if (filterPriority && t.priority !== filterPriority) return false
    return true
  })

  function handleCreate(formData: FormData) {
    const title = String(formData.get('title') ?? 'Task')
    executeCreate(() => createTeamTask({}, formData), {
      success: {
        title: 'Task created successfully.',
        description: `“${title}” has been added to the board.`,
      },
      error: (error) => ({
        title: 'Could not create task.',
        description: error,
      }),
    })
  }

  function handleUpdate(formData: FormData) {
    if (editing) formData.set('id', editing.id)
    const title = String(formData.get('title') ?? 'Task')
    executeUpdate(() => updateTeamTask({}, formData), {
      success: {
        title: 'Task updated successfully.',
        description: `Changes to “${title}” have been saved.`,
      },
      error: (error) => ({
        title: 'Could not update task.',
        description: error,
      }),
    })
  }

  function handleDelete() {
    if (!deleting) return
    const target = deleting
    const fd = new FormData()
    fd.set('id', target.id)
    executeDelete(() => deleteTeamTask({}, fd), {
      success: {
        title: 'Task deleted successfully.',
        description: `“${target.title}” has been deleted.`,
      },
      error: (error) => ({
        title: 'Could not delete task.',
        description: error,
      }),
    })
  }

  function confirmMove() {
    if (!pendingMove) return
    const move = pendingMove
    setPendingMove(null)
    executeStatus(() => updateTeamTaskStatus(move.task.id, move.to), {
      onStart: () => applyOptimistic({ id: move.task.id, status: move.to }),
      success: {
        title: 'Task status updated.',
        description: `“${move.task.title}” moved to ${STATUS_LABEL[move.to]}.`,
      },
      error: (error) => ({
        title: 'Could not move task.',
        description: error,
      }),
    })
  }

  function handleDragStart(task: TeamTaskWithDetails) {
    setDraggedId(task.id)
  }

  function handleDragOver(e: React.DragEvent, column: TaskStatus) {
    e.preventDefault()
    setDragOverColumn(column)
  }

  function handleDrop(e: React.DragEvent, column: TaskStatus) {
    e.preventDefault()
    setDragOverColumn(null)
    const task = optimisticTasks.find((t) => t.id === draggedId)
    setDraggedId(null)
    if (!task || task.status === column) return
    setPendingMove({ task, to: column })
  }

  function openDetail(task: TeamTaskWithDetails) {
    setDetailId(task.id)
    // Seed with the card data so the modal renders instantly, then hydrate
    // comments + status history in the background.
    setDetail({ task, comments: [], activities: [] })
    setDetailLoading(true)
    startDetail(async () => {
      const d = await fetchTeamTaskDetail(task.id)
      if (d) setDetail(d)
      setDetailLoading(false)
    })
  }

  function closeDetail() {
    setDetailId(null)
    setDetail(null)
  }

  function deleteFromDetail(task: TeamTaskWithDetails) {
    closeDetail()
    setDeleting(task)
  }

  function handleAddComment(formData: FormData) {
    if (!detailId) return
    commentTargetRef.current = detailId
    executeComment(() => addTeamTaskComment({}, formData), {
      success: {
        title: 'Comment posted.',
        description: 'Your comment was added to the task.',
      },
      error: (message) => ({ title: 'Could not post comment.', description: message }),
    })
  }

  return (
    <div>
      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          flexWrap: 'wrap',
          marginBottom: 20,
        }}
      >
        <button onClick={() => setShowCreate(true)} className="btn btn-primary">
          + New Task
        </button>

        {isProjectManager && (
          <>
            <select
              className="input"
              style={{ maxWidth: 200 }}
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
            >
              <option value="">All assignees</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name}
                </option>
              ))}
            </select>

            <select
              className="input"
              style={{ maxWidth: 180 }}
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
            >
              <option value="">All departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <select
              className="input"
              style={{ maxWidth: 150 }}
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="">All priorities</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </>
        )}
      </div>


      {/* Board — always rendered so each column can show its own empty state */}
      <div className="kanban-board">
        {COLUMNS.map((col) => {
          const colTasks = visible.filter((t) => t.status === col.key)
          return (
            <div
              key={col.key}
              className={`kanban-column ${dragOverColumn === col.key ? 'drag-over' : ''}`}
              onDragOver={(e) => handleDragOver(e, col.key)}
              onDragLeave={() => setDragOverColumn(null)}
              onDrop={(e) => handleDrop(e, col.key)}
            >
              <div className="kanban-column-header">
                <span className="kanban-column-title">{col.label}</span>
                <span className="kanban-column-count">{colTasks.length}</span>
              </div>

              <div className="kanban-tasks">
                {colTasks.length === 0 ? (
                  <div className="kanban-empty kanban-empty-section">
                    <span className="kanban-empty-icon">📋</span>
                    <span className="kanban-empty-text">
                      {dragOverColumn === col.key ? 'Drop here' : `No tasks in ${col.label}`}
                    </span>
                  </div>
                ) : (
                    colTasks.map((task) => {
                      const isDelegated = !!(task as any).source_task_id
                      const startup = isDelegated ? (task as any).startup : null
                      const delegation = isDelegated && (task as any).delegation?.[0] ? (task as any).delegation[0] : null
                      
                      return (
                        <div
                          key={task.id}
                          className={`task-card ${draggedId === task.id ? 'dragging' : ''} ${isDelegated ? 'border-l-4 border-l-purple-500 bg-purple-50/30' : ''}`}
                          draggable
                          onDragStart={() => handleDragStart(task)}
                          onDragEnd={() => setDraggedId(null)}
                          onClick={() => openDetail(task)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="task-card-header">
                            <div className="task-card-content">
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  gap: 8,
                                  alignItems: 'flex-start',
                                }}
                              >
                                <div style={{ flex: 1 }}>
                                  <span className="task-card-title" style={{ marginBottom: 0 }}>
                                    {task.title}
                                  </span>
                                  {isDelegated && (
                                    <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                                      <span className="badge badge-info" style={{ fontSize: 10 }}>
                                        Startup Task
                                      </span>
                                      {startup && (
                                        <span className="text-xs font-semibold text-purple-700">
                                          {startup.name}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <span
                                  className={`badge ${PRIORITY_BADGE[task.priority]}`}
                                  style={{ flexShrink: 0 }}
                                >
                                  {task.priority}
                                </span>
                              </div>
                              {task.description && (
                                <div className="task-card-description task-card-description--single">
                                  {task.description}
                                </div>
                              )}

                              {delegation && (
                                <div style={{ marginTop: 8, fontSize: 11, color: 'var(--color-text-secondary)' }}>
                                  <span style={{ fontWeight: 600 }}>Assigned by:</span>{' '}
                                  {delegation.delegator?.full_name || 'Unknown'}
                                </div>
                              )}

                              <div className="task-card-meta-row">
                                {task.department && (
                                  <span className="task-card-meta-item">
                                    <Building2 size={13} className="task-card-meta-icon" />
                                    {task.department}
                                  </span>
                                )}
                                {task.due_date && (
                                  <span
                                    className={`task-card-meta-item ${isOverdue(task) ? 'task-card-meta-item--overdue' : ''}`}
                                  >
                                    {isOverdue(task) ? (
                                      <AlertTriangle size={13} className="task-card-meta-icon" />
                                    ) : (
                                      <Calendar size={13} className="task-card-meta-icon" />
                                    )}
                                    {task.due_date}
                                  </span>
                                )}
                              </div>

                              {isProjectManager && (
                                <div className="task-card-meta">
                                  <span className="avatar avatar-sm">
                                    {(task.assigned_profile?.full_name || 'U').charAt(0)}
                                  </span>
                                  <span>{task.assigned_profile?.full_name || 'Unassigned'}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )
          })}
        </div>

      {/* Create */}
      <TaskFormModal
        mode="create"
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        action={handleCreate}
        pending={createPending}
        members={members}
        isProjectManager={isProjectManager}
      />

      {/* Edit */}
      <TaskFormModal
        mode="edit"
        isOpen={!!editing}
        onClose={() => setEditing(null)}
        action={handleUpdate}
        pending={editPending}
        task={editing ?? undefined}
        members={members}
        isProjectManager={isProjectManager}
      />

      {/* Detail */}
      <TaskDetailModal
        isOpen={!!detailId}
        onClose={closeDetail}
        detail={detail}
        loading={detailLoading || detailPending}
        onAddComment={handleAddComment}
        commentPending={commentPending}
        canDelete={isProjectManager}
        onEdit={(task) => {
          closeDetail()
          setEditing(task)
        }}
        onDelete={deleteFromDetail}
      />

      {/* Delete confirm */}
      <ModalOverlay isOpen={!!deleting} onClose={() => setDeleting(null)} ariaLabel="Delete task">
        <div className="card" style={{ width: 420, maxWidth: '100%', position: 'relative' }}>
          <ModalCloseButton onClose={() => setDeleting(null)} />
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Delete Task</h2>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
            Delete <strong style={{ color: 'var(--color-text-primary)' }}>{deleting?.title}</strong>?
            This cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <button onClick={() => setDeleting(null)} className="btn btn-ghost">
              Cancel
            </button>
            <button onClick={handleDelete} disabled={deletePending} className="btn btn-danger">
              {deletePending ? 'Deleting…' : 'Delete Task'}
            </button>
          </div>
        </div>
      </ModalOverlay>

      {/* Status-change confirm */}
      <ModalOverlay isOpen={!!pendingMove} onClose={() => setPendingMove(null)} ariaLabel="Confirm status change">
        <div className="card" style={{ width: 420, maxWidth: '100%', position: 'relative' }}>
          <ModalCloseButton onClose={() => setPendingMove(null)} />
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Confirm Status Change</h2>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
            Move <strong style={{ color: 'var(--color-text-primary)' }}>{pendingMove?.task.title}</strong>{' '}
            from {pendingMove ? STATUS_LABEL[pendingMove.task.status] : ''} to{' '}
            <strong style={{ color: 'var(--color-text-primary)' }}>
              {pendingMove ? STATUS_LABEL[pendingMove.to] : ''}
            </strong>
            ?
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <button onClick={() => setPendingMove(null)} className="btn btn-ghost">
              Cancel
            </button>
            <button onClick={confirmMove} disabled={statusPending} className="btn btn-primary">
              {statusPending ? 'Moving…' : 'Confirm'}
            </button>
          </div>
        </div>
      </ModalOverlay>
    </div>
  )
}
