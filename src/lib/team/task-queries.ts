import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type {
  TeamTaskDetail,
  TeamTaskStats,
  TeamTaskWithDetails,
} from '@/types'

const TASK_COLUMNS = `
  *,
  assigned_profile:profiles!assigned_to(id, full_name, email, department),
  created_by_profile:profiles!created_by(id, full_name),
  startup:startups(id, name, logo_url),
  delegation:task_delegations!task_delegations_team_task_id_fkey(
    id,
    startup_task_id,
    delegated_by,
    delegated_at,
    metadata,
    delegator:profiles!task_delegations_delegated_by_fkey(id, full_name, role)
  )
`

/** All team tasks (RLS scopes this to everything a PM/admin may see). */
export async function getAllTeamTasks(): Promise<TeamTaskWithDetails[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('team_tasks')
    .select(TASK_COLUMNS)
    .order('created_at', { ascending: false })

  return (data as unknown as TeamTaskWithDetails[] | null) ?? []
}

/** Tasks assigned to one member. */
export async function getMyTeamTasks(userId: string): Promise<TeamTaskWithDetails[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('team_tasks')
    .select(TASK_COLUMNS)
    .eq('assigned_to', userId)
    .order('created_at', { ascending: false })

  return (data as unknown as TeamTaskWithDetails[] | null) ?? []
}

/** A single task with its joined profiles. */
export async function getTeamTaskById(taskId: string): Promise<TeamTaskWithDetails | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('team_tasks')
    .select(TASK_COLUMNS)
    .eq('id', taskId)
    .single()

  return (data as unknown as TeamTaskWithDetails | null) ?? null
}

/** One task plus its comments and status history — used by the detail modal. */
export async function getTeamTaskDetail(taskId: string): Promise<TeamTaskDetail | null> {
  const supabase = await createClient()

  const [taskRes, commentsRes, activitiesRes] = await Promise.all([
    supabase.from('team_tasks').select(TASK_COLUMNS).eq('id', taskId).single(),
    supabase
      .from('team_task_comments')
      .select('*, author:profiles!user_id(id, full_name)')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true }),
    supabase
      .from('team_task_activities')
      .select('*, actor:profiles!user_id(id, full_name)')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false }),
  ])

  if (!taskRes.data) return null

  return {
    task: taskRes.data as unknown as TeamTaskWithDetails,
    comments: (commentsRes.data as unknown as TeamTaskDetail['comments']) ?? [],
    activities: (activitiesRes.data as unknown as TeamTaskDetail['activities']) ?? [],
  }
}

/** Counts for a member's tasks (or all tasks when userId is omitted). */
export async function getTeamTaskStats(userId?: string): Promise<TeamTaskStats> {
  const supabase = await createClient()

  let query = supabase.from('team_tasks').select('status, due_date')
  if (userId) query = query.eq('assigned_to', userId)

  const { data } = await query
  const rows = (data as { status: string; due_date: string | null }[] | null) ?? []
  const today = new Date().toISOString().split('T')[0]

  return {
    total: rows.length,
    inProgress: rows.filter((r) => r.status === 'IN_PROGRESS').length,
    completed: rows.filter((r) => r.status === 'DONE').length,
    overdue: rows.filter((r) => r.status !== 'DONE' && r.due_date && r.due_date < today).length,
  }
}
