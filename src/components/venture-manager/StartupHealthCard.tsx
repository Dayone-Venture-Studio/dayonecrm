import Link from 'next/link'
import { CompanyLogo } from '@/components/brand/CompanyLogo'
import type { StartupWithHealth } from '@/lib/venture-manager/portfolioAnalytics'
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  AlertTriangle,
  Users,
  CheckCircle,
  Clock,
  MessageSquare,
} from 'lucide-react'

interface Props {
  startup: StartupWithHealth
  notesCount?: number
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; border: string; accent: string }> = {
  Optimal:    { color: '#059669', bg: 'rgba(5,150,105,0.08)',   border: 'rgba(5,150,105,0.25)',   accent: '#059669' },
  'On Track': { color: '#0284c7', bg: 'rgba(2,132,199,0.08)',   border: 'rgba(2,132,199,0.25)',   accent: '#0284c7' },
  Attention:  { color: '#d97706', bg: 'rgba(217,119,6,0.08)',   border: 'rgba(217,119,6,0.25)',   accent: '#d97706' },
  'At Risk':  { color: '#ca2f2b', bg: 'rgba(202,47,43,0.08)',   border: 'rgba(202,47,43,0.25)',   accent: '#ca2f2b' },
}

export function StartupHealthCard({ startup, notesCount = 0 }: Props) {
  const { health, weekOverWeekDelta, teamCount } = startup
  const sc = STATUS_CONFIG[health.status] ?? STATUS_CONFIG['On Track']

  return (
    <div
      className="group hover:shadow-[var(--shadow-lg)] hover:-translate-y-0.5"
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 14,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'box-shadow 0.2s, transform 0.2s',
      }}
    >
      {/* Colored top accent bar */}
      <div style={{ height: 4, background: sc.accent }} />

      {/* Header */}
      <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--color-border-subtle)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <CompanyLogo logoUrl={startup.logo_url} name={startup.name} size="md" />
          <div style={{ minWidth: 0 }}>
            <h3 style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {startup.name}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5 }}>
              <span style={{
                fontSize: 11, fontWeight: 700, color: sc.color,
                background: sc.bg, border: `1px solid ${sc.border}`,
                borderRadius: 999, padding: '2px 9px',
              }}>
                {health.status}
              </span>
              {notesCount > 0 && (
                <span style={{
                  fontSize: 11, fontWeight: 600, color: '#d97706',
                  background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.25)',
                  borderRadius: 999, padding: '2px 8px',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  <MessageSquare size={10} />{notesCount}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Health Score ring */}
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            border: `3px solid ${sc.accent}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column',
          }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1 }}>{health.score}</div>
          </div>
          <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px' }}>Score</div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
        {/* Completion Rate */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 500 }}>Completion Rate</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>{health.completionRate}%</span>
              {weekOverWeekDelta && weekOverWeekDelta.completionRate !== 0 && (
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  color: weekOverWeekDelta.completionRate > 0 ? '#059669' : '#ca2f2b',
                  display: 'flex', alignItems: 'center', gap: 2,
                }}>
                  {weekOverWeekDelta.completionRate > 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {Math.abs(weekOverWeekDelta.completionRate).toFixed(1)}%
                </span>
              )}
            </div>
          </div>
          <div style={{ background: 'var(--color-surface-2)', borderRadius: 999, height: 6, overflow: 'hidden' }}>
            <div style={{ width: `${health.completionRate}%`, height: '100%', background: sc.accent, borderRadius: 999, transition: 'width 0.5s' }} />
          </div>
        </div>

        {/* Task Breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[['Done', health.doneTasks, '#059669'], ['In Progress', health.inProgressTasks, '#0284c7'], ['To Do', health.todoTasks, 'var(--color-text-muted)']].map(([label, val, color]) => (
            <div key={String(label)} style={{
              background: 'var(--color-surface-2)',
              borderRadius: 8, padding: '10px 8px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: String(color) }}>{val}</div>
              <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2, fontWeight: 600 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Indicators row */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', paddingTop: 8, borderTop: '1px solid var(--color-border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--color-text-muted)' }}>
            <Users size={13} /><span>{teamCount} members</span>
          </div>
          {health.overdueTasks > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#d97706', fontWeight: 600 }}>
              <Clock size={13} /><span>{health.overdueTasks} overdue</span>
            </div>
          )}
          {health.blockers.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#ca2f2b', fontWeight: 600 }}>
              <AlertTriangle size={13} /><span>{health.blockers.length} blockers</span>
            </div>
          )}
        </div>

        {/* WoW Change Banner */}
        {weekOverWeekDelta && weekOverWeekDelta.performanceStatusChange !== 'unchanged' && (
          <div style={{
            fontSize: 11, padding: '6px 10px', borderRadius: 8,
            background: weekOverWeekDelta.performanceStatusChange === 'improved' ? 'rgba(5,150,105,0.08)' : 'rgba(202,47,43,0.08)',
            border: `1px solid ${weekOverWeekDelta.performanceStatusChange === 'improved' ? 'rgba(5,150,105,0.25)' : 'rgba(202,47,43,0.25)'}`,
            color: weekOverWeekDelta.performanceStatusChange === 'improved' ? '#059669' : '#ca2f2b',
            display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600,
          }}>
            {weekOverWeekDelta.performanceStatusChange === 'improved'
              ? <TrendingUp size={11} />
              : <TrendingDown size={11} />}
            Performance {weekOverWeekDelta.performanceStatusChange} from last week
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '12px 20px', borderTop: '1px solid var(--color-border-subtle)' }}>
        <Link
          href={`/venture-manager/startups/${startup.id}`}
          className="group-hover:bg-[var(--color-brand)]"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '9px 16px',
            background: 'var(--color-text-primary)',
            color: '#fff',
            borderRadius: 8, fontSize: 13, fontWeight: 600,
            textDecoration: 'none',
            transition: 'background 0.15s',
          }}
        >
          View Details <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  )
}
