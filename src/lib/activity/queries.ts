import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { ActivityLog } from '@/types'

/** All activity across every startup the caller can see (RLS-scoped). */
export async function getGlobalActivity(limit = 50): Promise<ActivityLog[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  return data || []
}

/** Activity scoped to one startup. */
export async function getStartupActivity(
  startupId: string,
  limit = 30
): Promise<ActivityLog[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('startup_id', startupId)
    .order('created_at', { ascending: false })
    .limit(limit)

  return data || []
}