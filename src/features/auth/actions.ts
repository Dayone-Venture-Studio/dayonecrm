'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
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
    .select('role, must_change_password')
    .eq('id', user.id)
    .single()

  if (!profile) return { error: 'Profile not found. Contact administrator.' }

  // Force one-time password change for admin-provisioned accounts.
  if (profile.must_change_password) {
    redirect('/change-password')
  }

  // Redirect based on role
  redirect(getRoleHome(profile.role as Role))
}

export async function logout(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters').max(128),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
})

export async function changePassword(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const validated = ChangePasswordSchema.safeParse({
    currentPassword: formData.get('currentPassword'),
    newPassword: formData.get('newPassword'),
    confirmPassword: formData.get('confirmPassword'),
  })

  if (!validated.success) {
    return { error: validated.error.errors[0].message }
  }

  const { currentPassword, newPassword, confirmPassword } = validated.data

  if (newPassword !== confirmPassword) {
    return { error: 'New password and confirmation do not match' }
  }

  if (currentPassword === newPassword) {
    return { error: 'New password must be different from the current password' }
  }

  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user || !user.email) {
    return { error: 'You must be signed in to change your password' }
  }

  // Verify the current password before allowing a change (re-authentication).
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  })

  if (verifyError) {
    return { error: 'Current password is incorrect' }
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (updateError) {
    return { error: updateError.message || 'Failed to update password' }
  }

  // Clear the one-time flag via the service role so the user cannot tamper
  // with it directly. Only reached after the password was actually changed.
  try {
    const adminClient = getAdminClient()
    const { error: profileError } = await adminClient
      .from('profiles')
      .update({ must_change_password: false })
      .eq('id', user.id)

    if (profileError) {
      return { error: 'Password updated but failed to update profile state. Please contact support.' }
    }
  } catch {
    return { error: 'Password updated but failed to update profile state. Please contact support.' }
  }

  // Best-effort: revoke other sessions that may still hold the old password.
  try {
    await supabase.auth.signOut({ scope: 'others' })
  } catch {
    // Non-critical; ignore.
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const redirectTo = getRoleHome((profile?.role as Role) ?? 'EMPLOYEE')

  return {
    success: 'Password changed successfully.',
    data: { redirectTo },
  }
}
