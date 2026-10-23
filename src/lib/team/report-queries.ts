import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { TeamTaskWithDetails } from '@/types'

export interface DailyReport {
  date: string
  yesterday: string
  yesterdayCompleted: TeamTaskWithDetails[]
  todayPlan: TeamTaskWithDetails[]
  pendingCarry: TeamTaskWithDetails[]
  blockers: TeamTaskWithDetails[]
  followUps: TeamTaskWithDetails[]
  priorityOutcome: string
}

const PRIORITY_RANK: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 }

function isoDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

function dateDaysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return isoDate(d)
}

function byPriorityThenDue(a: TeamTaskWithDetails, b: TeamTaskWithDetails): number {
  const pa = PRIORITY_RANK[a.priority] ?? 9
  const pb = PRIORITY_RANK[b.priority] ?? 9
  if (pa !== pb) return pa - pb
  return (a.due_date || '').localeCompare(b.due_date || '')
}

const FOLLOW_UP_KEYWORDS = ['follow', 'call', 'review', 'meeting', 'check', 'sync']

function isFollowUp(task: TeamTaskWithDetails): boolean {
  const text = `${task.title} ${task.description || ''}`.toLowerCase()
  return FOLLOW_UP_KEYWORDS.some((k) => text.includes(k))
}

export function buildDailyReport(tasks: TeamTaskWithDetails[]): DailyReport {
  const today = isoDate(new Date())
  const yesterday = dateDaysAgo(1)

  const active = tasks.filter((t) => t.status !== 'DONE')
  const done = tasks.filter((t) => t.status === 'DONE')

  const yesterdayCompleted = done.filter((t) =>
    (t.updated_at || '').startsWith(yesterday)
  )

  const todayPlan = active
    .filter((t) => t.due_date === today || t.status === 'IN_PROGRESS' || t.due_date === null)
    .sort(byPriorityThenDue)

  const todayPlanIds = new Set(todayPlan.map((t) => t.id))
  const pendingCarry = active
    .filter((t) => t.due_date !== null && t.due_date! < today && !todayPlanIds.has(t.id))
    .sort(byPriorityThenDue)

  const blockers = active
    .filter((t) => t.due_date !== null && t.due_date! < today && t.priority === 'HIGH')
    .sort(byPriorityThenDue)

  const followUps = active
    .filter((t) => t.due_date === today && isFollowUp(t))
    .sort(byPriorityThenDue)

  const priorityOutcome = todayPlan.length > 0 ? todayPlan[0].title : ''

  return {
    date: today,
    yesterday,
    yesterdayCompleted,
    todayPlan,
    pendingCarry,
    blockers,
    followUps,
    priorityOutcome,
  }
}

export interface DailyReportSubmission {
  id: string
  user_id: string
  report_date: string
  submitted_at: string
  ended_at: string | null
  content: Record<string, unknown>
}

export interface DailyReportWithProfile extends DailyReportSubmission {
  profile: {
    id: string
    full_name: string
    email: string | null
    department: string | null
  } | null
}

export async function getTodayReport(userId: string): Promise<DailyReportSubmission | null> {
  return getReportByDate(userId, isoDate(new Date()))
}

export async function getReportByDate(userId: string, date: string): Promise<DailyReportSubmission | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('daily_reports')
    .select('id, user_id, report_date, submitted_at, ended_at, content')
    .eq('user_id', userId)
    .eq('report_date', date)
    .maybeSingle()

  return (data as DailyReportSubmission | null) ?? null
}

export async function getAllReportsByDate(date: string): Promise<DailyReportWithProfile[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('daily_reports')
    .select('id, user_id, report_date, submitted_at, ended_at, content')
    .eq('report_date', date)
    .order('submitted_at', { ascending: true })

  const reports = (data as DailyReportSubmission[] | null) ?? []
  if (reports.length === 0) return []

  const userIds = [...new Set(reports.map((r) => r.user_id))]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, email, department')
    .in('id', userIds)

  const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]))
  return reports.map((r) => ({
    ...r,
    profile: profileMap.get(r.user_id) || null,
  })) as DailyReportWithProfile[]
}