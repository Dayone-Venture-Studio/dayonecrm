'use server'

import { createClient } from '@/lib/supabase/server'

interface LogActivityInput {
  startupId?: string
  action: string
  entityType?: string
  entityId?: string
  metadata?: Record<string, unknown>
}

export async function logActivity(input: LogActivityInput): Promise<void> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('activity_logs').insert({
      startup_id: input.startupId || null,
      user_id: user.id,
      action: input.action,
      entity_type: input.entityType || null,
      entity_id: input.entityId || null,
      metadata: input.metadata || null,
    })
  } catch {
    // Activity logging should never block the main flow
    console.error('Failed to log activity')
  }
}
