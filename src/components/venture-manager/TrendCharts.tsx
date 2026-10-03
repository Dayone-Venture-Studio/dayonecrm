'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { TrendDataPoint } from '@/lib/venture-manager/portfolioAnalytics'
import { Calendar, TrendingUp } from 'lucide-react'

interface Props {
  trendData: TrendDataPoint[]
  onTimeRangeChange?: (weeks: number) => void
  selectedTimeRange?: number
}

export function TrendCharts({
  trendData,
  onTimeRangeChange,
  selectedTimeRange = 8,
}: Props) {
  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 14, padding: '24px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'rgba(2,132,199,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <TrendingUp size={20} color="#0284c7" />
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Portfolio Performance Trends
            </h3>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>
              Average completion rate across all active startups
            </p>
          </div>
        </div>

        {onTimeRangeChange && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={14} color="var(--color-text-muted)" />
            <select
              value={selectedTimeRange}
              onChange={(e) => onTimeRangeChange(Number(e.target.value))}
              style={{
                padding: '6px 10px', borderRadius: 8,
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface-2)',
                fontSize: 13, color: 'var(--color-text-primary)',
                outline: 'none', cursor: 'pointer',
              }}
            >
              <option value={4}>Last 4 Weeks</option>
              <option value={8}>Last 8 Weeks</option>
              <option value={12}>Last 12 Weeks</option>
            </select>
          </div>
        )}
      </div>

      {/* Chart */}
      {trendData.length > 0 ? (
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-subtle)" />
              <XAxis
                dataKey="weekLabel"
                stroke="var(--color-text-muted)"
                fontSize={11} tickLine={false} axisLine={false} dy={10}
              />
              <YAxis
                stroke="var(--color-text-muted)"
                fontSize={11} tickLine={false} axisLine={false} dx={-10}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8, fontSize: 12, boxShadow: 'var(--shadow-sm)',
                }}
                itemStyle={{ color: 'var(--color-text-primary)', fontWeight: 600 }}
              />
              <Line
                type="monotone"
                dataKey="avgCompletion"
                name="Avg Completion Rate"
                stroke="#0284c7"
                strokeWidth={3}
                dot={{ fill: 'var(--color-surface)', stroke: '#0284c7', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#0284c7', stroke: '#fff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'var(--color-text-muted)' }}>
          <p style={{ fontWeight: 600, fontSize: 14 }}>No trend data available</p>
          <p style={{ fontSize: 12, marginTop: 4 }}>Data will appear once startups complete weekly plans</p>
        </div>
      )}

      {/* Summary Stats */}
      {trendData.length > 0 && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16,
          marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--color-border-subtle)',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text-primary)' }}>
              {trendData[trendData.length - 1]?.avgCompletion || 0}%
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 4 }}>
              Latest Week
            </div>
          </div>
          <div style={{ textAlign: 'center', borderLeft: '1px solid var(--color-border-subtle)', borderRight: '1px solid var(--color-border-subtle)' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text-primary)' }}>
              {Math.round(trendData.reduce((sum, d) => sum + d.avgCompletion, 0) / trendData.length)}%
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 4 }}>
              Average
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text-primary)' }}>
              {trendData.length > 1 ? (trendData[trendData.length - 1].avgCompletion - trendData[0].avgCompletion).toFixed(1) : '0'}%
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 4 }}>
              Total Change
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
