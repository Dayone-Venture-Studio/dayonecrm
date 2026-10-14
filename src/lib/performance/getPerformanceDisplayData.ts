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

export interface FoundersOfTheWeekData {
  founder1: {
    name: string
    imageUrl: string
  }
  founder2: {
    name: string
    imageUrl: string
  }
  description: string
  startupName: string
}

export interface StartupHealthRow {
  id: string
  name: string
  cashRunaway: number | null
  burnRate: number | null
  cac: number | null
}

export interface CriticalBlocker {
  id: string
  title: string
  department: string | null
  ownerName: string
  daysOverdue?: number
}

export interface StartupWithBlockers {
  id: string
  name: string
  blockers: CriticalBlocker[]
}

export interface StartupHealthMetrics {
  id: string
  name: string
  healthScore: number
  teamMorale: number
  activeTasks: number
  weeklyCompletion: number
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
 * Get startup health metrics (cash runaway, burn rate, CAC) for all active startups.
 * Returns data ordered by startup name.
 */
export async function getStartupHealthData(): Promise<StartupHealthRow[]> {
  const supabase = getAdminClient()

  const { data: startups } = await supabase
    .from('startups')
    .select('id, name, cash_runaway_months, monthly_burn_rate, customer_acquisition_cost')
    .eq('status', 'ACTIVE')
    .order('name', { ascending: true })

  if (!startups) return []

  return startups.map((startup) => ({
    id: startup.id,
    name: startup.name,
    cashRunaway: startup.cash_runaway_months ?? null,
    burnRate: startup.monthly_burn_rate ?? null,
    cac: startup.customer_acquisition_cost ?? null,
  }))
}

/**
 * Get critical blockers for all active startups.
 * Prioritizes startups with AT_RISK performance status and shows their incomplete/overdue tasks.
 * Returns ALL active startups with their critical tasks.
 */
export async function getCriticalBlockersData(): Promise<StartupWithBlockers[]> {
  const supabase = getAdminClient()

  // Get all active startups with their latest performance status
  const { data: startups } = await supabase
    .from('startups')
    .select('id, name')
    .eq('status', 'ACTIVE')
    .order('name', { ascending: true })

  if (!startups) return []

  // Get latest performance status for each startup
  const { data: performances } = await supabase
    .from('weekly_performance')
    .select('startup_id, performance_status, overdue_tasks, created_at')
    .order('created_at', { ascending: false })

  // Map latest performance per startup
  const latestPerformance = new Map<string, { status: string; overdue: number }>()
  for (const perf of performances || []) {
    if (!latestPerformance.has(perf.startup_id)) {
      latestPerformance.set(perf.startup_id, {
        status: perf.performance_status,
        overdue: perf.overdue_tasks,
      })
    }
  }

  const today = new Date().toISOString().split('T')[0]
  
  // Get incomplete tasks (TODO or IN_PROGRESS)
  const { data: tasks } = await supabase
    .from('tasks')
    .select(`
      id,
      title,
      due_date,
      startup_id,
      assigned_to,
      domain_id,
      priority,
      status,
      assigned_profile:assigned_to (
        full_name,
        department
      ),
      domain:domain_id (
        name
      )
    `)
    .neq('status', 'DONE')
    .limit(200)
    .order('due_date', { ascending: true, nullsFirst: false })

  // Group tasks by startup, prioritizing overdue and high priority
  const tasksByStartup = new Map<string, CriticalBlocker[]>()
  
  for (const task of tasks || []) {
    const startupId = task.startup_id
    const profile = task.assigned_profile as unknown as { full_name: string; department: string | null } | null
    const domain = task.domain as unknown as { name: string } | null
    
    // Calculate days overdue if task has a due date in the past
    let daysOverdue: number | undefined
    if (task.due_date) {
      const dueDate = new Date(task.due_date)
      const todayDate = new Date(today)
      const diff = Math.floor((todayDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
      if (diff > 0) {
        daysOverdue = diff
      }
    }
    
    const blocker: CriticalBlocker = {
      id: task.id,
      title: task.title,
      department: domain?.name ?? profile?.department ?? 'General',
      ownerName: profile?.full_name ?? (task.assigned_to ? 'Unknown' : 'Unassigned'),
      daysOverdue,
    }

    const existing = tasksByStartup.get(startupId) || []
    existing.push(blocker)
    tasksByStartup.set(startupId, existing)
  }

  // Map ALL startups with their blockers, prioritizing AT_RISK startups
  const result = startups.map((startup) => {
    const perf = latestPerformance.get(startup.id)
    const allBlockers = tasksByStartup.get(startup.id) || []
    
    // Sort blockers: overdue first, then by priority
    const sortedBlockers = allBlockers.sort((a, b) => {
      if (a.daysOverdue && !b.daysOverdue) return -1
      if (!a.daysOverdue && b.daysOverdue) return 1
      if (a.daysOverdue && b.daysOverdue) return b.daysOverdue - a.daysOverdue
      return 0
    })
    
    return {
      id: startup.id,
      name: startup.name,
      blockers: sortedBlockers.slice(0, 3), // Top 3 most critical
      isAtRisk: perf?.status === 'AT_RISK',
    }
  })

  // Sort: AT_RISK startups first, then by name
  return result.sort((a, b) => {
    if (a.isAtRisk && !b.isAtRisk) return -1
    if (!a.isAtRisk && b.isAtRisk) return 1
    return a.name.localeCompare(b.name)
  }).map(({ isAtRisk, ...rest }) => rest) // Remove isAtRisk flag from output
}

/**
 * Get overall health metrics for all active startups.
 * Calculates health score, team morale, active tasks, and weekly completion rate.
 */
export async function getOverallHealthMetrics(): Promise<StartupHealthMetrics[]> {
  const supabase = getAdminClient()

  // Get all active startups
  const { data: startups } = await supabase
    .from('startups')
    .select('id, name')
    .eq('status', 'ACTIVE')
    .order('name', { ascending: true })

  if (!startups) return []

  // Get latest performance for each startup
  const { data: performances } = await supabase
    .from('weekly_performance')
    .select('startup_id, completion_rate, performance_status, overdue_tasks, early_rate, created_at')
    .order('created_at', { ascending: false })

  // Get task counts per startup
  const { data: tasks } = await supabase
    .from('tasks')
    .select('startup_id, status')

  // Map latest performance per startup
  const latestPerformance = new Map<string, {
    completion: number
    status: string
    overdue: number
    earlyRate: number
  }>()
  
  for (const perf of performances || []) {
    if (!latestPerformance.has(perf.startup_id)) {
      latestPerformance.set(perf.startup_id, {
        completion: perf.completion_rate,
        status: perf.performance_status,
        overdue: perf.overdue_tasks,
        earlyRate: perf.early_rate,
      })
    }
  }

  // Count active tasks per startup
  const activeTaskCounts = new Map<string, number>()
  for (const task of tasks || []) {
    if (task.status === 'IN_PROGRESS') {
      activeTaskCounts.set(task.startup_id, (activeTaskCounts.get(task.startup_id) || 0) + 1)
    }
  }

  // Calculate metrics for each startup
  return startups.map((startup) => {
    const perf = latestPerformance.get(startup.id)
    const activeTasks = activeTaskCounts.get(startup.id) || 0
    
    // Calculate health score (0-100)
    let healthScore = 0
    
    if (perf) {
      // Task completion contributes 40 points
      healthScore += (perf.completion / 100) * 40
      
      // Performance status contributes 30 points
      const statusPoints = {
        'AHEAD': 30,
        'ON_TRACK': 25,
        'BEHIND': 15,
        'AT_RISK': 5,
      }[perf.status] || 20
      healthScore += statusPoints
      
      // Overdue penalty (20 points minus 2 per overdue, min 0)
      const overduePoints = Math.max(0, 20 - (perf.overdue * 2))
      healthScore += overduePoints
      
      // Active engagement (10 points if has tasks)
      if (activeTasks > 0 || perf.completion > 0) {
        healthScore += 10
      }
    }
    
    healthScore = Math.round(Math.min(100, Math.max(0, healthScore)))
    
    // Calculate team morale (1-10)
    let teamMorale = 5
    if (perf) {
      const completion = perf.completion
      if (completion >= 90) teamMorale = 9
      else if (completion >= 80) teamMorale = 8
      else if (completion >= 70) teamMorale = 7
      else if (completion >= 60) teamMorale = 6
      else if (completion >= 50) teamMorale = 5
      else teamMorale = 4
      
      // Bonus for early completions
      if (perf.earlyRate > 30) teamMorale = Math.min(10, teamMorale + 1)
    }
    
    return {
      id: startup.id,
      name: startup.name,
      healthScore,
      teamMorale,
      activeTasks,
      weeklyCompletion: perf ? Math.round(perf.completion * 10) / 10 : 0,
    }
  })
}

/**
 * Get the featured founders of the week with their startup description.
 * Returns the most recently updated startup marked as "founder of the week".
 */
export async function getFoundersOfTheWeek(): Promise<FoundersOfTheWeekData | null> {
  const supabase = getAdminClient()

  // Get the startup marked as "founder of the week"
  const { data: startup } = await supabase
    .from('startups')
    .select('id, name, description, founder_of_week_image_1, founder_of_week_image_2, founder_of_week_name_1, founder_of_week_name_2')
    .eq('is_founder_of_week', true)
    .eq('status', 'ACTIVE')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()

  if (!startup) return null

  return {
    founder1: {
      name: startup.founder_of_week_name_1 || 'Founder 1',
      imageUrl: startup.founder_of_week_image_1 || '/placeholder-founder.jpg',
    },
    founder2: {
      name: startup.founder_of_week_name_2 || 'Founder 2',
      imageUrl: startup.founder_of_week_image_2 || '/placeholder-founder.jpg',
    },
    description: startup.description || '',
    startupName: startup.name,
  }
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
