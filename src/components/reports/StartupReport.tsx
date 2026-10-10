'use client'

import { useState } from 'react'
import { CheckCircle, ListTodo, AlertTriangle, Activity, Coins } from 'lucide-react'
import { CompanyLogo } from '@/components/brand/CompanyLogo'
import { ReportTabs, type ReportTab } from './ReportTabs'
import { ReportKpiCards, DeltaBadge, type ReportKpi } from './ReportKpiCards'
import {
  CompletionTrendChart,
  StatusDistributionChart,
  DeliveryQualityChart,
} from './charts/WeeklyReportCharts'
import {
  MonthlyCompletionChart,
  TaskThroughputChart,
  RevenueTargetChart,
} from './charts/MonthlyReportCharts'
import { STATUS_LABELS, STATUS_COLORS, toDeliveryShares } from '@/lib/reports/aggregate'
import type { StartupReportData } from '@/lib/reports/queries'

interface Props {
  data: StartupReportData
}

export function StartupReport({ data }: Props) {
  const [tab, setTab] = useState<ReportTab>('weekly')

  const { startup, weeks, months, statusBreakdown, weeklyKpis, monthlyKpis, dayActivity } = data

  const kpisWeekly: ReportKpi[] = [
    {
      label: 'Avg Completion Rate',
      value: `${weeklyKpis.completion.current}%`,
      icon: <CheckCircle size={18} />,
      accent: '#059669',
      sub: <DeltaBadge delta={weeklyKpis.completion.delta} referenceLabel="vs previous week" />,
    },
    {
      label: 'Tasks This Week',
      value: weeklyKpis.totalTasks,
      icon: <ListTodo size={18} />,
      accent: '#4f46e5',
      sub: (
        <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
          {weeklyKpis.completedTasks} completed
        </span>
      ),
    },
    {
      label: 'Overdue Tasks',
      value: weeklyKpis.overdueTasks,
      icon: <AlertTriangle size={18} />,
      accent: '#ca2f2b',
      sub: (
        <DeltaBadge
          delta={weeklyKpis.overdueDelta}
          invert
          suffix=""
          referenceLabel="vs previous week"
        />
      ),
    },
    {
      label: 'Latest Status',
      value: weeklyKpis.latestStatus ? STATUS_LABELS[weeklyKpis.latestStatus] : '—',
      icon: <Activity size={18} />,
      accent: weeklyKpis.latestStatus
        ? STATUS_COLORS[weeklyKpis.latestStatus]
        : '#5a5348',
      sub: (
        <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
          performance vs plan
        </span>
      ),
    },
  ]

  const kpisMonthly: ReportKpi[] = [
    {
      label: 'Avg Completion Rate',
      value: `${monthlyKpis.completion.current}%`,
      icon: <CheckCircle size={18} />,
      accent: '#059669',
      sub: <DeltaBadge delta={monthlyKpis.completion.delta} referenceLabel="vs previous month" />,
    },
    {
      label: 'Tasks This Month',
      value: monthlyKpis.totalTasks,
      icon: <ListTodo size={18} />,
      accent: '#4f46e5',
      sub: (
        <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
          {monthlyKpis.completedTasks} completed
        </span>
      ),
    },
    {
      label: 'Overdue Tasks',
      value: monthlyKpis.overdueTasks,
      icon: <AlertTriangle size={18} />,
      accent: '#ca2f2b',
      sub: (
        <DeltaBadge
          delta={monthlyKpis.overdueDelta}
          invert
          suffix=""
          referenceLabel="vs previous month"
        />
      ),
    },
    {
      label: 'Revenue',
      value: formatMoney(startup.monthly_revenue),
      icon: <Coins size={18} />,
      accent: '#7c3aed',
      sub: (
        <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
          target {formatMoney(startup.monthly_target)}
        </span>
      ),
    },
  ]

  const trendData = weeks.map((week) => ({
    label: week.weekLabel,
    completion: week.avgCompletion,
  }))

  const deliveryData = weeks.slice(-8).map((week) => ({
    label: week.weekLabel,
    ...toDeliveryShares(week),
  }))

  const statusData = statusBreakdown.map((entry) => ({
    name: STATUS_LABELS[entry.status],
    value: entry.count,
    color: STATUS_COLORS[entry.status],
  }))

  const completionData = months.map((month) => ({
    label: month.label,
    completion: month.avgCompletion,
  }))

  const throughputData = months.map((month) => ({
    label: month.label,
    completed: month.completedTasks,
    overdue: month.overdueTasks,
  }))

  const revenueData =
    startup.monthly_revenue != null || startup.monthly_target != null
      ? [
          {
            name: startup.name,
            revenue: startup.monthly_revenue ?? 0,
            target: startup.monthly_target ?? 0,
          },
        ]
      : []

  return (
    <div style={{ padding: '32px 32px 48px', minHeight: '100vh' }}>
      {/* Startup header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 28,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
          <CompanyLogo logoUrl={startup.logo_url} name={startup.name} size="lg" />
          <div style={{ minWidth: 0 }}>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: 'var(--color-text-primary)',
                letterSpacing: '-0.5px',
                lineHeight: 1.1,
                marginBottom: 6,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {startup.name}
            </h1>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
              Weekly and monthly performance report
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {weeklyKpis.latestStatus && (
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: STATUS_COLORS[weeklyKpis.latestStatus],
                background: `${STATUS_COLORS[weeklyKpis.latestStatus]}15`,
                border: `1px solid ${STATUS_COLORS[weeklyKpis.latestStatus]}30`,
                borderRadius: 999,
                padding: '5px 12px',
                whiteSpace: 'nowrap',
              }}
            >
              {STATUS_LABELS[weeklyKpis.latestStatus]}
            </span>
          )}
          <ReportTabs tab={tab} onChange={setTab} />
        </div>
      </div>

      {tab === 'weekly' ? (
        <div>
          <ReportKpiCards kpis={kpisWeekly} />

          <div style={{ marginBottom: 20 }}>
            <CompletionTrendChart data={trendData} />
          </div>

          <div className="grid-2" style={{ marginBottom: 20 }}>
            <StatusDistributionChart data={statusData} />
            <DeliveryQualityChart data={deliveryData} />
          </div>

          <div className="chart-container">
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
              Weekly Breakdown
            </h3>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 16 }}>
              {dayActivity.length > 0
                ? `Daywise progress, ${formatDateRange(dayActivity[0].date, dayActivity[dayActivity.length - 1].date)}`
                : 'No task activity recorded this week'}
            </p>
            {dayActivity.length === 0 ? (
              <div className="empty-state">
                <p>No weekly performance recorded yet</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ textAlign: 'left', color: 'var(--color-text-muted)', fontSize: 12 }}>
                      <th style={{ padding: '8px 12px', fontWeight: 600 }}>Date</th>
                      <th style={{ padding: '8px 12px', fontWeight: 600 }}>TODO</th>
                      <th style={{ padding: '8px 12px', fontWeight: 600 }}>In Progress</th>
                      <th style={{ padding: '8px 12px', fontWeight: 600 }}>Completed</th>
                      <th style={{ padding: '8px 12px', fontWeight: 600 }}>On-Time</th>
                      <th style={{ padding: '8px 12px', fontWeight: 600 }}>Overdue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...dayActivity].reverse().map((day) => (
                      <tr key={day.date} style={{ borderTop: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          {day.label}
                        </td>
                        <td style={{ padding: '10px 12px', color: 'var(--color-text-secondary)' }}>
                          {day.todo || '—'}
                        </td>
                        <td style={{ padding: '10px 12px', color: '#0284c7' }}>
                          {day.inProgress || '—'}
                        </td>
                        <td style={{ padding: '10px 12px', color: '#059669' }}>{day.completed}</td>
                        <td style={{ padding: '10px 12px', color: '#0284c7' }}>{day.onTime}</td>
                        <td style={{ padding: '10px 12px', color: '#d97706' }}>{day.overdue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          <ReportKpiCards kpis={kpisMonthly} />

          <div className="grid-2" style={{ marginBottom: 20 }}>
            <MonthlyCompletionChart data={completionData} />
            <TaskThroughputChart data={throughputData} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <RevenueTargetChart data={revenueData} />
          </div>

          <div className="chart-container">
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
              Monthly Breakdown
            </h3>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 16 }}>
              Aggregated by calendar month
            </p>
            {months.length === 0 ? (
              <div className="empty-state">
                <p>No monthly data yet</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ textAlign: 'left', color: 'var(--color-text-muted)', fontSize: 12 }}>
                      <th style={{ padding: '8px 12px', fontWeight: 600 }}>Month</th>
                      <th style={{ padding: '8px 12px', fontWeight: 600 }}>Avg Completion</th>
                      <th style={{ padding: '8px 12px', fontWeight: 600 }}>Tasks</th>
                      <th style={{ padding: '8px 12px', fontWeight: 600 }}>Completed</th>
                      <th style={{ padding: '8px 12px', fontWeight: 600 }}>Overdue</th>
                      <th style={{ padding: '8px 12px', fontWeight: 600 }}>Early</th>
                      <th style={{ padding: '8px 12px', fontWeight: 600 }}>On-Time</th>
                      <th style={{ padding: '8px 12px', fontWeight: 600 }}>Late</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...months].reverse().map((month) => (
                      <tr key={month.month} style={{ borderTop: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          {month.label}
                        </td>
                        <td style={{ padding: '10px 12px', color: 'var(--color-text-secondary)' }}>
                          {month.avgCompletion}%
                        </td>
                        <td style={{ padding: '10px 12px', color: 'var(--color-text-secondary)' }}>
                          {month.totalTasks}
                        </td>
                        <td style={{ padding: '10px 12px', color: 'var(--color-text-secondary)' }}>
                          {month.completedTasks}
                        </td>
                        <td style={{ padding: '10px 12px', color: 'var(--color-text-secondary)' }}>
                          {month.overdueTasks}
                        </td>
                        <td style={{ padding: '10px 12px', color: '#059669' }}>{month.earlyTasks}</td>
                        <td style={{ padding: '10px 12px', color: '#0284c7' }}>{month.onTimeTasks}</td>
                        <td style={{ padding: '10px 12px', color: '#d97706' }}>{month.lateTasks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const formatDateRange = (start: string, end: string): string => {
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  const from = new Date(`${start}T00:00:00`).toLocaleDateString('en-US', opts)
  const to = new Date(`${end}T00:00:00`).toLocaleDateString('en-US', {
    ...opts,
    year: new Date(`${start}T00:00:00`).getFullYear() !== new Date(`${end}T00:00:00`).getFullYear() ? 'numeric' : undefined,
  })
  return `${from} – ${to}`
}

const formatMoney = (value: number | null | undefined): string =>
  value == null
    ? '—'
    : new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(value)