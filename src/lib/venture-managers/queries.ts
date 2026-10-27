import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/types'

const VM_COLUMNS = 'id, full_name, email, phone, role, department, created_at, updated_at'

export async function getAllVentureManagers(): Promise<Profile[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select(VM_COLUMNS)
    .eq('role', 'VENTURE_MANAGER')
    .order('full_name', { ascending: true })

  return (data as Profile[] | null) ?? []
}