'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useServerAction } from '@/lib/hooks/useServerAction'
import { submitDailyReport } from '@/features/team/report-actions'
import { createTeamTask } from '@/features/team/task-actions'
import { ReportSection } from './ReportSection'
import type { DailyReport } from '@/lib/team/report-queries'

interface Props {
  report: DailyReport
  userName: string
}

function tasksToText(tasks: DailyReport['todayPlan']): string {
  return tasks.map((t) => `- ${t.title}`).join('\n')
}

export function DailyReportClient({ report, userName }: Props) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [quickTitle, setQuickTitle] = useState('')
  const quickInputRef = useRef<HTMLInputElement>(null)

  const [executeSubmit, submitPending] = useServerAction({
    onSuccess: () => {
      router.push('/daily-sprint')
    },
    onError: (err) => setError(err),
  })

  function handleSubmit(formData: FormData) {
    setError(null)
    executeSubmit(() => submitDailyReport({}, formData), {
      error: (err) => ({ title: 'Could not submit report', description: err }),
    })
  }

  const [executeQuick, quickPending] = useServerAction({
    onSuccess: () => {
      setQuickTitle('')
      router.refresh()
    },
  })

  function handleQuickAdd() {
    const title = quickTitle.trim()
    if (!title) return
    const fd = new FormData()
    fd.set('title', title)
    fd.set('priority', 'MEDIUM')
    fd.set('due_date', report.date)
    executeQuick(() => createTeamTask({}, fd), {
      success: { title: 'Task created', description: 'Added to your To Do list.' },
      error: (err) => ({ title: 'Could not create task', description: err }),
    })
  }

  return (
    <form action={handleSubmit} style={{ maxWidth: 760, margin: '0 auto', padding: '0 12px 96px' }}>
      <input type="hidden" name="report_date" value={report.date} />

      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Morning Daily Report</h1>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
          {userName} · {report.date}
        </p>
      </div>

      {error && (
        <div
          style={{
            marginBottom: 12,
            padding: '10px 12px',
            borderRadius: 8,
            background: 'rgba(220, 38, 38, 0.08)',
            color: 'var(--color-danger, #dc2626)',
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <ReportSection title="Yesterday — Key Work Completed" icon={null}>
          <input type="hidden" name="yesterday" value={tasksToText(report.yesterdayCompleted)} />
          {report.yesterdayCompleted.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '8px 0' }}>No tasks completed yesterday.</p>
          ) : (
            report.yesterdayCompleted.map((t) => (
              <div key={t.id} style={{ padding: '6px 0', fontSize: 14, color: 'var(--color-text-primary)' }}>
                • {t.title}
              </div>
            ))
          )}
        </ReportSection>

        <ReportSection title="Today — Daily Action Plan" icon={null}>
          <input type="hidden" name="today" value={tasksToText(report.todayPlan)} />
          {report.todayPlan.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '8px 0' }}>No active tasks for today.</p>
          ) : (
            report.todayPlan.map((t) => (
              <div key={t.id} style={{ padding: '6px 0', fontSize: 14, color: 'var(--color-text-primary)' }}>
                • {t.title}
              </div>
            ))
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <input
              ref={quickInputRef}
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              className="input"
              placeholder="Quick add a task for today…"
              style={{ flex: 1, minHeight: 44 }}
            />
            <button
              type="button"
              className="btn btn-primary"
              disabled={quickPending}
              onClick={handleQuickAdd}
              style={{ minHeight: 44, minWidth: 44 }}
            >
              {quickPending ? '…' : '+'}
            </button>
          </div>
        </ReportSection>

        <ReportSection title="Pending / Carry Forward" icon={null}>
          <input type="hidden" name="pending" value={tasksToText(report.pendingCarry)} />
          {report.pendingCarry.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '8px 0' }}>Nothing carried forward.</p>
          ) : (
            report.pendingCarry.map((t) => (
              <div key={t.id} style={{ padding: '6px 0', fontSize: 14, color: 'var(--color-text-primary)' }}>
                • {t.title}
              </div>
            ))
          )}
        </ReportSection>

        <ReportSection title="Blockers / Support Required" icon={null}>
          <textarea
            name="blockers"
            className="input"
            defaultValue={tasksToText(report.blockers)}
            rows={3}
            style={{ width: '100%', minHeight: 60 }}
          />
        </ReportSection>

        <ReportSection title="Meetings / Follow-ups Today" icon={null}>
          <textarea
            name="followups"
            className="input"
            defaultValue={tasksToText(report.followUps)}
            rows={3}
            style={{ width: '100%', minHeight: 60 }}
          />
        </ReportSection>

        <ReportSection title="Priority Outcome for Today" icon={null}>
          <input
            name="priority"
            className="input"
            defaultValue={report.priorityOutcome}
            style={{ width: '100%', minHeight: 44 }}
          />
        </ReportSection>
      </div>

      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '12px 16px',
          background: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'center',
          zIndex: 40,
        }}
      >
        <button
          type="submit"
          className="btn btn-primary"
          disabled={submitPending}
          style={{ minHeight: 44, minWidth: 220 }}
        >
          {submitPending ? 'Submitting…' : 'Submit Morning Report'}
        </button>
      </div>
    </form>
  )
}