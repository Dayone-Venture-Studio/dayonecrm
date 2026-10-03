'use client'

import { useState } from 'react'
import { StartupHealthCard } from './StartupHealthCard'
import { NeedsAttentionSection } from './NeedsAttentionSection'
import { TrendCharts } from './TrendCharts'
import type {
  PortfolioSnapshot,
  TrendDataPoint,
} from '@/lib/venture-manager/portfolioAnalytics'
import type { VentureManagerNoteWithProfile } from '@/types'
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Target,
  Search,
  SlidersHorizontal,
  Calendar,
  BarChart3,
  Briefcase,
  RefreshCw,
} from 'lucide-react'

interface Props {
  portfolioSnapshot: PortfolioSnapshot
  trendData: TrendDataPoint[]
  activeNotes: VentureManagerNoteWithProfile[]
}

type HealthStatusFilter = 'ALL' | 'Optimal' | 'On Track' | 'Attention' | 'At Risk'
type SortOption = 'name' | 'health' | 'completion' | 'team' | 'blockers'

export function VentureManagerDashboardClient({
  portfolioSnapshot,
  trendData,
  activeNotes,
}: Props) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<HealthStatusFilter>('ALL')
  const [sortBy, setSortBy] = useState<SortOption>('health')
  const [timeRange, setTimeRange] = useState(8)

  const { startups, aggregatedKPIs, atRiskStartups } = portfolioSnapshot

  const filteredStartups = startups
    .filter((s) => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'ALL' || s.health.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name)
        case 'health': return b.health.score - a.health.score
        case 'completion': return b.health.completionRate - a.health.completionRate
        case 'team': return b.teamCount - a.teamCount
        case 'blockers': return b.health.blockers.length - a.health.blockers.length
        default: return 0
      }
    })

  const now = new Date()
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  return (
    <div style={{ padding: '32px 32px 48px', minHeight: '100vh' }}>

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'var(--color-brand)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'var(--shadow-brand)',
            }}>
              <Briefcase size={20} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.5px', lineHeight: 1 }}>
                Portfolio Overview
              </h1>
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 3 }}>
                Monitor and analyze all startup performance metrics
              </p>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)' }}>{dateStr}</div>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
            <RefreshCw size={11} />
            Updated {timeStr}
          </div>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        <KpiCard
          label="Total Startups"
          value={aggregatedKPIs.totalStartups}
          icon={<Target size={18} />}
          accent="#4f46e5"
          sub={
            <span style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Pill color="#059669">{aggregatedKPIs.optimalCount} Optimal</Pill>
              <Pill color="#d97706">{aggregatedKPIs.onTrackCount} On Track</Pill>
              <Pill color="#ca2f2b">{aggregatedKPIs.atRiskCount} At Risk</Pill>
            </span>
          }
        />
        <KpiCard
          label="Avg Completion Rate"
          value={`${aggregatedKPIs.avgCompletionRate}%`}
          icon={<CheckCircle size={18} />}
          accent="#059669"
          sub={
            aggregatedKPIs.avgCompletionRateDelta !== 0 ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: aggregatedKPIs.avgCompletionRateDelta > 0 ? '#059669' : '#ca2f2b', fontWeight: 600 }}>
                {aggregatedKPIs.avgCompletionRateDelta > 0
                  ? <TrendingUp size={13} />
                  : <TrendingDown size={13} />}
                {aggregatedKPIs.avgCompletionRateDelta > 0 ? '+' : ''}{aggregatedKPIs.avgCompletionRateDelta.toFixed(1)}%
                <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>vs last week</span>
              </span>
            ) : (
              <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>No change from last week</span>
            )
          }
        />
        <KpiCard
          label="Avg Health Score"
          value={aggregatedKPIs.avgHealthScore}
          icon={<BarChart3 size={18} />}
          accent="#7c3aed"
          sub={<span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>out of 100 points</span>}
        />
        <KpiCard
          label="Active Concerns"
          value={aggregatedKPIs.totalBlockers + activeNotes.length}
          icon={<AlertTriangle size={18} />}
          accent="#d97706"
          sub={
            <span style={{ display: 'flex', gap: 8 }}>
              <Pill color="#ca2f2b">{aggregatedKPIs.totalBlockers} Blockers</Pill>
              <Pill color="#d97706">{activeNotes.length} Notes</Pill>
            </span>
          }
        />
      </div>

      {/* ── Needs Attention ── */}
      <NeedsAttentionSection
        atRiskStartups={atRiskStartups}
        urgentNotes={activeNotes.filter((n) => n.urgency === 'CRITICAL' || n.urgency === 'HIGH')}
      />

      {/* ── Filters Bar ── */}
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 12,
        padding: '14px 18px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search startups…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%', paddingLeft: 34, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
              border: '1px solid var(--color-border)', borderRadius: 8,
              fontSize: 13, background: 'var(--color-background)',
              color: 'var(--color-text-primary)', outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <SlidersHorizontal size={14} color="var(--color-text-muted)" />
          <FilterSelect value={statusFilter} onChange={(v) => setStatusFilter(v as HealthStatusFilter)}>
            <option value="ALL">All Status</option>
            <option value="Optimal">Optimal</option>
            <option value="On Track">On Track</option>
            <option value="Attention">Attention</option>
            <option value="At Risk">At Risk</option>
          </FilterSelect>
        </div>

        <FilterSelect value={sortBy} onChange={(v) => setSortBy(v as SortOption)}>
          <option value="health">Sort by Health</option>
          <option value="name">Sort by Name</option>
          <option value="completion">Sort by Completion</option>
          <option value="team">Sort by Team Size</option>
          <option value="blockers">Sort by Blockers</option>
        </FilterSelect>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Calendar size={14} color="var(--color-text-muted)" />
          <FilterSelect value={String(timeRange)} onChange={(v) => setTimeRange(Number(v))}>
            <option value="4">Last 4 Weeks</option>
            <option value="8">Last 8 Weeks</option>
            <option value="12">Last 12 Weeks</option>
          </FilterSelect>
        </div>

        <span style={{ fontSize: 12, color: 'var(--color-text-muted)', marginLeft: 'auto' }}>
          {filteredStartups.length} of {startups.length} startups
        </span>

        {(searchQuery || statusFilter !== 'ALL') && (
          <button
            onClick={() => { setSearchQuery(''); setStatusFilter('ALL') }}
            style={{
              fontSize: 12, color: 'var(--color-brand)', fontWeight: 600,
              background: 'var(--color-brand-dim)', border: 'none',
              borderRadius: 6, padding: '5px 10px', cursor: 'pointer',
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* ── Startup Cards Grid ── */}
      {filteredStartups.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
          {filteredStartups.map((startup) => {
            const startupNotes = activeNotes.filter(
              (note) => note.entity_type === 'STARTUP' && note.entity_id === startup.id
            )
            return (
              <StartupHealthCard key={startup.id} startup={startup} notesCount={startupNotes.length} />
            )
          })}
        </div>
      ) : (
        <div style={{
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 12, padding: '56px 32px', textAlign: 'center',
          marginBottom: 32,
        }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
          <p style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 6 }}>No startups match your filters</p>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* ── Trend Charts ── */}
      <TrendCharts
        trendData={trendData}
        selectedTimeRange={timeRange}
        onTimeRangeChange={setTimeRange}
      />
    </div>
  )
}

// ── Small sub-components ──

function KpiCard({
  label, value, icon, accent, sub,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
  accent: string
  sub?: React.ReactNode
}) {
  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 14,
      padding: '20px 22px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Accent top bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: accent, borderRadius: '14px 14px 0 0' }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {label}
        </p>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: `${accent}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: accent,
          flexShrink: 0,
        }}>
          {icon}
        </div>
      </div>

      <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-1px', lineHeight: 1, marginBottom: 12 }}>
        {value}
      </div>

      {sub && <div>{sub}</div>}
    </div>
  )
}

function Pill({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, color,
      background: `${color}15`,
      border: `1px solid ${color}30`,
      borderRadius: 999, padding: '2px 8px',
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  )
}

function FilterSelect({
  value, onChange, children,
}: {
  value: string
  onChange: (v: string) => void
  children: React.ReactNode
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        padding: '7px 10px',
        border: '1px solid var(--color-border)',
        borderRadius: 8,
        fontSize: 13,
        background: 'var(--color-background)',
        color: 'var(--color-text-primary)',
        cursor: 'pointer',
        outline: 'none',
      }}
    >
      {children}
    </select>
  )
}
