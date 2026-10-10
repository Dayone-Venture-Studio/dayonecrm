'use client'

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

interface TrendPoint {
  label: string
  completion: number
}

interface StatusPoint {
  name: string
  value: number
  color: string
}

interface DeliveryPoint {
  label: string
  early: number
  onTime: number
  late: number
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

export function CompletionTrendChart({ data }: Props<TrendPoint>) {
  return (
    <div className="chart-container">
      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>
        Portfolio Completion Trend
      </h3>
      {data.length === 0 ? (
        emptyState('Not enough historical data')
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data} margin={{ top: 4, right: 16, left: -16, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2dbbe" />
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
            <Line
              type="monotone"
              dataKey="completion"
              stroke="#ca2f2b"
              strokeWidth={2}
              dot={{ fill: '#ca2f2b', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

export function StatusDistributionChart({ data }: Props<StatusPoint>) {
  return (
    <div className="chart-container">
      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>
        Status Across Weeks
      </h3>
      {data.length === 0 ? (
        emptyState('No performance data for this week')
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={88}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12, color: '#5a5348' }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

export function DeliveryQualityChart({ data }: Props<DeliveryPoint>) {
  return (
    <div className="chart-container">
      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>
        Delivery Quality Mix
      </h3>
      {data.length === 0 ? (
        emptyState('No completed tasks to analyze')
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
              formatter={(value) => [`${value}%`, '']}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: '#5a5348' }} />
            <Bar dataKey="early" name="Early %" stackId="delivery" fill="#10b981" />
            <Bar dataKey="onTime" name="On-Time %" stackId="delivery" fill="#0ea5e9" />
            <Bar dataKey="late" name="Late %" stackId="delivery" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
