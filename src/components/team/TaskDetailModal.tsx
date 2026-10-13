'use client'

import { useState } from 'react'
import { ModalOverlay, ModalCloseButton } from '@/components/ui/ModalOverlay'
import type { TeamTaskDetail, TeamTaskWithDetails } from '@/types'

interface Props {
  isOpen: boolean
  onClose: () => void
  detail: TeamTaskDetail | null
  loading: boolean
  onAddComment: (formData: FormData) => void
  commentPending: boolean
  canDelete: boolean
  onEdit: (task: TeamTaskWithDetails) => void
  onDelete: (task: TeamTaskWithDetails) => void
}

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

function fmt(dt: string) {
  return new Date(dt).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function TaskDetailModal({
  isOpen,
  onClose,
  detail,
  loading,
  onAddComment,
  commentPending,
  canDelete,
  onEdit,
  onDelete,
}: Props) {
  const [tab, setTab] = useState<'details' | 'comments' | 'history'>('details')

  const task = detail?.task
  if (!task) return null

  const totalComments = detail!.comments.length
  const totalActivities = detail!.activities.length

  function handleClose() {
    setTab('details')
    onClose()
  }

  return (
    <ModalOverlay isOpen={isOpen} onClose={handleClose} ariaLabel={task.title}>
      <div
        className="card"
        style={{ width: 720, maxWidth: '100%', minHeight: 420, position: 'relative' }}
      >
        <ModalCloseButton onClose={handleClose} />

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 16,
            alignItems: 'flex-start',
            paddingRight: 36,
          }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>{task.title}</h2>
          <span className={`badge ${PRIORITY_BADGE[task.priority]}`}>{task.priority}</span>
        </div>

        <div style={{ display: 'flex', gap: 8, margin: '18px 0', flexWrap: 'wrap' }}>
          {(['details', 'comments', 'history'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`btn btn-sm ${tab === t ? 'btn-primary' : 'btn-ghost'}`}
            >
              {t === 'details'
                ? 'Details'
                : t === 'comments'
                  ? `Comments${totalComments ? ` (${totalComments})` : ''}`
                  : `History${totalActivities ? ` (${totalActivities})` : ''}`}
            </button>
          ))}
        </div>

        {tab === 'details' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div
              style={{
                fontSize: 14,
                color: 'var(--color-text-secondary)',
                whiteSpace: 'pre-wrap',
                minHeight: 60,
              }}
            >
              {task.description || 'No description.'}
            </div>

            <div className="grid-2" style={{ fontSize: 13 }}>
              <div>
                <div className="label">Status</div>
                <span className="badge badge-neutral">{STATUS_LABEL[task.status]}</span>
              </div>
              <div>
                <div className="label">Department</div>
                <span style={{ color: 'var(--color-text-primary)' }}>{task.department || '—'}</span>
              </div>
              <div>
                <div className="label">Assignee</div>
                <span style={{ color: 'var(--color-text-primary)' }}>
                  {task.assigned_profile?.full_name || 'Unassigned'}
                </span>
              </div>
              <div>
                <div className="label">Due Date</div>
                <span style={{ color: 'var(--color-text-primary)' }}>{task.due_date || '—'}</span>
              </div>
            </div>
          </div>
        )}

        {tab === 'comments' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {loading && totalComments === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Loading comments…</p>
            ) : totalComments === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>No comments yet.</p>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  maxHeight: 280,
                  overflowY: 'auto',
                }}
              >
                {detail!.comments.map((c) => (
                  <div
                    key={c.id}
                    style={{ padding: '10px 12px', background: 'var(--color-surface-2)', borderRadius: 8 }}
                  >
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 4 }}>
                      {c.author?.full_name || 'Member'} · {fmt(c.created_at)}
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        color: 'var(--color-text-primary)',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {c.comment}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <form action={onAddComment} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input type="hidden" name="task_id" value={task.id} />
              <textarea
                name="comment"
                className="input"
                placeholder="Write a comment…"
                rows={2}
                required
              />
              <button
                type="submit"
                disabled={commentPending}
                className="btn btn-primary btn-sm"
                style={{ alignSelf: 'flex-end' }}
              >
                {commentPending ? 'Posting…' : 'Post Comment'}
              </button>
            </form>
          </div>
        )}

        {tab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {loading && totalActivities === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Loading history…</p>
            ) : totalActivities === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>No status changes recorded.</p>
            ) : (
              detail!.activities.map((a) => (
                <div key={a.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 100,
                      background: 'var(--color-brand)',
                      marginTop: 6,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ fontSize: 13 }}>
                    <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>
                      {a.actor?.full_name || 'Member'}
                    </span>{' '}
                    <span style={{ color: 'var(--color-text-secondary)' }}>
                      {a.from_status
                        ? `moved ${STATUS_LABEL[a.from_status]} → ${STATUS_LABEL[a.to_status]}`
                        : `created the task`}
                    </span>
                    <div style={{ fontSize: 11.5, color: 'var(--color-text-muted)', marginTop: 2 }}>
                      {fmt(a.created_at)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Footer (always visible) */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 10,
            marginTop: 20,
            paddingTop: 18,
            borderTop: '1px solid var(--color-border-subtle)',
          }}
        >
          {canDelete ? (
            <button onClick={() => onDelete(task)} className="btn btn-danger btn-sm">
              Delete Task
            </button>
          ) : (
            <span />
          )}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleClose} className="btn btn-ghost">
              Cancel
            </button>
            <button onClick={() => onEdit(task)} className="btn btn-secondary btn-sm">
              Edit Task
            </button>
          </div>
        </div>
      </div>
    </ModalOverlay>
  )
}
