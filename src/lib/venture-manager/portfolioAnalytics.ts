import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { calculateStartupHealth, type StartupHealthSummary } from '@/lib/performance/calculateStartupHealth'
import type {
  Startup,
  WeeklyPerformance,
  Task,
  Domain,
  Profile,
  StartupMember,
} from '@/types'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface StartupWithHealth extends Startup {
  health: StartupHealthSummary
  teamCount: number
  latestPerformance: WeeklyPerformance | null
  previousPerformance: WeeklyPerformance | null
  weekOverWeekDelta: WeekOverWeekDelta | null
}

export interface WeekOverWeekDelta {
  completionRate: number // percentage point change
  completionRatePercent: number // percent change
  overdueTasksDelta: number
  performanceStatusChange: string // e.g., "improved", "declined", "unchanged"
}

export interface PortfolioSnapshot {
  startups: StartupWithHealth[]
  aggregatedKPIs: AggregatedKPIs
  atRiskStartups: StartupWithHealth[]
}

export interface AggregatedKPIs {
  totalStartups: number
  avgCompletionRate: number
  avgHealthScore: number
  atRiskCount: number
  onTrackCount: number
  optimalCount: number
  totalBlockers: number
  avgCompletionRateDelta: number // week-over-week portfolio average change
}

export interface TrendDataPoint {
  weekStart: string
  weekLabel: string
  avgCompletion: number
  startupCount: number
}

// ─── Portfolio Snapshot ─────────────────────────────────────────────────────

/**
 * Fetches complete portfolio snapshot with health metrics and week-over-week deltas
 */
export async function getPortfolioSnapshot(): Promise<PortfolioSnapshot> {
  const supabase = await createClient()

  // Fetch all active startups with related data
  const [
    { data: startups },
    { data: allPerformances },
    { data: allTasks },
    { data: allDomains },
    { data: allMembers },
    { data: allProfiles },
  ] = await Promise.all([
    supabase
      .from('startups')
      .select('*')
      .order('name', { ascending: true }),
    supabase
      .from('weekly_performance')
      .select('*')
      .order('created_at', { ascending: false }),
    supabase.from('tasks').select('*'),
    supabase.from('domains').select('*'),
    supabase.from('startup_members').select('*'),
    supabase.from('profiles').select('id, full_name'),
  ])

  const tasks = (allTasks || []) as Task[]
  const domains = (allDomains || []) as Domain[]
  const members = (allMembers || []) as StartupMember[]
  const profiles = (allProfiles || []) as Profile[]
  const performances = (allPerformances || []) as WeeklyPerformance[]

  // Build profile map for name lookups
  const profileMap = new Map(profiles.map((p) => [p.id, p.full_name]))

  // Build startup health data
  const startupsWithHealth: StartupWithHealth[] = (startups || []).map((startup) => {
    const startupTasks = tasks.filter((t) => t.startup_id === startup.id)
    const startupDomains = domains.filter((d) => d.startup_id === startup.id)
    const startupMembers = members.filter((m) => m.startup_id === startup.id)
    const health = calculateStartupHealth(startupTasks, startupDomains, profileMap)

    // Get latest and previous week performance
    const startupPerfs = performances.filter((p) => p.startup_id === startup.id)
    const latestPerformance = startupPerfs[0] || null
    const previousPerformance = startupPerfs[1] || null

    const weekOverWeekDelta = calculateWeekOverWeekDeltas(
      latestPerformance,
      previousPerformance
    )

    return {
      ...startup,
      health,
      teamCount: startupMembers.length,
      latestPerformance,
      previousPerformance,
      weekOverWeekDelta,
    }
  })

  // Calculate aggregated KPIs
  const aggregatedKPIs = calculateAggregatedKPIs(startupsWithHealth)

  // Identify at-risk startups
  const atRiskStartups = getAtRiskStartups(startupsWithHealth)

  return {
    startups: startupsWithHealth,
    aggregatedKPIs,
    atRiskStartups,
  }
}

// ─── Week-over-Week Calculations ────────────────────────────────────────────

/**
 * Calculates week-over-week deltas for a startup
 */
export function calculateWeekOverWeekDeltas(
  current: WeeklyPerformance | null,
  previous: WeeklyPerformance | null
): WeekOverWeekDelta | null {
  if (!current || !previous) {
    return null
  }

  const completionRateDelta = current.completion_rate - previous.completion_rate
  const completionRatePercent =
    previous.completion_rate > 0
      ? ((current.completion_rate - previous.completion_rate) / previous.completion_rate) * 100
      : 0

  const overdueTasksDelta = current.overdue_tasks - previous.overdue_tasks

  let performanceStatusChange = 'unchanged'
  const statusOrder = { AHEAD: 4, ON_TRACK: 3, BEHIND: 2, AT_RISK: 1 }
  const currentScore = statusOrder[current.performance_status] || 0
  const previousScore = statusOrder[previous.performance_status] || 0

  if (currentScore > previousScore) {
    performanceStatusChange = 'improved'
  } else if (currentScore < previousScore) {
    performanceStatusChange = 'declined'
  }

  return {
    completionRate: completionRateDelta,
    completionRatePercent,
    overdueTasksDelta,
    performanceStatusChange,
  }
}

/**
 * Calculates aggregated portfolio KPIs
 */
function calculateAggregatedKPIs(startups: StartupWithHealth[]): AggregatedKPIs {
  const totalStartups = startups.length

  if (totalStartups === 0) {
    return {
      totalStartups: 0,
      avgCompletionRate: 0,
      avgHealthScore: 0,
      atRiskCount: 0,
      onTrackCount: 0,
      optimalCount: 0,
      totalBlockers: 0,
      avgCompletionRateDelta: 0,
    }
  }

  const sumCompletionRate = startups.reduce(
    (sum, s) => sum + (s.health.completionRate || 0),
    0
  )
  const sumHealthScore = startups.reduce((sum, s) => sum + s.health.score, 0)
  const atRiskCount = startups.filter((s) => s.health.status === 'At Risk').length
  const onTrackCount = startups.filter((s) => s.health.status === 'On Track').length
  const optimalCount = startups.filter((s) => s.health.status === 'Optimal').length
  const totalBlockers = startups.reduce((sum, s) => sum + s.health.blockers.length, 0)

  // Calculate week-over-week portfolio average delta
  const startupsWithDelta = startups.filter((s) => s.weekOverWeekDelta !== null)
  const avgCompletionRateDelta =
    startupsWithDelta.length > 0
      ? startupsWithDelta.reduce((sum, s) => sum + (s.weekOverWeekDelta?.completionRate || 0), 0) /
        startupsWithDelta.length
      : 0

  return {
    totalStartups,
    avgCompletionRate: Math.round(sumCompletionRate / totalStartups),
    avgHealthScore: Math.round(sumHealthScore / totalStartups),
    atRiskCount,
    onTrackCount,
    optimalCount,
    totalBlockers,
    avgCompletionRateDelta: Math.round(avgCompletionRateDelta * 10) / 10, // One decimal place
  }
}

// ─── At-Risk Identification ─────────────────────────────────────────────────

/**
 * Identifies startups that need attention
 */
export function getAtRiskStartups(startups: StartupWithHealth[]): StartupWithHealth[] {
  return startups.filter((s) => {
    const isAtRisk = s.health.status === 'At Risk' || s.health.status === 'Attention'
    const hasDecliningPerformance =
      s.weekOverWeekDelta?.performanceStatusChange === 'declined'
    const hasCriticalBlockers = s.health.blockers.some((b) => b.urgency === 'CRITICAL')
    const hasHighOverdue = s.health.overdueTasks >= 3

    return isAtRisk || hasDecliningPerformance || hasCriticalBlockers || hasHighOverdue
  })
}

// ─── Trend Data ─────────────────────────────────────────────────────────────

/**
 * Fetches historical performance trends for configurable date range
 */
export async function getTrendData(weeksBack: number = 8): Promise<TrendDataPoint[]> {
  const supabase = await createClient()

  // Calculate date range
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - weeksBack * 7)

  const { data: performances } = await supabase
    .from('weekly_performance')
    .select(`
      *,
      weekly_plan:weekly_plans!inner(week_start, week_end)
    `)
    .gte('weekly_plans.week_start', startDate.toISOString().split('T')[0])
    .lte('weekly_plans.week_start', endDate.toISOString().split('T')[0])
    .order('weekly_plans.week_start', { ascending: true })

  if (!performances || performances.length === 0) {
    return []
  }

  // Group by week and calculate averages
  const weekMap = new Map<string, { sum: number; count: number }>()

  for (const perf of performances as (WeeklyPerformance & {
    weekly_plan: { week_start: string; week_end: string }
  })[]) {
    const weekStart = perf.weekly_plan.week_start
    const existing = weekMap.get(weekStart) || { sum: 0, count: 0 }
    weekMap.set(weekStart, {
      sum: existing.sum + perf.completion_rate,
      count: existing.count + 1,
    })
  }

  // Convert to array and calculate averages
  const trendData: TrendDataPoint[] = Array.from(weekMap.entries())
    .map(([weekStart, data]) => ({
      weekStart,
      weekLabel: new Date(weekStart).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      avgCompletion: Math.round(data.sum / data.count),
      startupCount: data.count,
    }))
    .sort((a, b) => a.weekStart.localeCompare(b.weekStart))

  return trendData
}

/**
 * Fetches trend data for individual startups
 */
export async function getStartupTrendData(
  startupId: string,
  weeksBack: number = 8
): Promise<TrendDataPoint[]> {
  const supabase = await createClient()

  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - weeksBack * 7)

  const { data: performances } = await supabase
    .from('weekly_performance')
    .select(`
      *,
      weekly_plan:weekly_plans!inner(week_start, week_end)
    `)
    .eq('startup_id', startupId)
    .gte('weekly_plans.week_start', startDate.toISOString().split('T')[0])
    .lte('weekly_plans.week_start', endDate.toISOString().split('T')[0])
    .order('weekly_plans.week_start', { ascending: true })

  if (!performances || performances.length === 0) {
    return []
  }

  return (performances as (WeeklyPerformance & {
    weekly_plan: { week_start: string; week_end: string }
  })[]).map((perf) => ({
    weekStart: perf.weekly_plan.week_start,
    weekLabel: new Date(perf.weekly_plan.week_start).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    avgCompletion: Math.round(perf.completion_rate),
    startupCount: 1,
  }))
}
