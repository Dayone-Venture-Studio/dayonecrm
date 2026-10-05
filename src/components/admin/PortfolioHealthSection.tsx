import Link from 'next/link'
import { Activity, AlertTriangle, ArrowRight, CheckCircle, MonitorPlay } from 'lucide-react'
import { CompanyLogo } from '@/components/brand/CompanyLogo'
import type { StartupHealthCardData } from '@/lib/startups/adminQueries'

function HealthCard({ card }: { card: StartupHealthCardData }) {
  const { health } = card
  const hasBlockers = health.blockers.length > 0

  return (
    <div
      className="card"
      style={{
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        borderColor:
          health.status === 'At Risk'
            ? '#fca5a5'
            : health.status === 'Attention'
            ? '#fcd34d'
            : 'var(--color-border)',
        background:
          health.status === 'At Risk'
            ? 'linear-gradient(to bottom, #ffffff, #fffdfd)'
            : '#ffffff',
      }}
    >
      {/* Header: Logo, Name, and Health Score Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <CompanyLogo logoUrl={card.logo_url} name={card.name} size={40} />
          <div style={{ minWidth: 0 }}>
            <Link
              href={`/admin/startups/${card.id}`}
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                textDecoration: 'none',
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {card.name}
            </Link>
            <div style={{ fontSize: 11.5, color: 'var(--color-text-muted)' }}>
              {card.teamCount} team member{card.teamCount === 1 ? '' : 's'}
            </div>
          </div>
        </div>

        {/* Health Score Pill */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '3px 9px',
              borderRadius: 8,
              background: `${health.statusBadgeColor}15`,
              border: `1px solid ${health.statusBadgeColor}35`,
              color: health.statusBadgeColor,
              fontWeight: 800,
              fontSize: 13,
            }}
          >
            <span>{health.score}</span>
            <span style={{ fontSize: 9.5, opacity: 0.8, textTransform: 'uppercase' }}>/100</span>
          </div>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: health.statusBadgeColor,
              marginTop: 2,
            }}
          >
            {health.status}
          </span>
        </div>
      </div>

      {/* Completion Bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
          <span style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--color-text-secondary)' }}>
            Sprint Delivery
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {health.completionRate}% ({health.doneTasks}/{health.totalTasks} tasks)
          </span>
        </div>
        <div className="progress-bar" style={{ height: 6 }}>
          <div className="progress-fill progress-fill-brand" style={{ width: `${health.completionRate}%` }} />
        </div>
      </div>

      {/* Critical Blockers Status */}
      <div
        style={{
          padding: '8px 10px',
          borderRadius: 8,
          background: hasBlockers ? '#fff7ed' : '#f0fdf4',
          border: `1px solid ${hasBlockers ? '#fed7aa' : '#bbf7d0'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {hasBlockers ? (
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
          ) : (
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          )}
          <span style={{ fontWeight: 600, color: hasBlockers ? '#9a3412' : '#166534' }}>
            {hasBlockers
              ? `${health.blockers.length} active blocker${health.blockers.length > 1 ? 's' : ''}`
              : 'Pacing healthy • No blockers'}
          </span>
        </div>

        {health.overdueTasks > 0 && (
          <span
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              color: '#b91c1c',
              background: '#fef2f2',
              padding: '1px 6px',
              borderRadius: 4,
            }}
          >
            {health.overdueTasks} overdue
          </span>
        )}
      </div>

      {/* Bottom Actions: TV Wall Link + Details Link */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 'auto', paddingTop: 6 }}>
        <Link
          href={`/tv/${card.id}`}
          target="_blank"
          className="btn btn-secondary btn-sm"
          style={{ flex: 1, justifyContent: 'center', fontSize: 11.5 }}
        >
          <MonitorPlay className="w-3 h-3 text-purple-600" />
          <span>TV Display</span>
        </Link>
        <Link
          href={`/admin/startups/${card.id}`}
          className="btn btn-secondary btn-sm"
          style={{ flex: 1, justifyContent: 'center', fontSize: 11.5 }}
        >
          <span>Venture Hub</span>
          <ArrowRight className="w-3 h-3 text-gray-500" />
        </Link>
      </div>
    </div>
  )
}

export function PortfolioHealthSection({
  cards,
  avgHealth,
  atRiskCount,
}: {
  cards: StartupHealthCardData[]
  avgHealth: number
  atRiskCount: number
}) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)' }}>
            Portfolio Health &amp; Performance Command
          </h2>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0 }}>
            Live execution score, delivery velocity, and critical blockers across all ventures
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: 100,
              background: '#ffffff',
              border: '1px solid #e5dfcb',
              fontSize: 12.5,
              fontWeight: 600,
            }}
          >
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>Studio Avg Health:</span>
            <strong style={{ color: 'var(--color-text-primary)', fontSize: 14 }}>{avgHealth}/100</strong>
          </div>

          {atRiskCount > 0 && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '6px 12px',
                borderRadius: 100,
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              {atRiskCount} {atRiskCount === 1 ? 'Startup' : 'Startups'} Need Support
            </span>
          )}

          <Link href="/admin/performance" className="btn btn-secondary btn-sm">
            Full Analytics →
          </Link>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 16,
        }}
      >
        {cards.map((card) => (
          <HealthCard key={card.id} card={card} />
        ))}
      </div>
    </div>
  )
}
