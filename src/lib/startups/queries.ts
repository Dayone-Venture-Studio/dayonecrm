import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type {
  Startup,
  StartupMemberWithProfile,
  Domain,
  WeeklyPlan,
  Task,
  Profile,
} from '@/types'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface StartupSummary {
  name: string
  logo_url?: string | null
}

/**
 * A user's membership of a startup. `startup` is normalised from Supabase's
 * embedded-resource shape (object *or* single-element array) to a plain object,
 * so callers never repeat the `Array.isArray(...)` unwrap.
 */
export interface StartupMembership {
  startup_id: string
  startup: StartupSummary | null
}

export interface ListOptions {
  limit?: number
  orderBy?: string
  ascending?: boolean
}

// ─── Membership ─────────────────────────────────────────────────────────────

/**
 * Single source of truth for "which startup does this user belong to as ROLE?".
 * Returns null when the user has no membership with that role.
 */
export async function getMembershipForUser(
  userId: string,
  role: 'FOUNDER' | 'STAFF'
): Promise<StartupMembership | null> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('startup_members')
    .select('startup_id, startup:startups(name, logo_url)')
    .eq('user_id', userId)
    .eq('role', role)
    .single()

  if (!data) return null

  const startup = Array.isArray(data.startup)
    ? (data.startup[0] as StartupSummary | undefined) ?? null
    : (data.startup as StartupSummary | null) ?? null

  return { startup_id: data.startup_id, startup }
}

// ─── Startup-scoped reads ───────────────────────────────────────────────────

export async function getStartupById(startupId: string): Promise<Startup | null> {
  const supabase = await createClient()
  const { data } = await supabase.from('startups').select('*').eq('id', startupId).single()
  return (data as Startup | null) ?? null
}

export async function getStartupNameById(startupId: string): Promise<string | null> {
  const supabase = await createClient()
  const { data } = await supabase.from('startups').select('name').eq('id', startupId).single()
  return data?.name ?? null
}

export async function getMembersForStartup(
  startupId: string,
  opts: { role?: 'FOUNDER' | 'STAFF'; profileColumns?: string } = {}
): Promise<StartupMemberWithProfile[]> {
  const supabase = await createClient()
  const { role, profileColumns = '*' } = opts

  let query = supabase
    .from('startup_members')
    .select(`*, profile:profiles(${profileColumns})`)
    .eq('startup_id', startupId)

  if (role) query = query.eq('role', role)

  const { data } = await query
  return (data as StartupMemberWithProfile[] | null) ?? []
}

export async function getDomainsForStartup(startupId: string): Promise<Domain[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('domains').select('*').eq('startup_id', startupId)
  return (data as Domain[] | null) ?? []
}

export async function getWeeklyPlansForStartup(
  startupId: string,
  opts: ListOptions = {}
): Promise<WeeklyPlan[]> {
  const supabase = await createClient()

  let query = supabase.from('weekly_plans').select('*').eq('startup_id', startupId)

  if (opts.orderBy) {
    query = query.order(opts.orderBy, { ascending: opts.ascending ?? false })
  }
  if (opts.limit) query = query.limit(opts.limit)

  const { data } = await query
  return (data as WeeklyPlan[] | null) ?? []
}

export async function getTasksForStartup(
  startupId: string,
  opts: ListOptions = {}
): Promise<Task[]> {
  const supabase = await createClient()

  let query = supabase.from('tasks').select('*').eq('startup_id', startupId)

  if (opts.orderBy) {
    query = query.order(opts.orderBy, { ascending: opts.ascending ?? false })
  }
  if (opts.limit) query = query.limit(opts.limit)

  const { data } = await query
  return (data as Task[] | null) ?? []
}

/** Lightweight id→name map, used to resolve task assignee names for health scoring. */
export async function getProfileNameMap(): Promise<Map<string, string>> {
  const supabase = await createClient()
  const { data } = await supabase.from('profiles').select('id, full_name')
  const rows = (data as Pick<Profile, 'id' | 'full_name'>[] | null) ?? []
  return new Map(rows.map((p) => [p.id, p.full_name]))
}