import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { WeeklyPlan } from '@/types'

/** The weekly plan whose date range contains today, or null. */
export async function getCurrentWeekPlan(startupId: string): Promise<WeeklyPlan | null> {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data } = await supabase
    .from('weekly_plans')
    .select('*')
    .eq('startup_id', startupId)
    .lte('week_start', today)
    .gte('week_end', today)
    .single()

  return data
}