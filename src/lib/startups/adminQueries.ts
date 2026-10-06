import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { calculateStartupHealth, type StartupHealthSummary } from '@/lib/performance/calculateStartupHealth'
import type { Task, Domain, Startup } from '@/types'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface AdminStats {
  totalStartups: number
  activeStartups: number
  pendingRegistrations: number
  totalTasksThisWeek: number
  completedTasks: number
  overdueTasks: number
}

export interface StartupHealthCardData {
  id: string
  name: string
  logo_url: string | null
  created_at: string
  health: StartupHealthSummary
  teamCount: number
}

export interface PortfolioHealth {
  cards: StartupHealthCardData[]
  avgHealth: number
  atRiskCount: number
  totalBlockers: number
}

export type StartupOverviewRow = Pick<
  Startup,
  'id' | 'name' | 'status' | 'created_at' | 'logo_url'
>

// ─── Queries ────────────────────────────────────────────────────────────────

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = await createClient()

  const [
    { count: totalStartups },
    { count: activeStartups },
    { count: pendingRegistrations },
    { count: totalTasksThisWeek },
    { count: completedTasks },
    { count: overdueTasks },
  ] = await Promise.all([
    supabase.from('startups').select('*', { count: 'exact', head: true }),
    supabase
      .from('startups')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'ACTIVE'),
    supabase
      .from('registration_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'PENDING'),
    supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'DONE')
      .gte('completed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .neq('status', 'DONE')
      .lt('due_date', new Date().toISOString().split('T')[0]),
  ])

  return {
    totalStartups: totalStartups ?? 0,
    activeStartups: activeStartups ?? 0,
    pendingRegistrations: pendingRegistrations ?? 0,
    totalTasksThisWeek: totalTasksThisWeek ?? 0,
    completedTasks: completedTasks ?? 0,
    overdueTasks: overdueTasks ?? 0,
  }
}

export async function getPortfolioHealth(): Promise<PortfolioHealth> {
  const supabase = await createClient()

  const [
    { data: startups },
    { data: tasks },
    { data: domains },
    { data: members },
    { data: profiles },
  ] = await Promise.all([
    supabase
      .from('startups')
      .select('id, name, status, created_at, logo_url')
      .eq('status', 'ACTIVE')
      .order('name', { ascending: true }),
    supabase.from('tasks').select('*').order('created_at', { ascending: false }),
    supabase.from('domains').select('*'),
    supabase.from('startup_members').select('startup_id, user_id, role'),
    supabase.from('profiles').select('id, full_name'),
  ])

  const profileMap = new Map((profiles || []).map((p) => [p.id, p.full_name]))
  const allTasks = (tasks as Task[]) || []
  const allDomains = (domains as Domain[]) || []

  const cards: StartupHealthCardData[] = (startups || []).map((s) => {
    const sTasks = allTasks.filter((t) => t.startup_id === s.id)
    const sDomains = allDomains.filter((d) => d.startup_id === s.id)
    const sMembers = (members || []).filter((m) => m.startup_id === s.id)

    return {
      id: s.id,
      name: s.name,
      logo_url: s.logo_url,
      created_at: s.created_at,
      health: calculateStartupHealth(sTasks, sDomains, profileMap),
      teamCount: sMembers.length,
    }
  })

  // Sort: At Risk / Attention first so admin sees lagging startups immediately
  cards.sort((a, b) => a.health.score - b.health.score)

  const avgHealth =
    cards.length > 0
      ? Math.round(cards.reduce((sum, c) => sum + c.health.score, 0) / cards.length)
      : 0
  const atRiskCount = cards.filter(
    (c) => c.health.status === 'At Risk' || c.health.status === 'Attention'
  ).length
  const totalBlockers = cards.reduce((sum, c) => sum + c.health.blockers.length, 0)

  return { cards, avgHealth, atRiskCount, totalBlockers }
}

export async function getStartupsOverview(limit = 6): Promise<StartupOverviewRow[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('startups')
    .select('id, name, status, created_at, logo_url')
    .eq('status', 'ACTIVE')
    .order('created_at', { ascending: false })
    .limit(limit)
  return data || []
}