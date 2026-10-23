'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useServerAction } from '@/lib/hooks/useServerAction'
import { submitDailyReport, deleteDailyReport } from '@/features/team/report-actions'
import type { DailyReport } from '@/lib/team/report-queries'
import type { DailyReportSubmission, DailyReportWithProfile } from '@/lib/team/report-queries'
import { ChevronLeft, ChevronRight, Plus, CheckCircle2, ListTodo, Clock, AlertTriangle, CalendarDays, Target, Inbox, MoreHorizontal, Edit2, Trash2 } from 'lucide-react'
import { ModalOverlay, ModalCloseButton } from '@/components/ui/ModalOverlay'

interface Props {
  report: DailyReport
  reports: DailyReportWithProfile[]
  existing: DailyReportSubmission | null
  selectedDate: string
  currentUserId: string
}

function toLocalISO(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatDateLabel(date: string): string {
  const d = new Date(date + 'T00:00:00')
  return d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

function addDays(date: string, delta: number): string {
  const d = new Date(date + 'T00:00:00')
  d.setDate(d.getDate() + delta)
  return toLocalISO(d)
}

function tasksToText(tasks: { title: string }[]): string {
  return tasks.map((t) => `- ${t.title}`).join('\n')
}

export function DailyFeedClient({ report, reports, existing, selectedDate, currentUserId }: Props) {
  const router = useRouter()
  const [composerOpen, setComposerOpen] = useState(false)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const today = toLocalISO(new Date())
  const canGoNext = selectedDate < today

  const [executeSubmit, submitPending] = useServerAction({
    onSuccess: () => {
      setComposerOpen(false)
      router.refresh()
    },
    onError: (err) => setError(err),
  })

  const [executeDelete, deletePending] = useServerAction({
    onSuccess: () => {
      setOpenMenuId(null)
      router.refresh()
    },
  })

  function navigate(date: string) {
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = `/daily-feed?date=${date}`
  }

  function handleSubmit(formData: FormData) {
    setError(null)
    formData.set('report_date', selectedDate)
    executeSubmit(() => submitDailyReport({}, formData), {
      error: (err) => ({ title: 'Could not publish', description: err }),
    })
  }

  return (
    <div style={{ maxWidth: 740, margin: '0 auto', padding: '0 12px 96px' }}>
      {/* Date navigator - sticky below page header */}
      <div className="sticky-date-nav">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div style={{ textAlign: 'left', flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{formatDateLabel(selectedDate)}</div>
            {selectedDate === today && (
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>Today</div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => navigate(addDays(selectedDate, -1))}
              aria-label="Previous day"
              style={{ minHeight: 44, minWidth: 44 }}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => canGoNext && navigate(addDays(selectedDate, 1))}
              disabled={!canGoNext}
              aria-label="Next day"
              style={{ minHeight: 44, minWidth: 44, opacity: canGoNext ? 1 : 0.4 }}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Feed list */}
      {reports.length === 0 ? (
        <div
          className="card"
          style={{
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            padding: 24,
            textAlign: 'center',
          }}
        >
          <div style={{ color: 'var(--color-text-muted)', opacity: 0.5 }}>
            <Inbox size={56} />
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)' }}>No reports for this date</div>
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)', margin: 0, maxWidth: 320 }}>
            {selectedDate === today
              ? 'Tap the + button to publish your daily report.'
              : 'No one has published a report for this date yet.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {reports.map((r) => {
            const c = (r.content || {}) as Record<string, string>
            const name = r.profile?.full_name || 'Team member'
            return (
              <article 
                key={r.id} 
                className="card" 
                style={{ 
                  padding: 0, 
                  overflow: 'hidden',
                  borderRadius:0
                }}>
                <header
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '14px 16px',
                    borderBottom: '1px solid var(--color-border)',
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: 'var(--color-brand-dim, rgba(202,47,43,0.1))',
                      color: 'var(--color-brand, #ca2f2b)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: 16,
                      flexShrink: 0,
                    }}
                  >
                    {(name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{name}</div>
                    {r.profile?.department && (
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                        {r.profile.department}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 15,
                        color: 'var(--color-text-primary, #000000)',
                        textAlign: 'right',
                      }}
                    >
                      {new Date(r.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {r.user_id === currentUserId && (
                      <div style={{ position: 'relative' }}>
                        <button
                          type="button"
                          onClick={() => setOpenMenuId(openMenuId === r.id ? null : r.id)}
                          aria-label="More options"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 4,
                            display: 'flex',
                            alignItems: 'center',
                            color: 'var(--color-text-muted)',
                          }}
                        >
                          <MoreHorizontal size={18} />
                        </button>
                        {openMenuId === r.id && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '100%',
                              right: 0,
                              marginTop: 4,
                              background: 'var(--color-surface, #fff)',
                              border: '1px solid var(--color-border)',
                              borderRadius: 8,
                              boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                              minWidth: 140,
                              zIndex: 20,
                              overflow: 'hidden',
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuId(null)
                                setComposerOpen(true)
                              }}
                              style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '10px 12px',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: 14,
                                color: 'var(--color-text-primary)',
                                textAlign: 'left',
                              }}
                            >
                              <Edit2 size={14} /> Edit
                            </button>
                            <button
                              type="button"
                              disabled={deletePending}
                              onClick={() => {
                                const fd = new FormData()
                                fd.set('report_id', r.id)
                                executeDelete(() => deleteDailyReport({}, fd), {
                                  success: { title: 'Deleted', description: 'Report removed.' },
                                  error: (err) => ({ title: 'Could not delete', description: err }),
                                })
                              }}
                              style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '10px 12px',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: 14,
                                color: 'var(--color-danger, #dc2626)',
                                textAlign: 'left',
                              }}
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </header>

                <div style={{ padding: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                      { icon: <CheckCircle2 size={14} />, label: 'Yesterday — Key Work Completed', value: c.yesterday },
                      { icon: <ListTodo size={14} />, label: 'Today — Daily Action Plan', value: c.today },
                      { icon: <Clock size={14} />, label: 'Pending / Carry Forward', value: c.pending },
                      { icon: <AlertTriangle size={14} />, label: 'Blockers / Support Required', value: c.blockers },
                      { icon: <CalendarDays size={14} />, label: 'Meetings / Follow-ups Today', value: c.followups },
                      { icon: <Target size={14} />, label: 'Priority Outcome for Today', value: c.priority },
                    ].map((section) => (
                      <div key={section.label} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <span style={{ color: 'var(--color-text-muted)', marginTop: 2, flexShrink: 0 }}>{section.icon}</span>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2 }}>
                            {section.label}
                          </div>
                          <div style={{ fontSize: 14, color: 'var(--color-text-primary)', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                            {section.value || '—'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {/* Click-outside overlay for dropdown */}
      {openMenuId && (
        <div
          onClick={() => setOpenMenuId(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 15 }}
        />
      )}

      {/* Floating Add button (today only) - rendered outside scrollable container */}
      {selectedDate === today && (
        <button
          type="button"
          onClick={() => setComposerOpen(true)}
          aria-label="Add daily report"
          className="daily-feed-fab"
        >
          <Plus size={26} strokeWidth={2.5} />
        </button>
      )}

      {/* Composer modal */}
      <ModalOverlay isOpen={composerOpen} onClose={() => setComposerOpen(false)} ariaLabel="Publish daily report">
        <div className="card daily-feed-composer" style={{ maxHeight: '90vh', overflow: 'hidden', padding: 16, position: 'relative', display: 'flex', flexDirection: 'column' }}>
          <ModalCloseButton onClose={() => setComposerOpen(false)} />
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 12px', flexShrink: 0 }}>Publish Daily Report</h2>

            {error && (
              <div style={{ marginBottom: 12, padding: '10px 12px', borderRadius: 8, background: 'rgba(220,38,38,0.08)', color: 'var(--color-danger,#dc2626)', fontSize: 13 }}>
                {error}
              </div>
            )}

            <div style={{ overflowY: 'auto', flex: 1, minHeight: 0, scrollbarWidth: 'none' }} className="daily-feed-composer-body">
              <form action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input type="hidden" name="report_date" value={selectedDate} />

              {[
                ['yesterday', 'Yesterday — Key Work Completed', tasksToText(report.yesterdayCompleted), 3],
                ['today', 'Today — Daily Action Plan', tasksToText(report.todayPlan), 3],
                ['pending', 'Pending / Carry Forward', tasksToText(report.pendingCarry), 2],
                ['blockers', 'Blockers / Support Required', tasksToText(report.blockers), 2],
                ['followups', 'Meetings / Follow-ups Today', tasksToText(report.followUps), 2],
              ].map(([name, label, defaultValue, rows]) => (
                <div key={String(name)} className="form-group">
                  <label className="label">{label}</label>
                  <textarea
                    name={String(name)}
                    className="input"
                    defaultValue={(existing?.content as Record<string, string>)?.[String(name)] || (defaultValue as string)}
                    rows={rows as number}
                    style={{ width: '100%' }}
                  />
                </div>
              ))}

              <div className="form-group">
                <label className="label">Priority Outcome for Today</label>
                <input
                  name="priority"
                  className="input"
                  defaultValue={(existing?.content as Record<string, string>)?.priority || report.priorityOutcome}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setComposerOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitPending} style={{ minHeight: 44 }}>
                  {submitPending ? 'Publishing…' : 'Publish'}
                </button>
              </div>
            </form>
            </div>
        </div>
      </ModalOverlay>
    </div>
  )
}