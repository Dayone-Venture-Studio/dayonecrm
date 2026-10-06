import { Activity } from 'lucide-react'
import type { StartupHealthSummary } from '@/lib/performance/calculateStartupHealth'

interface Props {
  health: StartupHealthSummary
}

export function FounderHealthCard({ health }: Props) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: 16,
          borderBottom: '1px solid #ede7d3',
          marginBottom: 18,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(202, 47, 43, 0.08)',
              border: '1px solid rgba(202, 47, 43, 0.16)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-brand)',
            }}
          >
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Venture Health Score
            </h2>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
              Live Execution Index
            </div>
          </div>
        </div>

        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '3px 10px',
            borderRadius: 100,
            fontSize: 11,
            fontWeight: 700,
            color: health.statusBadgeColor,
            background: `${health.statusBadgeColor}15`,
            border: `1px solid ${health.statusBadgeColor}35`,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: health.statusBadgeColor,
            }}
          />
          {health.status}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 20 }}>
        {/* Big Health Number Gauge */}
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: '50%',
            background: `radial-gradient(circle, #ffffff 58%, ${health.statusBadgeColor}15 100%)`,
            border: `3px solid ${health.statusBadgeColor}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: `0 4px 14px ${health.statusBadgeColor}20`,
          }}
        >
          <div
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: health.statusBadgeColor,
              lineHeight: 1,
              letterSpacing: '-1px',
            }}
          >
            {health.score}
          </div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginTop: 3,
            }}
          >
            Score / 100
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: 10 }}>
            {health.score >= 80
              ? 'Strong velocity and deliverable cadence. Team is meeting milestone targets with minimal impediment.'
              : health.score >= 60
              ? 'Operational pace is stable. Maintain vigilance on pending deliverables approaching target due dates.'
              : 'Execution lag detected. Immediate intervention required on overdue deliverables and blocked items.'}
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
              Overdue: <strong style={{ color: health.overdueTasks > 0 ? 'var(--color-danger)' : 'var(--color-text-primary)' }}>{health.overdueTasks}</strong>
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
              In Flight: <strong style={{ color: 'var(--color-info)' }}>{health.inProgressTasks}</strong>
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
              Completion: <strong style={{ color: 'var(--color-success)' }}>{health.completionRate}%</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-scores breakdown bars */}
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 14, borderTop: '1px solid #ede7d3' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, marginBottom: 4 }}>
            <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Velocity Index</span>
            <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{health.velocityScore} / 45</span>
          </div>
          <div className="progress-bar" style={{ height: 4 }}>
            <div className="progress-fill progress-fill-brand" style={{ width: `${(health.velocityScore / 45) * 100}%` }} />
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, marginBottom: 4 }}>
            <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Active Momentum</span>
            <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{health.momentumScore} / 35</span>
          </div>
          <div className="progress-bar" style={{ height: 4 }}>
            <div className="progress-fill" style={{ width: `${(health.momentumScore / 35) * 100}%`, background: 'var(--color-info)' }} />
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, marginBottom: 4 }}>
            <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Blocker Hygiene</span>
            <span style={{ fontWeight: 600, color: health.blockerScore >= 15 ? 'var(--color-success)' : 'var(--color-danger)' }}>{health.blockerScore} / 20</span>
          </div>
          <div className="progress-bar" style={{ height: 4 }}>
            <div
              className="progress-fill"
              style={{
                width: `${(health.blockerScore / 20) * 100}%`,
                background: health.blockerScore >= 15 ? 'var(--color-success)' : 'var(--color-danger)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}