import 'server-only'
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { SessionUser } from '@/types'

export const getSession = cache(async (): Promise<SessionUser | null> => {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, must_change_password')
    .eq('id', user.id)
    .single()

  if (!profile) return null

  return {
    id: user.id,
    email: user.email!,
    role: (profile.role || '').trim().toUpperCase(),
    full_name: profile.full_name,
    must_change_password: Boolean(profile.must_change_password),
  }
})
