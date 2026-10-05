import Link from 'next/link'
import { AlertOctagon, AlertTriangle, ArrowRight, CheckCircle } from 'lucide-react'
import type { StartupHealthSummary } from '@/lib/performance/calculateStartupHealth'

interface Props {
  health: StartupHealthSummary
}

export function FounderBlockersCard({ health }: Props) {
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
              background: health.blockers.length > 0 ? 'rgba(202, 47, 43, 0.08)' : 'rgba(5, 150, 105, 0.08)',
              border: `1px solid ${health.blockers.length > 0 ? 'rgba(202, 47, 43, 0.16)' : 'rgba(5, 150, 105, 0.16)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: health.blockers.length > 0 ? 'var(--color-danger)' : 'var(--color-success)',
            }}
          >
            {health.blockers.length > 0 ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          </div>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Critical Blockers & Lag
            </h2>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
              Where & Which Work is Stalled
            </div>
          </div>
        </div>

        <span
          className={`badge ${health.blockers.length > 0 ? 'badge-danger' : 'badge-success'}`}
          style={{ fontSize: 11 }}
        >
          {health.blockers.length} {health.blockers.length === 1 ? 'Blocker' : 'Blockers'}
        </span>
      </div>

      {health.blockers.length === 0 ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px 16px',
            textAlign: 'center',
            background: '#fcfbfa',
            border: '1px dashed #e2dbbe',
            borderRadius: 10,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 10,
            }}
          >
            <CheckCircle className="w-6 h-6" />
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>
            Zero Blockers Detected
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--color-text-secondary)', maxWidth: 280, margin: 0 }}>
            All deliverables are tracking within their planned timelines with no overdue items.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
          {health.blockers.slice(0, 4).map((b) => (
            <div
              key={b.id}
              style={{
                padding: '10px 12px',
                borderRadius: 8,
                background: b.urgency === 'CRITICAL' ? '#fff5f5' : '#fffbeb',
                border: `1px solid ${b.urgency === 'CRITICAL' ? '#fecaca' : '#fde68a'}`,
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 10,
              }}
            >
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: 9.5,
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: 4,
                      letterSpacing: '0.4px',
                      background: b.urgency === 'CRITICAL' ? '#ca2f2b' : '#d97706',
                      color: '#ffffff',
                    }}
                  >
                    {b.urgency}
                  </span>
                  <span className="badge badge-neutral" style={{ fontSize: 10 }}>
                    {b.domainName}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                    • {b.assigneeName}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    marginBottom: 3,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {b.title}
                </div>
                <div style={{ fontSize: 11.5, color: b.urgency === 'CRITICAL' ? '#991b1b' : '#92400e', fontWeight: 500 }}>
                  ⚠️ {b.lagReason}
                </div>
              </div>

              <Link
                href="/founder/tasks"
                style={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: 'var(--color-brand)',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  padding: '4px 8px',
                  borderRadius: 6,
                  background: '#ffffff',
                  border: '1px solid #e5dfcb',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                <span>Resolve</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ))}

          {health.blockers.length > 4 && (
            <div style={{ textAlign: 'center', paddingTop: 4 }}>
              <Link
                href="/founder/tasks"
                style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-brand)', textDecoration: 'none' }}
              >
                +{health.blockers.length - 4} more blocked tasks → View all in Tasks
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Lagging Domains Pill Summary */}
      {health.domains.some((d) => d.isLagging) && (
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #ede7d3' }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--color-text-muted)', marginBottom: 8 }}>
            Lagging Operational Pillars:
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {health.domains
              .filter((d) => d.isLagging)
              .map((ld) => (
                <span
                  key={ld.id}
                  style={{
                    fontSize: 11,
                    padding: '3px 8px',
                    borderRadius: 6,
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#991b1b',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <AlertOctagon className="w-3 h-3" />
                  {ld.name}: {ld.lagReason}
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}