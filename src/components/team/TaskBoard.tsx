'use client'

import { useOptimistic, useState, useTransition } from 'react'
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

type Banner = { type: 'success' | 'error'; message: string } | null

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

  const [banner, setBanner] = useState<Banner>(null)

  const [filterAssignee, setFilterAssignee] = useState('')
  const [filterDepartment, setFilterDepartment] = useState('')
  const [filterPriority, setFilterPriority] = useState('')

  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null)
  const [pendingMove, setPendingMove] = useState<{ task: TeamTaskWithDetails; to: TaskStatus } | null>(null)

  const [showCreate, setShowCreate] = useState(false)
  const [createError, setCreateError] = useState<string | undefined>()

  const [editing, setEditing] = useState<TeamTaskWithDetails | null>(null)
  const [editError, setEditError] = useState<string | undefined>()

  const [deleting, setDeleting] = useState<TeamTaskWithDetails | null>(null)
  const [deleteError, setDeleteError] = useState<string | undefined>()

  const [detailId, setDetailId] = useState<string | null>(null)
  const [detail, setDetail] = useState<TeamTaskDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [commentError, setCommentError] = useState<string | undefined>()

  const [createPending, startCreate] = useTransition()
  const [editPending, startEdit] = useTransition()
  const [statusPending, startStatus] = useTransition()
  const [deletePending, startDelete] = useTransition()
  const [detailPending, startDetail] = useTransition()
  const [commentPending, startComment] = useTransition()

  const visible = optimisticTasks.filter((t) => {
    if (!isProjectManager) return true
    if (filterAssignee && t.assigned_to !== filterAssignee) return false
    if (filterDepartment && t.department !== filterDepartment) return false
    if (filterPriority && t.priority !== filterPriority) return false
    return true
  })

  function handleCreate(formData: FormData) {
    setCreateError(undefined)
    setBanner(null)
    startCreate(async () => {
      const res = await createTeamTask({}, formData)
      if (res.error) {
        setCreateError(res.error)
      } else {
        setShowCreate(false)
        setBanner({ type: 'success', message: res.success ?? 'Task created.' })
      }
    })
  }

  function handleUpdate(formData: FormData) {
    setEditError(undefined)
    setBanner(null)
    startEdit(async () => {
      const res = await updateTeamTask({}, formData)
      if (res.error) {
        setEditError(res.error)
      } else {
        setEditing(null)
        setBanner({ type: 'success', message: res.success ?? 'Task updated.' })
      }
    })
  }

  function handleDelete() {
    if (!deleting) return
    const fd = new FormData()
    fd.set('id', deleting.id)
    setDeleteError(undefined)
    setBanner(null)
    const target = deleting
    startDelete(async () => {
      const res = await deleteTeamTask({}, fd)
      if (res.error) {
        setDeleteError(res.error)
      } else {
        setDeleting(null)
        setBanner({ type: 'success', message: res.success ?? `Deleted “${target.title}”.` })
      }
    })
  }

  function confirmMove() {
    if (!pendingMove) return
    const move = pendingMove
    setPendingMove(null)
    setBanner(null)
    startStatus(async () => {
      applyOptimistic({ id: move.task.id, status: move.to })
      const res = await updateTeamTaskStatus(move.task.id, move.to)
      if (res.error) setBanner({ type: 'error', message: res.error })
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
    setCommentError(undefined)
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
    setDeleteError(undefined)
    setDeleting(task)
  }

  function handleAddComment(formData: FormData) {
    if (!detailId) return
    const id = detailId
    setCommentError(undefined)
    startComment(async () => {
      const res = await addTeamTaskComment({}, formData)
      if (res.error) {
        setCommentError(res.error)
        return
      }
      const d = await fetchTeamTaskDetail(id)
      setDetail(d)
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

      {banner && (
        <div className={`alert alert-${banner.type}`} style={{ marginBottom: 16 }}>
          {banner.message}
        </div>
      )}

      {/* Board */}
      {optimisticTasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>No tasks yet</h3>
          <p>Create your first task to get started.</p>
          <button
            onClick={() => setShowCreate(true)}
            className="btn btn-primary"
            style={{ marginTop: 16 }}
          >
            + New Task
          </button>
        </div>
      ) : (
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
                    <div className="kanban-empty">
                      {dragOverColumn === col.key ? 'Drop here' : 'No tasks'}
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`task-card ${draggedId === task.id ? 'dragging' : ''}`}
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
                              <span className="task-card-title" style={{ marginBottom: 0 }}>
                                {task.title}
                              </span>
                              <span
                                className={`badge ${PRIORITY_BADGE[task.priority]}`}
                                style={{ flexShrink: 0 }}
                              >
                                {task.priority}
                              </span>
                            </div>

                            <div className="task-card-badges">
                              {task.department && (
                                <span className="badge badge-neutral">{task.department}</span>
                              )}
                              {task.due_date && (
                                <span
                                  className={`badge ${isOverdue(task) ? 'badge-danger' : 'badge-neutral'}`}
                                >
                                  {isOverdue(task) ? '⚠ ' : ''}
                                  {task.due_date}
                                </span>
                              )}
                            </div>

                            <div className="task-card-meta">
                              <span className="avatar" style={{ fontSize: 11 }}>
                                {(task.assigned_profile?.full_name || 'U').charAt(0)}
                              </span>
                              {task.assigned_profile?.full_name || 'Unassigned'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create */}
      <TaskFormModal
        mode="create"
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        action={handleCreate}
        error={createError}
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
        error={editError}
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
        commentError={commentError}
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
          {deleteError && (
            <div className="alert alert-error" style={{ marginTop: 12 }}>
              {deleteError}
            </div>
          )}
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
