import type { ReactNode } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

export interface ReportKpi {
  label: string
  value: string | number
  icon: ReactNode
  accent: string
  sub?: ReactNode
}

export function ReportKpiCards({ kpis }: { kpis: ReportKpi[] }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16,
        marginBottom: 28,
      }}
    >
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 14,
            padding: '20px 22px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: kpi.accent,
              borderRadius: '14px 14px 0 0',
            }}
          />
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}
          >
            <p
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {kpi.label}
            </p>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: `${kpi.accent}18`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: kpi.accent,
                flexShrink: 0,
              }}
            >
              {kpi.icon}
            </div>
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: 'var(--color-text-primary)',
              letterSpacing: '-1px',
              lineHeight: 1,
              marginBottom: 12,
            }}
          >
            {kpi.value}
          </div>
          {kpi.sub ? <div>{kpi.sub}</div> : null}
        </div>
      ))}
    </div>
  )
}

interface DeltaBadgeProps {
  delta: number
  /** Lower values are better (e.g. overdue counts). */
  invert?: boolean
  suffix?: string
  referenceLabel: string
}

export function DeltaBadge({
  delta,
  invert = false,
  suffix = '%',
  referenceLabel,
}: DeltaBadgeProps) {
  if (delta === 0) {
    return (
      <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
        No change {referenceLabel}
      </span>
    )
  }

  const isGood = invert ? delta < 0 : delta > 0
  const color = isGood ? '#059669' : '#ca2f2b'
  const Icon = delta > 0 ? TrendingUp : TrendingDown

  return (
    <span
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 12,
        color,
        fontWeight: 600,
      }}
    >
      <Icon size={13} />
      {delta > 0 ? '+' : ''}
      {delta}
      {suffix}
      <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>
        {referenceLabel}
      </span>
    </span>
  )
}
