'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ModalOverlay } from '@/components/ui/ModalOverlay'
import { useServerAction } from '@/lib/hooks/useServerAction'
import { applyLeave, reviewLeave, cancelLeave } from '@/features/leave/actions'
import type { SessionUser, LeaveRequestWithProfile, LeaveDurationType } from '@/types'

interface Props {
  session: SessionUser
  requests: LeaveRequestWithProfile[]
  isManager: boolean
}

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'badge-warning',
  APPROVED: 'badge-success',
  REJECTED: 'badge-danger',
  CANCELLED: 'badge-neutral',
}

function formatDate(value: string) {
  return new Date(value + 'T00:00:00').toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function dayCount(start: string, end: string) {
  const s = new Date(start + 'T00:00:00')
  const e = new Date(end + 'T00:00:00')
  return Math.round((e.getTime() - s.getTime()) / 86400000) + 1
}

export function LeaveClient({ session, requests, isManager }: Props) {
  const router = useRouter()
  const [durationType, setDurationType] = useState<LeaveDurationType>('FULL_DAY')
  const [activeTab, setActiveTab] = useState<string>(isManager ? 'approvals' : 'apply')
  const [reviewing, setReviewing] = useState<{
    request: LeaveRequestWithProfile
    decision: 'APPROVE' | 'REJECT'
  } | null>(null)
  const [viewingNote, setViewingNote] = useState<LeaveRequestWithProfile | null>(null)
  const [reviewNote, setReviewNote] = useState('')

  const [executeApply, applyPending] = useServerAction({
    onSuccess: () => {
      setActiveTab(isManager ? 'all' : 'history')
      router.refresh()
    },
  })

  const [executeReview, reviewPending] = useServerAction({
    onSuccess: () => {
      setReviewing(null)
      setReviewNote('')
      router.refresh()
    },
  })

  const [executeCancel, cancelPending] = useServerAction({
    onSuccess: () => {
      router.refresh()
    },
  })

  function handleApply(formData: FormData) {
    formData.set('duration_type', durationType)
    if (durationType === 'HALF_DAY') {
      const start = String(formData.get('start_date') ?? '')
      formData.set('end_date', start)
      formData.set('half_day_slot', String(formData.get('half_day_slot') ?? 'FIRST_HALF'))
    } else {
      formData.delete('half_day_slot')
    }
    executeApply(() => applyLeave({}, formData), {
      success: { title: 'Leave requested', description: 'Your request has been submitted.' },
      error: (error) => ({ title: 'Could not submit leave', description: error }),
    })
  }

  function handleReview() {
    if (!reviewing) return
    const formData = new FormData()
    formData.set('id', reviewing.request.id)
    formData.set('decision', reviewing.decision)
    formData.set('review_note', reviewNote)
    executeReview(() => reviewLeave({}, formData), {
      success: {
        title: reviewing.decision === 'APPROVE' ? 'Approved' : 'Rejected',
        description: 'The leave request has been updated.',
      },
      error: (error) => ({ title: 'Could not review request', description: error }),
    })
  }

  function handleCancel(id: string) {
    const formData = new FormData()
    formData.set('id', id)
    executeCancel(() => cancelLeave({}, formData), {
      success: { title: 'Cancelled', description: 'Leave request cancelled.' },
      error: (error) => ({ title: 'Could not cancel', description: error }),
    })
  }

  const pendingRequests = requests.filter((r) => r.status === 'PENDING')
  const myRequests = requests.filter((r) => r.user_id === session.id)

  const tabs = isManager
    ? [
        { id: 'approvals', label: `Pending Approvals (${pendingRequests.length})` },
        { id: 'all', label: 'All Requests' },
        { id: 'apply', label: 'Apply Leave' },
      ]
    : [
        { id: 'apply', label: 'Apply Leave' },
        { id: 'history', label: 'My Requests' },
      ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Leave Management</h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
          {isManager
            ? 'Review team leave requests and apply for your own leave.'
            : 'Apply for leave and track your requests.'}
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--color-border)', paddingBottom: 0 }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 16px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid var(--color-brand)' : '2px solid transparent',
              color: activeTab === tab.id ? 'var(--color-brand)' : 'var(--color-text-secondary)',
              fontWeight: activeTab === tab.id ? 600 : 400,
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Apply Leave */}
      {activeTab === 'apply' && (
        <div className="card" style={{ maxWidth: 640 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Apply for leave</h2>
          <form action={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="label">Leave type</label>
              <div style={{ display: 'flex', gap: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="duration_type_ui"
                    checked={durationType === 'FULL_DAY'}
                    onChange={() => setDurationType('FULL_DAY')}
                  />
                  Full day
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="duration_type_ui"
                    checked={durationType === 'HALF_DAY'}
                    onChange={() => setDurationType('HALF_DAY')}
                  />
                  Half day
                </label>
              </div>
            </div>

            {durationType === 'HALF_DAY' ? (
              <div className="grid-2">
                <div className="form-group">
                  <label className="label">Date *</label>
                  <input name="start_date" type="date" className="input" required />
                </div>
                <div className="form-group">
                  <label className="label">Which half *</label>
                  <select name="half_day_slot" className="input" required defaultValue="FIRST_HALF">
                    <option value="FIRST_HALF">First half (morning)</option>
                    <option value="SECOND_HALF">Second half (afternoon)</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="grid-2">
                <div className="form-group">
                  <label className="label">Start date *</label>
                  <input name="start_date" type="date" className="input" required />
                </div>
                <div className="form-group">
                  <label className="label">End date *</label>
                  <input name="end_date" type="date" className="input" required />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="label">Reason *</label>
              <textarea
                name="reason"
                className="input"
                rows={4}
                placeholder="Briefly describe the reason for your leave…"
                required
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" disabled={applyPending} className="btn btn-primary">
                {applyPending ? 'Submitting…' : 'Submit request'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* History / All requests */}
      {(activeTab === 'history' || activeTab === 'all' || activeTab === 'approvals') && (
        <LeaveTable
          requests={
            activeTab === 'approvals'
              ? pendingRequests
              : activeTab === 'history'
              ? myRequests
              : requests
          }
          session={session}
          isManager={isManager}
          showRequester={isManager}
          onCancel={handleCancel}
          cancelPending={cancelPending}
          onReview={(req, decision) => {
            setReviewing({ request: req, decision })
            setReviewNote('')
          }}
          onViewNote={(req) => setViewingNote(req)}
        />
      )}

      {/* Review modal */}
      <ModalOverlay
        isOpen={!!reviewing}
        onClose={() => {
          setReviewing(null)
          setReviewNote('')
        }}
      >
        <div className="card" style={{ width: '100%', maxWidth: 480 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
            {reviewing?.decision === 'APPROVE' ? 'Approve leave' : 'Reject leave'}
          </h2>
          {reviewing && (
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 16 }}>
              {reviewing.request.requester?.full_name} ·{' '}
              {formatDate(reviewing.request.start_date)}
              {reviewing.request.start_date !== reviewing.request.end_date
                ? ` – ${formatDate(reviewing.request.end_date)}`
                : ''}{' '}
              · {reviewing.request.duration_type === 'HALF_DAY'
                ? reviewing.request.half_day_slot === 'FIRST_HALF'
                  ? 'First half'
                  : 'Second half'
                : `${dayCount(reviewing.request.start_date, reviewing.request.end_date)} day(s)`}
            </p>
          )}
          <div className="form-group">
            <label className="label">Note (optional)</label>
            <textarea
              className="input"
              rows={3}
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              placeholder="Add a note for the requester…"
              style={{ resize: 'vertical' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
            <button
              type="button"
              onClick={() => {
                setReviewing(null)
                setReviewNote('')
              }}
              className="btn btn-ghost"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleReview}
              disabled={reviewPending}
              className={
                reviewing?.decision === 'APPROVE' ? 'btn btn-primary' : 'btn btn-danger'
              }
            >
              {reviewPending
                ? 'Saving…'
                : reviewing?.decision === 'APPROVE'
                ? 'Approve'
                : 'Reject'}
            </button>
          </div>
        </div>
      </ModalOverlay>

      {/* Review note modal */}
      <ModalOverlay
        isOpen={!!viewingNote}
        onClose={() => setViewingNote(null)}
      >
        <div className="card" style={{ width: '100%', minWidth: 'min(720px, 100%)', maxWidth: 900 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Review note</h2>
          {viewingNote && (
            <>
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 12 }}>
                {viewingNote.requester?.full_name ?? '—'} · {viewingNote.status}
                {viewingNote.reviewer?.full_name ? ` · by ${viewingNote.reviewer.full_name}` : ''}
              </p>
              <div
                style={{
                  padding: 12,
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  fontSize: 18,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {viewingNote.review_note}
              </div>
            </>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <button
              type="button"
              onClick={() => setViewingNote(null)}
              className="btn btn-primary"
            >
              Close
            </button>
          </div>
        </div>
      </ModalOverlay>
    </div>
  )
}

interface TableProps {
  requests: LeaveRequestWithProfile[]
  session: SessionUser
  isManager: boolean
  showRequester: boolean
  onCancel: (id: string) => void
  cancelPending: boolean
  onReview: (req: LeaveRequestWithProfile, decision: 'APPROVE' | 'REJECT') => void
  onViewNote: (req: LeaveRequestWithProfile) => void
}

function LeaveTable({
  requests,
  session,
  isManager,
  showRequester,
  onCancel,
  cancelPending,
  onReview,
  onViewNote,
}: TableProps) {
  if (requests.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🌿</div>
        <h3>No leave requests</h3>
        <p>Nothing to show here yet.</p>
      </div>
    )
  }

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            {showRequester && <th>Employee</th>}
            <th>Type</th>
            <th>Dates</th>
            <th>Days</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Reviewer</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req) => {
            const isOwn = req.user_id === session.id
            const canCancel = isOwn && req.status === 'PENDING'
            const canReview = isManager && !isOwn && req.status === 'PENDING'
            return (
              <tr key={req.id}>
                {showRequester && (
                  <td>
                    <div style={{ fontWeight: 600 }}>{req.requester?.full_name ?? '—'}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                      {req.requester?.department ?? ''}
                    </div>
                  </td>
                )}
                <td>
                  <span className="badge badge-neutral">
                    {req.duration_type === 'HALF_DAY'
                      ? req.half_day_slot === 'FIRST_HALF'
                        ? 'Half day (AM)'
                        : 'Half day (PM)'
                      : 'Full day'}
                  </span>
                </td>
                <td style={{ fontSize: 13 }}>
                  {formatDate(req.start_date)}
                  {req.start_date !== req.end_date && (
                    <>
                      <br />
                      <span style={{ color: 'var(--color-text-muted)' }}>to {formatDate(req.end_date)}</span>
                    </>
                  )}
                </td>
                <td>
                  {req.duration_type === 'HALF_DAY'
                    ? '0.5'
                    : dayCount(req.start_date, req.end_date)}
                </td>
                <td style={{ maxWidth: 240, fontSize: 13 }}>{req.reason}</td>
                <td>
                  <span className={`badge ${STATUS_COLOR[req.status] ?? 'badge-neutral'}`}>
                    {req.status}
                  </span>
                  {req.review_note && (
                    <button
                      type="button"
                      onClick={() => onViewNote(req)}
                      title="View review note"
                      style={{
                        marginLeft: 6,
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 14,
                        lineHeight: 1,
                        verticalAlign: 'middle',
                      }}
                    >
                      💬
                    </button>
                  )}
                </td>
                <td style={{ fontSize: 12 }}>
                  {req.reviewer?.full_name ?? '—'}
                  {req.reviewed_at && (
                    <div style={{ color: 'var(--color-text-muted)' }}>
                      {new Date(req.reviewed_at).toLocaleDateString()}
                    </div>
                  )}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    {canReview && (
                      <>
                        <button
                          onClick={() => onReview(req, 'APPROVE')}
                          className="btn btn-primary btn-sm"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => onReview(req, 'REJECT')}
                          className="btn btn-danger btn-sm"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {canCancel && (
                      <button
                        onClick={() => onCancel(req.id)}
                        disabled={cancelPending}
                        className="btn btn-ghost btn-sm"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}