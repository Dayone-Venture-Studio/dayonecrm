import Link from 'next/link'
import { AlertTriangle, ArrowUpRight, CheckSquare, Layers, Target, UserPlus, Zap } from 'lucide-react'
import { FounderLogoManager } from '@/components/brand/FounderLogoManager'
import type { FounderTaskStats } from '@/lib/startups/founderQueries'

interface Props {
  taskStats: FounderTaskStats
  startupId: string | null
  startupName: string
  startupLogoUrl: string | null
}

export function FounderVelocityCard({ taskStats, startupId, startupName, startupLogoUrl }: Props) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
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
              background: 'rgba(5, 150, 105, 0.08)',
              border: '1px solid rgba(5, 150, 105, 0.16)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-success)',
            }}
          >
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Velocity & Quick Actions
            </h2>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
              Execution Quality & Operations
            </div>
          </div>
        </div>

        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--color-text-muted)',
            background: '#f8f6ed',
            padding: '3px 8px',
            borderRadius: 6,
            border: '1px solid #e2dbbe',
          }}
        >
          Sprint Cadence
        </span>
      </div>

      {/* Delivery Velocity Breakdown */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--color-text-muted)', marginBottom: 12 }}>
          Delivery Velocity Breakdown
        </div>

        {taskStats.done === 0 ? (
          <div
            style={{
              padding: '16px',
              background: '#fcfbfa',
              border: '1px dashed #e2dbbe',
              borderRadius: 10,
              textAlign: 'center',
              fontSize: 13,
              color: 'var(--color-text-muted)',
            }}
          >
            Tasks marked DONE will compute early, on-time, and late velocity.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              {
                label: 'Early Delivery',
                value: taskStats.early,
                desc: 'Completed ahead of due date',
                icon: <Zap className="w-3.5 h-3.5 text-[#059669]" />,
                badgeClass: 'badge-success',
                pct: Math.round((taskStats.early / taskStats.done) * 100),
              },
              {
                label: 'On-Time Delivery',
                value: taskStats.onTime,
                desc: 'Delivered precisely on schedule',
                icon: <Target className="w-3.5 h-3.5 text-[#0284c7]" />,
                badgeClass: 'badge-info',
                pct: Math.round((taskStats.onTime / taskStats.done) * 100),
              },
              {
                label: 'Late Deliveries',
                value: taskStats.late,
                desc: 'Completed after targeted date',
                icon: <AlertTriangle className="w-3.5 h-3.5 text-[#ca2f2b]" />,
                badgeClass: 'badge-danger',
                pct: Math.round((taskStats.late / taskStats.done) * 100),
              },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 12px',
                  background: '#ffffff',
                  border: '1px solid #e5dfcb',
                  borderRadius: 10,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    background: '#fbf9f1',
                    border: '1px solid #e5dfcb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {item.label}
                    </span>
                    <span className={`badge ${item.badgeClass}`}>
                      {item.value} tasks ({item.pct}%)
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Studio Quick Actions Roster */}
      <div style={{ marginTop: 'auto' }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--color-text-muted)', marginBottom: 10 }}>
          Startup Management Actions
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            {
              href: '/founder/tasks',
              title: 'Create Domain Task',
              desc: 'Assign deliverable to Dev, Growth, or Ops',
              icon: <CheckSquare className="w-4 h-4 text-[#ca2f2b]" />,
              iconBg: 'rgba(202, 47, 43, 0.08)',
            },
            {
              href: '/founder/staff',
              title: 'Manage Operators',
              desc: 'Invite startup team members and assign roles',
              icon: <UserPlus className="w-4 h-4 text-[#059669]" />,
              iconBg: 'rgba(5, 150, 105, 0.08)',
            },
            {
              href: '/founder/domains',
              title: 'Configure Domains',
              desc: 'Structure functional operational pillars',
              icon: <Layers className="w-4 h-4 text-[#d97706]" />,
              iconBg: 'rgba(217, 119, 6, 0.08)',
            },
          ].map((action) => (
            <Link
              key={action.title}
              href={action.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                background: '#fcfbfa',
                border: '1px solid #e5dfcb',
                borderRadius: 10,
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}
              className="quick-action-row"
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: action.iconBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {action.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  {action.title}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--color-text-muted)' }}>
                  {action.desc}
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#8c8375] action-arrow" />
            </Link>
          ))}
          {startupId && (
            <FounderLogoManager
              startupId={startupId}
              startupName={startupName}
              currentLogoUrl={startupLogoUrl}
              variant="quick-action"
            />
          )}
        </div>
      </div>
    </div>
  )
}