import 'server-only'
import {
  getDomainsForStartup,
  getMembersForStartup,
  getMembershipForUser,
  getProfileNameMap,
  getTasksForStartup,
} from '@/lib/startups/queries'
import { getCurrentWeekPlan } from '@/lib/weekly-plans/queries'
import {
  calculateStartupHealth,
  type StartupHealthSummary,
} from '@/lib/performance/calculateStartupHealth'
import {
  calculateTeamPerformance,
  type MemberPerformance,
} from '@/lib/performance/calculateMemberPerformance'
import type { Domain, StartupMemberWithProfile, Task, WeeklyPlan } from '@/types'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface FounderTaskStats {
  total: number
  done: number
  inProgress: number
  todo: number
  early: number
  onTime: number
  late: number
}

export interface FounderDashboardData {
  startupId: string | null
  startupName: string
  startupLogoUrl: string | null
  currentPlan: WeeklyPlan | null
  tasks: Task[]
  domains: Domain[]
  members: StartupMemberWithProfile[]
  health: StartupHealthSummary
  teamPerf: MemberPerformance[]
  taskStats: FounderTaskStats
  staffCount: number
  domainCount: number
  completionRate: number
}

// ─── Query ──────────────────────────────────────────────────────────────────

/**
 * Everything the Founder Command Center renders, derived in one place: the
 * user's FOUNDER membership, their current sprint, the startup's tasks /
 * domains / members, and the health + team-performance rollups computed from
 * them. With no membership there is nothing to scope by, so the dashboard
 * renders from empty lists under the `My Startup` fallback name.
 */
export async function getFounderDashboardData(userId: string): Promise<FounderDashboardData> {
  const membership = await getMembershipForUser(userId, 'FOUNDER')
  const startupId = membership?.startup_id ?? null
  const startupName = membership?.startup?.name || 'My Startup'
  const startupLogoUrl = membership?.startup?.logo_url || null

  const [tasks, fetchedDomains, members, currentPlan, profileMap]: [
    Task[],
    Domain[],
    StartupMemberWithProfile[],
    WeeklyPlan | null,
    Map<string, string>,
  ] = startupId
    ? await Promise.all([
        getTasksForStartup(startupId, { orderBy: 'created_at', ascending: false }),
        getDomainsForStartup(startupId),
        getMembersForStartup(startupId, { profileColumns: 'id, full_name, email' }),
        getCurrentWeekPlan(startupId),
        getProfileNameMap(),
      ])
    : [[], [], [], null, new Map<string, string>()]

  // getDomainsForStartup does not order; the dashboard relies on name-ascending
  const domains = [...fetchedDomains].sort((a, b) => a.name.localeCompare(b.name))

  const health = calculateStartupHealth(tasks, domains, profileMap)
  const teamPerf = calculateTeamPerformance(tasks, members)

  const taskStats: FounderTaskStats = {
    total: tasks.length,
    done: tasks.filter((t) => t.status === 'DONE').length,
    inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    todo: tasks.filter((t) => t.status === 'TODO').length,
    early: tasks.filter((t) => t.completion_status === 'EARLY').length,
    onTime: tasks.filter((t) => t.completion_status === 'ON_TIME').length,
    late: tasks.filter((t) => t.completion_status === 'LATE').length,
  }

  const staffCount = members.filter((m) => m.role === 'STAFF').length
  const domainCount = domains.length

  const completionRate =
    taskStats.total > 0 ? Math.round((taskStats.done / taskStats.total) * 100) : 0

  return {
    startupId,
    startupName,
    startupLogoUrl,
    currentPlan,
    tasks,
    domains,
    members,
    health,
    teamPerf,
    taskStats,
    staffCount,
    domainCount,
    completionRate,
  }
}