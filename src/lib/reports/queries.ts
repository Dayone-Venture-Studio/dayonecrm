import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { calculateWeeklyPerformance } from '@/lib/performance/calculateWeeklyPerformance'
import {
  buildWeekBuckets,
  buildMonthBuckets,
  countByStatus,
  calculateKpiDelta,
  type PerformanceRowInput,
  type WeekBucket,
  type MonthBucket,
  type StatusCount,
  type KpiDelta,
} from '@/lib/reports/aggregate'
import type { PerformanceStatus, TaskStatus } from '@/types'

const WEEKS_TO_FETCH = 28

// ─── Types ──────────────────────────────────────────────────────────────────

export interface WeeklyReportKpis {
  completion: KpiDelta
  totalTasks: number
  completedTasks: number
  overdueTasks: number
  overdueDelta: number
  latestWeekStart: string | null
}

export interface MonthlyReportKpis {
  completion: KpiDelta
  totalTasks: number
  completedTasks: number
  overdueTasks: number
  overdueDelta: number
  activeStartups: number
}

export interface StartupReportSummary {
  id: string
  name: string
  logo_url?: string | null
  monthly_revenue?: number | null
  monthly_target?: number | null
}

export interface StartupWeeklyReportKpis extends WeeklyReportKpis {
  latestStatus: PerformanceStatus | null
}

export interface DayActivityRow {
  date: string
  label: string
  todo: number
  inProgress: number
  completed: number
  onTime: number
  overdue: number
}

export interface StartupReportData {
  startup: StartupReportSummary
  weeks: WeekBucket[]
  months: MonthBucket[]
  statusBreakdown: StatusCount[]
  weeklyKpis: StartupWeeklyReportKpis
  monthlyKpis: MonthlyReportKpis
  dayActivity: DayActivityRow[]
}

// ─── Query helpers ──────────────────────────────────────────────────────────

const emptyKpi = (): KpiDelta => ({ current: 0, previous: 0, delta: 0 })

const todayKey = (): string => {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export interface TaskSnapshot {
  weekly_plan_id: string | null
  status: TaskStatus
  due_date: string | null
  completed_at: string | null
  created_at: string | null
  updated_at: string | null
  started_at: string | null
}

const toLocalDateKey = (value: string): string => {
  const d = new Date(value)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * Derives performance rows LIVE from weekly_plans + tasks (never the cached
 * weekly_performance table), so every render reflects current task state —
 * including un-completed tasks and items added after the plan snapshot.
 */
function buildPerformanceRows(
  startupId: string,
  snapshot: { plans: { id: string; week_start: string; week_end: string }[]; tasks: TaskSnapshot[] }
): PerformanceRowInput[] {
  if (snapshot.plans.length === 0) return []

  const byPlan = new Map<string, Pick<TaskSnapshot, 'status' | 'due_date' | 'completed_at'>[]>()
  for (const task of snapshot.tasks) {
    if (!task.weekly_plan_id) continue
    const list = byPlan.get(task.weekly_plan_id) || []
    list.push({ status: task.status, due_date: task.due_date, completed_at: task.completed_at })
    byPlan.set(task.weekly_plan_id, list)
  }

  return snapshot.plans
    .map((plan) => {
      const perf = calculateWeeklyPerformance(
        byPlan.get(plan.id) ?? [],
        startupId,
        plan.id,
        plan.week_end
      )

      return {
        startup_id: startupId,
        week_start: plan.week_start,
        week_end: plan.week_end,
        total_tasks: perf.total_tasks,
        completed_tasks: perf.completed_tasks,
        overdue_tasks: perf.overdue_tasks,
        early_tasks: perf.early_tasks,
        on_time_tasks: perf.on_time_tasks,
        late_tasks: perf.late_tasks,
        performance_status: perf.performance_status,
      } satisfies PerformanceRowInput
    })
}

/** Fetches the weekly plans + lean task snapshot used by every report view. */
async function fetchStartupTaskSnapshot(
  startupId: string
): Promise<{ plans: { id: string; week_start: string; week_end: string }[]; tasks: TaskSnapshot[] }> {
  const supabase = await createClient()

  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - (WEEKS_TO_FETCH - 1) * 7)

  const startKey = startDate.toISOString().split('T')[0]
  const endKey = endDate.toISOString().split('T')[0]

  const { data: plans } = await supabase
    .from('weekly_plans')
    .select('id, week_start, week_end')
    .eq('startup_id', startupId)
    .gte('week_start', startKey)
    .lte('week_start', endKey)
    .order('week_start', { ascending: true })

  const planList = (plans ?? []) as { id: string; week_start: string; week_end: string }[]
  if (planList.length === 0) return { plans: [], tasks: [] }

  const { data: tasks } = await supabase
    .from('tasks')
    .select('weekly_plan_id, status, due_date, completed_at, created_at, updated_at, started_at')
    .in(
      'weekly_plan_id',
      planList.map((plan) => plan.id)
    )

  return {
    plans: planList,
    tasks: (tasks ?? []) as TaskSnapshot[],
  }
}

/**
 * Buckets task activity into one row per day within [weekStart, weekEnd]:
 * tasks created, updated or completed that day, and whether a completion that
 * day landed on-time or after its due date.
 */
function buildDayActivity(
  tasks: TaskSnapshot[],
  weekStart: string,
  weekEnd: string
): DayActivityRow[] {
  const start = new Date(`${weekStart}T00:00:00`)
  const end = new Date(`${weekEnd}T23:59:59`)

  const rows: DayActivityRow[] = []
  for (const d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateKey = toLocalDateKey(d.toISOString())

    let todo = 0
    let inProgress = 0
    let completed = 0
    let onTime = 0
    let overdue = 0

    for (const task of tasks) {
      if (task.created_at && toLocalDateKey(task.created_at) === dateKey) todo += 1
      if (task.started_at && toLocalDateKey(task.started_at) === dateKey) inProgress += 1
      if (task.completed_at && toLocalDateKey(task.completed_at) === dateKey) {
        completed += 1
        const completedBeforeDue =
          !task.due_date || task.completed_at <= `${task.due_date}T23:59:59`
        if (completedBeforeDue) onTime += 1
        else overdue += 1
      }
    }

    rows.push({
      date: dateKey,
      label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      todo,
      inProgress,
      completed,
      onTime,
      overdue,
    })
  }

  return rows
}

/** Lists every visible startup for the reports sidebar. */
export async function getReportsStartupList(): Promise<StartupReportSummary[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('startups')
    .select('id, name, logo_url, monthly_revenue, monthly_target')
    .order('name', { ascending: true })

  return (data ?? []) as StartupReportSummary[]
}

/**
 * Fetches the weekly + monthly report data for a single startup, computed live
 * from its tasks.
 */
export async function getStartupReportData(
  startup: StartupReportSummary
): Promise<StartupReportData> {
  const snapshot = await fetchStartupTaskSnapshot(startup.id)
  const rows = buildPerformanceRows(startup.id, snapshot)
  const weeks = buildWeekBuckets(rows)
  const months = buildMonthBuckets(rows)

  // Current week = the latest week that has started but is still ongoing;
  // fall back to the most recent recorded week so an abandoned plan cannot
  // masquerade as "this week".
  const today = todayKey()
  const currentWeek =
    [...weeks].reverse().find((week) => week.weekEnd >= today) ??
    weeks[weeks.length - 1]
  const previousWeek = weeks[weeks.length - 2]

  const weeklyKpis: StartupWeeklyReportKpis = {
    completion: currentWeek
      ? calculateKpiDelta(
          currentWeek.avgCompletion,
          previousWeek?.avgCompletion ?? currentWeek.avgCompletion,
          true
        )
      : emptyKpi(),
    totalTasks: currentWeek?.totalTasks ?? 0,
    completedTasks: currentWeek?.completedTasks ?? 0,
    overdueTasks: currentWeek?.overdueTasks ?? 0,
    overdueDelta:
      (currentWeek?.overdueTasks ?? 0) - (previousWeek?.overdueTasks ?? 0),
    latestWeekStart: currentWeek?.weekStart ?? null,
    latestStatus:
      currentWeek && weeks.length > 0
        ? (rows.find((row) => row.week_start === currentWeek.weekStart)
            ?.performance_status ?? null)
        : null,
  }

  const currentMonth = months[months.length - 1]
  const previousMonth = months[months.length - 2]

  const monthlyKpis: MonthlyReportKpis = {
    completion: currentMonth
      ? calculateKpiDelta(
          currentMonth.avgCompletion,
          previousMonth?.avgCompletion ?? currentMonth.avgCompletion,
          true
        )
      : emptyKpi(),
    totalTasks: currentMonth?.totalTasks ?? 0,
    completedTasks: currentMonth?.completedTasks ?? 0,
    overdueTasks: currentMonth?.overdueTasks ?? 0,
    overdueDelta:
      (currentMonth?.overdueTasks ?? 0) - (previousMonth?.overdueTasks ?? 0),
    activeStartups: currentMonth?.startupCount ?? 0,
  }

  return {
    startup,
    weeks,
    months,
    statusBreakdown: countByStatus(rows),
    weeklyKpis,
    monthlyKpis,
    dayActivity: currentWeek
      ? buildDayActivity(snapshot.tasks, currentWeek.weekStart, currentWeek.weekEnd)
      : [],
  }
}