'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface MonthlyCompletionPoint {
  label: string
  completion: number
}

interface ThroughputPoint {
  label: string
  completed: number
  overdue: number
}

interface RevenuePoint {
  name: string
  revenue: number
  target: number
}

interface Props<T> {
  data: T[]
}

const tooltipStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #e2dbbe',
  borderRadius: 8,
  color: '#1e1b18',
  boxShadow: '0 4px 16px rgba(45, 38, 25, 0.08)',
  fontSize: 13,
}

const emptyState = (message: string) => (
  <div className="empty-state">
    <p>{message}</p>
  </div>
)

export function MonthlyCompletionChart({ data }: Props<MonthlyCompletionPoint>) {
  return (
    <div className="chart-container">
      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>
        Monthly Completion Rate
      </h3>
      {data.length === 0 ? (
        emptyState('No monthly data yet')
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 4, right: 16, left: -16, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2dbbe" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: '#5a5348', fontSize: 11 }}
              axisLine={{ stroke: '#e2dbbe' }}
            />
            <YAxis
              tick={{ fill: '#5a5348', fontSize: 11 }}
              axisLine={{ stroke: '#e2dbbe' }}
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value) => [`${value}%`, 'Avg Completion']}
            />
            <Bar dataKey="completion" name="Completion %" fill="#ca2f2b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

export function TaskThroughputChart({ data }: Props<ThroughputPoint>) {
  return (
    <div className="chart-container">
      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>
        Task Throughput
      </h3>
      {data.length === 0 ? (
        emptyState('No task data yet')
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 4, right: 16, left: -16, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2dbbe" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: '#5a5348', fontSize: 11 }}
              axisLine={{ stroke: '#e2dbbe' }}
            />
            <YAxis tick={{ fill: '#5a5348', fontSize: 11 }} axisLine={{ stroke: '#e2dbbe' }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12, color: '#5a5348' }} />
            <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="overdue" name="Overdue" fill="#ca2f2b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

export function RevenueTargetChart({ data }: Props<RevenuePoint>) {
  return (
    <div className="chart-container">
      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>
        Revenue vs Target
      </h3>
      {data.length === 0 ? (
        emptyState('No revenue targets set yet')
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(260, data.length * 44 + 60)}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2dbbe" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: '#5a5348', fontSize: 11 }}
              axisLine={{ stroke: '#e2dbbe' }}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={110}
              tick={{ fill: '#5a5348', fontSize: 11 }}
              axisLine={{ stroke: '#e2dbbe' }}
            />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12, color: '#5a5348' }} />
            <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[0, 4, 4, 0]} />
            <Bar dataKey="target" name="Target" fill="#e2dbbe" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
