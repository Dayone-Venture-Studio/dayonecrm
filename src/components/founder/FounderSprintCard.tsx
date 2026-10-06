import Link from 'next/link'
import { CalendarRange, ChevronRight, Compass, Plus } from 'lucide-react'
import type { FounderTaskStats } from '@/lib/startups/founderQueries'
import type { WeeklyPlan } from '@/types'

interface Props {
  currentPlan: WeeklyPlan | null
  taskStats: FounderTaskStats
}

export function FounderSprintCard({ currentPlan, taskStats }: Props) {
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
              background: 'rgba(202, 47, 43, 0.08)',
              border: '1px solid rgba(202, 47, 43, 0.16)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-brand)',
            }}
          >
            <CalendarRange className="w-4 h-4" />
          </div>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Current Sprint Cadence
            </h2>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
              Weekly Studio Execution
            </div>
          </div>
        </div>

        <Link
          href="/founder/weekly-plan"
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
          <span>Manage Plan</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {currentPlan ? (
        <div style={{ flex: 1 }}>
          {/* Active Plan Date Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span className="badge badge-brand">
              Active Sprint
            </span>
            <span style={{ fontSize: 12.5, color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              {new Date(currentPlan.week_start + 'T00:00:00').toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}{' '}
              —{' '}
              {new Date(currentPlan.week_end + 'T00:00:00').toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>

          {/* Goal Quote Block */}
          {currentPlan.goal ? (
            <div
              style={{
                padding: '16px 18px',
                background: '#fdfcf7',
                border: '1px solid #e5dfcb',
                borderRadius: 12,
                marginBottom: 20,
                position: 'relative',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  color: 'var(--color-brand)',
                  marginBottom: 6,
                }}
              >
                Sprint Objective
              </div>
              <div
                className="font-serif-italic"
                style={{
                  fontSize: 15,
                  color: 'var(--color-text-primary)',
                  lineHeight: 1.6,
                }}
              >
                &ldquo;{currentPlan.goal}&rdquo;
              </div>
            </div>
          ) : (
            <div
              style={{
                padding: '14px 16px',
                background: '#fdfcf7',
                border: '1px dashed #e2dbbe',
                borderRadius: 10,
                fontSize: 13,
                color: 'var(--color-text-muted)',
                marginBottom: 20,
              }}
            >
              No specific sprint objective written yet.{' '}
              <Link href="/founder/weekly-plan" style={{ color: 'var(--color-brand)' }}>
                Add goal →
              </Link>
            </div>
          )}

          {/* Task Breakdown Bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--color-text-muted)' }}>
              Delivery Progress ({taskStats.done}/{taskStats.total} Tasks)
            </div>

            {[
              { label: 'Completed Deliverables', value: taskStats.done, total: taskStats.total, color: 'var(--color-success)', badge: 'badge-success' },
              { label: 'In Progress (Active Work)', value: taskStats.inProgress, total: taskStats.total, color: 'var(--color-info)', badge: 'badge-info' },
              { label: 'Pending in Backlog', value: taskStats.todo, total: taskStats.total, color: 'var(--color-warning)', badge: 'badge-warning' },
            ].map((item) => (
              <div key={item.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                    {item.label}
                  </span>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    {item.value} <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>/ {item.total}</span>
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${item.total > 0 ? (item.value / item.total) * 100 : 0}%`,
                      background: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Studio Empty State (Inspiring & Actionable) */
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '36px 20px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: 'linear-gradient(135deg, rgba(202, 47, 43, 0.12) 0%, rgba(202, 47, 43, 0.04) 100%)',
              border: '1px solid rgba(202, 47, 43, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-brand)',
              marginBottom: 16,
            }}
          >
            <Compass className="w-6 h-6" />
          </div>

          <h3
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              marginBottom: 6,
            }}
          >
            No Active Sprint Initialized
          </h3>
          <p
            style={{
              fontSize: 13.5,
              color: 'var(--color-text-secondary)',
              maxWidth: 360,
              lineHeight: 1.6,
              marginBottom: 24,
            }}
          >
            Day One startups operate on strict weekly execution cycles. Create this week&apos;s plan to align all domains on target milestones.
          </p>

          <Link href="/founder/weekly-plan" className="btn btn-primary btn-sm" style={{ marginBottom: 28 }}>
            <Plus className="w-4 h-4" />
            <span>Initialize Sprint Plan</span>
          </Link>

          {/* 3-Step Execution Pipeline */}
          <div
            style={{
              width: '100%',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 8,
              padding: '12px 14px',
              background: '#fcfbfa',
              border: '1px solid #e5dfcb',
              borderRadius: 12,
              textAlign: 'left',
            }}
          >
            <div style={{ borderRight: '1px solid #e5dfcb', paddingRight: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-brand)' }}>STEP 01</div>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--color-text-primary)' }}>Define Goal</div>
            </div>
            <div style={{ borderRight: '1px solid #e5dfcb', paddingRight: 8, paddingLeft: 4 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-brand)' }}>STEP 02</div>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--color-text-primary)' }}>Assign Domains</div>
            </div>
            <div style={{ paddingLeft: 4 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-brand)' }}>STEP 03</div>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--color-text-primary)' }}>Track Cadence</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}