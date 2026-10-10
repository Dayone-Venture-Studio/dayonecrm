import 'server-only'
import { getAdminClient } from '@/lib/supabase/admin'
import type { PerformanceStatus } from '@/types'

export interface MonthlyPerformanceRow {
  id: string
  name: string
  logoUrl: string | null
  achieved: number
  status: PerformanceStatus
  revenue: number | null
  target: number | null
}

export interface WeeklyMilestoneItem {
  text: string
  percent: number
  status: PerformanceStatus
}

export interface WeeklyMilestoneRow {
  id: string
  name: string
  logoUrl: string | null
  milestones: WeeklyMilestoneItem[]
}

const MILESTONE_LIMIT = 3

function sortBareLogicFirst<T extends { name: string }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => {
    if (a.name.toLowerCase().includes('bare logic')) return -1
    if (b.name.toLowerCase().includes('bare logic')) return 1
    return a.name.localeCompare(b.name)
  })
}

function toStatus(value: string | null | undefined): PerformanceStatus {
  return (value as PerformanceStatus) || 'ON_TRACK'
}

/**
 * Latest weekly performance per ACTIVE startup, shaped for the monthly wall.
 * Achieved % + status are real (weekly_performance); revenue/target come from
 * the hand-edited startups.monthly_* columns.
 */
export async function getMonthlyPerformanceRows(): Promise<MonthlyPerformanceRow[]> {
  const supabase = getAdminClient()

  const [{ data: startups }, { data: performances }] = await Promise.all([
    supabase
      .from('startups')
      .select('id, name, logo_url, monthly_revenue, monthly_target')
      .eq('status', 'ACTIVE'),
    supabase
      .from('weekly_performance')
      .select('startup_id, completion_rate, performance_status, created_at')
      .order('created_at', { ascending: false }),
  ])

  const latest = new Map<string, { completion_rate: number; performance_status: string }>()
  for (const perf of performances || []) {
    if (!latest.has(perf.startup_id)) latest.set(perf.startup_id, perf)
  }

  const rows = (startups || []).map((startup) => {
    const perf = latest.get(startup.id)
    return {
      id: startup.id,
      name: startup.name,
      logoUrl: startup.logo_url ?? null,
      achieved: perf ? Math.round(perf.completion_rate) : 0,
      status: toStatus(perf?.performance_status),
      revenue: startup.monthly_revenue ?? null,
      target: startup.monthly_target ?? null,
    }
  })

  return sortBareLogicFirst(rows)
}

/**
 * Most recent weekly plans per ACTIVE startup, joined to their performance
 * record, shaped as milestone cards. Label = plan goal, % = completion rate.
 */
export async function getWeeklyMilestoneRows(): Promise<WeeklyMilestoneRow[]> {
  const supabase = getAdminClient()

  const [{ data: startups }, { data: performances }] = await Promise.all([
    supabase.from('startups').select('id, name, logo_url').eq('status', 'ACTIVE'),
    supabase
      .from('weekly_performance')
      .select(
        'startup_id, completion_rate, performance_status, created_at, weekly_plan:weekly_plans(goal, week_start)'
      )
      .order('created_at', { ascending: false }),
  ])

  const byStartup = new Map<string, WeeklyMilestoneItem[]>()
  for (const perf of performances || []) {
    const list = byStartup.get(perf.startup_id) ?? []
    if (list.length >= MILESTONE_LIMIT) continue
    const planRel = perf.weekly_plan as unknown as
      | { goal: string | null }[]
      | { goal: string | null }
      | null
    const plan = Array.isArray(planRel) ? planRel[0] ?? null : planRel
    list.push({
      text: plan?.goal || 'Weekly milestone',
      percent: Math.round(perf.completion_rate),
      status: toStatus(perf.performance_status),
    })
    byStartup.set(perf.startup_id, list)
  }

  const rows = (startups || []).map((startup) => ({
    id: startup.id,
    name: startup.name,
    logoUrl: startup.logo_url ?? null,
    milestones: byStartup.get(startup.id) ?? [],
  }))

  return sortBareLogicFirst(rows)
}

/**
 * Compact INR currency for the wall (₹12.5L, ₹1.2Cr, ₹80K, ₹950).
 * Null / undefined / NaN render as an em dash so empty columns stay clean.
 */
export function formatCompactCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'

  const abs = Math.abs(value)
  if (abs >= 1_00_00_000) {
    const scaled = value / 1_00_00_000
    return `₹${Number.isInteger(scaled) ? scaled.toFixed(0) : scaled.toFixed(1)}Cr`
  }
  if (abs >= 1_00_000) {
    const scaled = value / 1_00_000
    return `₹${Number.isInteger(scaled) ? scaled.toFixed(0) : scaled.toFixed(1)}L`
  }
  if (abs >= 1_000) return `₹${(value / 1_000).toFixed(0)}K`
  return `₹${value.toLocaleString('en-IN')}`
}
