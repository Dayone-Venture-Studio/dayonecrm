import { CheckCircle2, CheckSquare, Clock, Layers, TrendingUp, Users2 } from 'lucide-react'
import type { FounderTaskStats } from '@/lib/startups/founderQueries'

interface Props {
  taskStats: FounderTaskStats
  staffCount: number
  domainCount: number
  completionRate: number
}

export function FounderStatsRow({ taskStats, staffCount, domainCount, completionRate }: Props) {
  return (
    <div className="grid-stats" style={{ marginBottom: 28 }}>
      {[
        {
          label: 'Total Tasks',
          value: taskStats.total,
          icon: <CheckSquare className="w-4 h-4 text-[#ca2f2b]" />,
          iconBg: 'rgba(202, 47, 43, 0.08)',
          iconBorder: 'rgba(202, 47, 43, 0.16)',
          subtext: `${taskStats.todo} pending`,
        },
        {
          label: 'Completed',
          value: taskStats.done,
          icon: <CheckCircle2 className="w-4 h-4 text-[#059669]" />,
          iconBg: 'rgba(5, 150, 105, 0.08)',
          iconBorder: 'rgba(5, 150, 105, 0.16)',
          subtext: `${taskStats.early} early`,
        },
        {
          label: 'In Progress',
          value: taskStats.inProgress,
          icon: <Clock className="w-4 h-4 text-[#0284c7]" />,
          iconBg: 'rgba(2, 132, 199, 0.08)',
          iconBorder: 'rgba(2, 132, 199, 0.16)',
          subtext: 'Active',
        },
        {
          label: 'Completion',
          value: `${completionRate}%`,
          icon: <TrendingUp className="w-4 h-4 text-[#ca2f2b]" />,
          iconBg: 'rgba(202, 47, 43, 0.08)',
          iconBorder: 'rgba(202, 47, 43, 0.16)',
          subtext: 'Rate',
          isProgress: true,
        },
        {
          label: 'Operators',
          value: staffCount || 0,
          icon: <Users2 className="w-4 h-4 text-[#d97706]" />,
          iconBg: 'rgba(217, 119, 6, 0.08)',
          iconBorder: 'rgba(217, 119, 6, 0.16)',
          subtext: 'Staff',
        },
        {
          label: 'Domains',
          value: domainCount || 0,
          icon: <Layers className="w-4 h-4 text-[#7c3aed]" />,
          iconBg: 'rgba(124, 58, 237, 0.08)',
          iconBorder: 'rgba(124, 58, 237, 0.16)',
          subtext: 'Areas',
        },
      ].map((stat) => (
        <div key={stat.label} className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: stat.iconBg,
                border: `1px solid ${stat.iconBorder}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {stat.icon}
            </div>
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: 'var(--color-text-muted)',
                letterSpacing: '0.4px',
                textTransform: 'uppercase',
              }}
            >
              {stat.subtext}
            </span>
          </div>

          <div
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.5px',
              lineHeight: 1.1,
              marginBottom: 4,
              fontFamily: 'var(--font-sans)',
            }}
          >
            {stat.value}
          </div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: 'var(--color-text-secondary)',
            }}
          >
            {stat.label}
          </div>

          {stat.isProgress && (
            <div style={{ marginTop: 8 }}>
              <div className="progress-bar" style={{ height: 4 }}>
                <div
                  className="progress-fill progress-fill-brand"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}