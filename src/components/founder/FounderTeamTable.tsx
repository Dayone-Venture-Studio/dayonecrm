import Link from 'next/link'
import { AlertCircle, ChevronRight, Users2 } from 'lucide-react'
import type { MemberPerformance } from '@/lib/performance/calculateMemberPerformance'

interface Props {
  teamPerf: MemberPerformance[]
  memberCount: number
}

export function FounderTeamTable({ teamPerf, memberCount }: Props) {
  return (
    <div className="card" style={{ marginTop: 28 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: 16,
          borderBottom: '1px solid #ede7d3',
          marginBottom: 20,
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
            <Users2 className="w-4 h-4" />
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Team Performance & Contributor Intelligence
            </h2>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
              Individual delivery rates, completion velocity, and active workload distribution
            </div>
          </div>
        </div>

        <Link
          href="/founder/staff"
          style={{
            fontSize: 12.5,
            fontWeight: 600,
            color: 'var(--color-brand)',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <span>Manage Team ({memberCount})</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {teamPerf.length === 0 ? (
        <div
          style={{
            padding: '24px',
            textAlign: 'center',
            color: 'var(--color-text-muted)',
            fontSize: 13,
          }}
        >
          No team members added yet. Invite staff from the{' '}
          <Link href="/founder/staff" style={{ color: 'var(--color-brand)' }}>
            Staff Management page
          </Link>
          .
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ede7d3', textAlign: 'left' }}>
                <th style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--color-text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                  Operator
                </th>
                <th style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--color-text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                  Role
                </th>
                <th style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--color-text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                  Tasks (Done / Active)
                </th>
                <th style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--color-text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.6px', minWidth: 140 }}>
                  Completion Rate
                </th>
                <th style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--color-text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                  Delivery Timeliness
                </th>
                <th style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--color-text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                  Overdue
                </th>
                <th style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--color-text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                  Score & Status
                </th>
              </tr>
            </thead>
            <tbody>
              {teamPerf.map((m) => {
                const statusColors = {
                  EXCELLING: { bg: '#ecfdf5', text: '#065f46', border: '#a7f3d0' },
                  ON_TRACK: { bg: '#f0f9ff', text: '#075985', border: '#bae6fd' },
                  NEEDS_SUPPORT: { bg: '#fffbeb', text: '#92400e', border: '#fde68a' },
                  LAGGING: { bg: '#fef2f2', text: '#991b1b', border: '#fecaca' },
                }
                const badgeStyle = statusColors[m.status] || statusColors.ON_TRACK

                return (
                  <tr
                    key={m.userId}
                    style={{
                      borderBottom: '1px solid #f2ede0',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    {/* Operator Name & Avatar */}
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: 'var(--color-brand)',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: 12,
                            flexShrink: 0,
                          }}
                        >
                          {m.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                            {m.fullName}
                          </div>
                          {m.email && (
                            <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                              {m.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td style={{ padding: '12px' }}>
                      <span className={`badge ${m.role === 'FOUNDER' ? 'badge-brand' : 'badge-neutral'}`}>
                        {m.role || 'STAFF'}
                      </span>
                    </td>

                    {/* Tasks breakdown */}
                    <td style={{ padding: '12px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {m.completedTasks}
                      </span>
                      <span style={{ color: 'var(--color-text-muted)' }}> / {m.totalTasks}</span>
                      {m.inProgressTasks > 0 && (
                        <span style={{ fontSize: 11, color: 'var(--color-info)', marginLeft: 6 }}>
                          ({m.inProgressTasks} active)
                        </span>
                      )}
                    </td>

                    {/* Completion Bar */}
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="progress-bar" style={{ height: 6, flex: 1, minWidth: 60 }}>
                          <div
                            className="progress-fill progress-fill-brand"
                            style={{ width: `${m.completionRate}%` }}
                          />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)', width: 34 }}>
                          {m.completionRate}%
                        </span>
                      </div>
                    </td>

                    {/* Timeliness Split */}
                    <td style={{ padding: '12px' }}>
                      {m.completedTasks === 0 ? (
                        <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>—</span>
                      ) : (
                        <div style={{ display: 'flex', gap: 4 }}>
                          {m.earlyCount > 0 && (
                            <span style={{ fontSize: 10.5, padding: '1px 6px', borderRadius: 4, background: '#ecfdf5', color: '#065f46', fontWeight: 600 }}>
                              {m.earlyCount} early
                            </span>
                          )}
                          {m.onTimeCount > 0 && (
                            <span style={{ fontSize: 10.5, padding: '1px 6px', borderRadius: 4, background: '#f0f9ff', color: '#0369a1', fontWeight: 600 }}>
                              {m.onTimeCount} on-time
                            </span>
                          )}
                          {m.lateCount > 0 && (
                            <span style={{ fontSize: 10.5, padding: '1px 6px', borderRadius: 4, background: '#fff1f2', color: '#be123c', fontWeight: 600 }}>
                              {m.lateCount} late
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Overdue Count */}
                    <td style={{ padding: '12px' }}>
                      {m.overdueCount > 0 ? (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: '#991b1b',
                            background: '#fef2f2',
                            padding: '2px 8px',
                            borderRadius: 4,
                            border: '1px solid #fecaca',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 3,
                          }}
                        >
                          <AlertCircle className="w-3 h-3" />
                          {m.overdueCount} overdue
                        </span>
                      ) : (
                        <span style={{ fontSize: 12, color: 'var(--color-success)', fontWeight: 500 }}>
                          0
                        </span>
                      )}
                    </td>

                    {/* Score & Status */}
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                          {m.performanceScore}
                        </span>
                        <span
                          style={{
                            fontSize: 10.5,
                            fontWeight: 700,
                            padding: '2px 7px',
                            borderRadius: 6,
                            background: badgeStyle.bg,
                            color: badgeStyle.text,
                            border: `1px solid ${badgeStyle.border}`,
                            letterSpacing: '0.3px',
                          }}
                        >
                          {m.status.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}