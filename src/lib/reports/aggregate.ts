import type { PerformanceStatus } from '@/types'

// ─── Types ──────────────────────────────────────────────────────────────────

/**
 * One week of performance for a startup, derived live from its weekly plan and
 * tasks. Enough to bucket and aggregate without touching the cached
 * weekly_performance table.
 */
export interface PerformanceRowInput {
  startup_id: string
  week_start: string
  week_end: string
  total_tasks: number
  completed_tasks: number
  overdue_tasks: number
  early_tasks: number
  on_time_tasks: number
  late_tasks: number
  performance_status: PerformanceStatus
}

export interface WeekBucket {
  weekStart: string
  weekEnd: string
  weekLabel: string
  avgCompletion: number
  totalTasks: number
  completedTasks: number
  overdueTasks: number
  earlyTasks: number
  onTimeTasks: number
  lateTasks: number
  startupCount: number
}

export interface MonthBucket {
  month: string
  label: string
  avgCompletion: number
  totalTasks: number
  completedTasks: number
  overdueTasks: number
  earlyTasks: number
  onTimeTasks: number
  lateTasks: number
  startupCount: number
}

export interface StatusCount {
  status: PerformanceStatus
  count: number
}

export interface KpiDelta {
  current: number
  previous: number
  delta: number
}

// ─── Constants ──────────────────────────────────────────────────────────────

export const STATUS_LABELS: Record<PerformanceStatus, string> = {
  AHEAD: 'Ahead',
  ON_TRACK: 'On Track',
  BEHIND: 'Behind',
  AT_RISK: 'At Risk',
}

export const STATUS_COLORS: Record<PerformanceStatus, string> = {
  AHEAD: '#10b981',
  ON_TRACK: '#0ea5e9',
  BEHIND: '#f59e0b',
  AT_RISK: '#ca2f2b',
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const round1 = (value: number): number => Math.round(value * 10) / 10

const completionFromCounts = (completed: number, total: number): number =>
  total > 0 ? round1((completed / total) * 100) : 0

const toWeekLabel = (weekStart: string): string =>
  new Date(weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

const toMonthKey = (date: string): string => date.slice(0, 7)

const toMonthLabel = (monthKey: string): string =>
  new Date(`${monthKey}-01T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })

interface BucketAccumulator {
  count: number
  totalTasks: number
  completedTasks: number
  overdueTasks: number
  earlyTasks: number
  onTimeTasks: number
  lateTasks: number
}

const createAccumulator = (): BucketAccumulator => ({
  count: 0,
  totalTasks: 0,
  completedTasks: 0,
  overdueTasks: 0,
  earlyTasks: 0,
  onTimeTasks: 0,
  lateTasks: 0,
})

const accumulate = (acc: BucketAccumulator, row: PerformanceRowInput): void => {
  acc.count += 1
  acc.totalTasks += row.total_tasks
  acc.completedTasks += row.completed_tasks
  acc.overdueTasks += row.overdue_tasks
  acc.earlyTasks += row.early_tasks
  acc.onTimeTasks += row.on_time_tasks
  acc.lateTasks += row.late_tasks
}

// ─── Aggregations ───────────────────────────────────────────────────────────

/** Groups performance rows by calendar week (weekly_plans.week_start). */
export function buildWeekBuckets(rows: PerformanceRowInput[]): WeekBucket[] {
  const byWeek = new Map<string, BucketAccumulator>()
  const weekEnds = new Map<string, string>()

  for (const row of rows) {
    const acc = byWeek.get(row.week_start) || createAccumulator()
    accumulate(acc, row)
    byWeek.set(row.week_start, acc)
    weekEnds.set(row.week_start, row.week_end)
  }

  return Array.from(byWeek.entries())
    .map(([weekStart, acc]) => ({
      weekStart,
      weekEnd: weekEnds.get(weekStart) ?? weekStart,
      weekLabel: toWeekLabel(weekStart),
      avgCompletion: completionFromCounts(acc.completedTasks, acc.totalTasks),
      totalTasks: acc.totalTasks,
      completedTasks: acc.completedTasks,
      overdueTasks: acc.overdueTasks,
      earlyTasks: acc.earlyTasks,
      onTimeTasks: acc.onTimeTasks,
      lateTasks: acc.lateTasks,
      startupCount: acc.count,
    }))
    .sort((a, b) => a.weekStart.localeCompare(b.weekStart))
}

/** Groups performance rows by calendar month of week_start (monthly report). */
export function buildMonthBuckets(rows: PerformanceRowInput[]): MonthBucket[] {
  const byMonth = new Map<string, BucketAccumulator>()

  for (const row of rows) {
    const month = toMonthKey(row.week_start)
    const acc = byMonth.get(month) || createAccumulator()
    accumulate(acc, row)
    byMonth.set(month, acc)
  }

  return Array.from(byMonth.entries())
    .map(([month, acc]) => ({
      month,
      label: toMonthLabel(month),
      avgCompletion: completionFromCounts(acc.completedTasks, acc.totalTasks),
      totalTasks: acc.totalTasks,
      completedTasks: acc.completedTasks,
      overdueTasks: acc.overdueTasks,
      earlyTasks: acc.earlyTasks,
      onTimeTasks: acc.onTimeTasks,
      lateTasks: acc.lateTasks,
      startupCount: acc.count,
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
}

/** Keeps only the latest week's row per startup (most recent week in the set). */
export function latestWeekRows(rows: PerformanceRowInput[]): PerformanceRowInput[] {
  if (rows.length === 0) return []

  const latestWeek = rows.reduce(
    (max, row) => (row.week_start > max ? row.week_start : max),
    rows[0].week_start
  )

  const seen = new Set<string>()
  const latest: PerformanceRowInput[] = []

  for (const row of rows) {
    if (row.week_start !== latestWeek || seen.has(row.startup_id)) continue
    seen.add(row.startup_id)
    latest.push(row)
  }

  return latest
}

/** Counts rows per performance status within the given set. */
export function countByStatus(rows: PerformanceRowInput[]): StatusCount[] {
  const counts = new Map<PerformanceStatus, number>()

  for (const row of rows) {
    counts.set(row.performance_status, (counts.get(row.performance_status) || 0) + 1)
  }

  return (Object.keys(STATUS_LABELS) as PerformanceStatus[])
    .map((status) => ({ status, count: counts.get(status) || 0 }))
    .filter((entry) => entry.count > 0)
}

/** Compares the last two buckets of a series (current vs previous period). */
export function calculateKpiDelta(
  current: number,
  previous: number,
  isPercentage = false
): KpiDelta {
  const delta = current - previous
  return {
    current,
    previous,
    delta: isPercentage ? round1(delta) : delta,
  }
}

/** Splits a completed-task count into early/on-time/late shares summing to 100. */
export const toDeliveryShares = (
  bucket: Pick<WeekBucket | MonthBucket, 'earlyTasks' | 'onTimeTasks' | 'lateTasks'>
): { early: number; onTime: number; late: number } => {
  const completed = bucket.earlyTasks + bucket.onTimeTasks + bucket.lateTasks
  if (completed === 0) return { early: 0, onTime: 0, late: 0 }

  return {
    early: round1((bucket.earlyTasks / completed) * 100),
    onTime: round1((bucket.onTimeTasks / completed) * 100),
    late: round1((bucket.lateTasks / completed) * 100),
  }
}