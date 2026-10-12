'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getRoleHome } from '@/lib/auth/roleHome'
import type { ActionState, Role } from '@/types'

const LoginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
})

export async function login(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const validated = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validated.success) {
    return { error: validated.error.errors[0].message }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: validated.data.email,
    password: validated.data.password,
  })

  if (error) {
    return { error: 'Invalid email or password' }
  }

  // Get user role to redirect appropriately
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Authentication failed' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) return { error: 'Profile not found. Contact administrator.' }

  // Redirect based on role
  redirect(getRoleHome(profile.role as Role))
}

export async function logout(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
