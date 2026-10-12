import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/types'

const MEMBER_COLUMNS = 'id, full_name, email, phone, role, department, created_at, updated_at'

/** All internal team members (EMPLOYEE + PROJECT_MANAGER), ordered by name. */
export async function getAllTeamMembers(): Promise<Profile[]> {
  const supabase = await createClient()
  const { data } = await supabase
  .from('profiles')
  .select(MEMBER_COLUMNS)
  .in('role', ['EMPLOYEE', 'PROJECT_MANAGER'])
  .order('full_name', { ascending: true })
  
  return (data as Profile[] | null) ?? []
}

/** A single internal team member by profile id. */
export async function getTeamMemberById(id: string): Promise<Profile | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select(MEMBER_COLUMNS)
    .eq('id', id)
    .in('role', ['EMPLOYEE', 'PROJECT_MANAGER'])
    .single()

  return (data as Profile | null) ?? null
}
