'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import crypto from 'crypto'
import { getSession } from '@/lib/auth/getSession'
import { logActivity } from '@/features/activity/actions'
import { DEPARTMENTS } from '@/lib/team/constants'
import type { ActionState } from '@/types'

const CreateTeamMemberSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['EMPLOYEE', 'PROJECT_MANAGER']),
  department: z.enum(DEPARTMENTS),
})

const UpdateTeamMemberSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  role: z.enum(['EMPLOYEE', 'PROJECT_MANAGER']),
  department: z.enum(DEPARTMENTS),
})

/** Admin creates an internal team member (EMPLOYEE / PROJECT_MANAGER). */
export async function createTeamMember(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const validated = CreateTeamMemberSchema.safeParse({
    full_name: formData.get('full_name'),
    email: formData.get('email'),
    phone: formData.get('phone') || undefined,
    password: formData.get('password'),
    role: formData.get('role'),
    department: formData.get('department'),
  })

  if (!validated.success) return { error: validated.error.errors[0].message }

  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return { error: 'Unauthorized' }

  const { full_name, email, phone, password, role, department } = validated.data
  const adminClient = getAdminClient()

  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name },
  })

  if (authError || !authData.user) {
    if (
      authError?.message?.includes('already registered') ||
      authError?.message?.includes('already been registered')
    ) {
      return { error: 'This email is already registered in the system.' }
    }
    return { error: authError?.message || 'Failed to create team member account' }
  }

  const memberId = authData.user.id

  const { error: profileError } = await adminClient.from('profiles').insert({
    id: memberId,
    full_name,
    email,
    phone: phone || null,
    role,
    department,
    must_change_password: true,
  })

  if (profileError) {
    await adminClient.auth.admin.deleteUser(memberId)
    return { error: `Failed to create team member profile: ${profileError.message}` }
  }

  await logActivity({
    action: 'CREATED_TEAM_MEMBER',
    entityType: 'profile',
    entityId: memberId,
    metadata: { member_name: full_name, member_email: email, role, department },
  })

  revalidatePath('/admin/team')
  return {
    success: `${full_name} has been added as ${role === 'PROJECT_MANAGER' ? 'a project manager' : 'an employee'}.`,
    data: { memberId },
  }
}

/** Admin edits an existing team member's profile. */
export async function updateTeamMember(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const validated = UpdateTeamMemberSchema.safeParse({
    id: formData.get('id'),
    full_name: formData.get('full_name'),
    phone: formData.get('phone') || undefined,
    role: formData.get('role'),
    department: formData.get('department'),
  })

  if (!validated.success) return { error: validated.error.errors[0].message }

  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return { error: 'Unauthorized' }

  const { id, full_name, phone, role, department } = validated.data
  const supabase = await createClient()

  const { error } = await supabase
    .from('profiles')
    .update({ full_name, phone: phone || null, role, department })
    .eq('id', id)

  if (error) return { error: 'Failed to update team member' }

  await logActivity({
    action: 'UPDATED_TEAM_MEMBER',
    entityType: 'profile',
    entityId: id,
    metadata: { member_name: full_name, role, department },
  })

  revalidatePath('/admin/team')
  return { success: `${full_name} updated.` }
}

/** Admin permanently deletes a team member and their auth account. */
export async function deleteTeamMember(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = formData.get('id') as string
  if (!id) return { error: 'Missing member ID' }

  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return { error: 'Unauthorized' }
  if (session.id === id) return { error: 'You cannot delete your own account.' }

  const adminClient = getAdminClient()

  // Remove rows that reference this user without ON DELETE CASCADE so the
  // auth account (and its cascading profile) can be deleted cleanly.
  await adminClient.from('activity_logs').delete().eq('user_id', id)
  await adminClient.from('leave_requests').delete().eq('user_id', id)

  const { error } = await adminClient.auth.admin.deleteUser(id)

  if (error) return { error: error.message || 'Failed to delete team member' }

  revalidatePath('/admin/team')
  return { success: 'Team member deleted.' }
}

const ResetPasswordSchema = z.object({
  id: z.string().uuid(),
})

function generateTempPassword(length = 12): string {
  const chars =
    'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*'
  const bytes = crypto.randomBytes(length)
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length]
  }
  return result
}

/** Admin resets a team member's password to a new temporary value. */
export async function resetTeamMemberPassword(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const validated = ResetPasswordSchema.safeParse({ id: formData.get('id') })
  if (!validated.success) return { error: 'Invalid member ID' }

  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return { error: 'Unauthorized' }

  const { id } = validated.data
  const adminClient = getAdminClient()

  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .select('full_name, role')
    .eq('id', id)
    .single()

  if (profileError || !profile) return { error: 'Team member not found' }
  if (
    profile.role !== 'EMPLOYEE' &&
    profile.role !== 'PROJECT_MANAGER' &&
    profile.role !== 'VENTURE_MANAGER'
  ) {
    return { error: 'Can only reset passwords for team members or venture managers' }
  }

  const tempPassword = generateTempPassword()

  const { error: updateError } = await adminClient.auth.admin.updateUserById(id, {
    password: tempPassword,
  })

  if (updateError) {
    return { error: updateError.message || 'Failed to reset password' }
  }

  const { error: flagError } = await adminClient
    .from('profiles')
    .update({ must_change_password: true })
    .eq('id', id)

  if (flagError) {
    return { error: 'Password reset but failed to update profile state' }
  }

  await logActivity({
    action: 'RESET_TEAM_MEMBER_PASSWORD',
    entityType: 'profile',
    entityId: id,
    metadata: { member_name: profile.full_name },
  })

  revalidatePath('/admin/team')
  return {
    success: `Password reset for ${profile.full_name}. Share the temporary password securely.`,
    data: { password: tempPassword, memberId: id, memberName: profile.full_name },
  }
}
