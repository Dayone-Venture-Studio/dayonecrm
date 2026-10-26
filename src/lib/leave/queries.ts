import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { LeaveRequest, LeaveRequestWithProfile, Profile } from '@/types'

type RawLeave = Omit<LeaveRequest, 'requester' | 'reviewer'>

async function attachProfiles(rows: RawLeave[]): Promise<LeaveRequestWithProfile[]> {
  const supabase = await createClient()
  const userIds = Array.from(new Set(rows.map((r) => r.user_id)))
  const reviewerIds = Array.from(
    new Set(rows.map((r) => r.reviewed_by).filter(Boolean) as string[])
  )

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, email, department, role')
    .in('id', [...userIds, ...reviewerIds])

  const byId = new Map((profiles ?? []).map((p) => [p.id, p]))

  return rows.map((row) => ({
    ...row,
    requester: (byId.get(row.user_id) as Profile | undefined) ?? null,
    reviewer: row.reviewed_by
      ? ((byId.get(row.reviewed_by) as Pick<Profile, 'id' | 'full_name'> | undefined) ?? null)
      : null,
  }))
}

export async function getMyLeaveRequests(userId: string): Promise<LeaveRequestWithProfile[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('leave_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return attachProfiles((data as RawLeave[] | null) ?? [])
}

export async function getAllLeaveRequests(): Promise<LeaveRequestWithProfile[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('leave_requests')
    .select('*')
    .order('created_at', { ascending: false })

  return attachProfiles((data as RawLeave[] | null) ?? [])
}