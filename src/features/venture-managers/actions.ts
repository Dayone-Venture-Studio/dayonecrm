'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { getSession } from '@/lib/auth/getSession'
import { logActivity } from '@/features/activity/actions'
import type { ActionState } from '@/types'

const CreateVentureManagerSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  department: z.string().optional(),
})

const UpdateVentureManagerSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  department: z.string().optional(),
})

export async function createVentureManager(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const validated = CreateVentureManagerSchema.safeParse({
    full_name: formData.get('full_name'),
    email: formData.get('email'),
    phone: formData.get('phone') || undefined,
    password: formData.get('password'),
    department: formData.get('department') || undefined,
  })

  if (!validated.success) return { error: validated.error.errors[0].message }

  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return { error: 'Unauthorized' }

  const { full_name, email, phone, password, department } = validated.data
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
    return { error: authError?.message || 'Failed to create venture manager account' }
  }

  const vmId = authData.user.id

  const { error: profileError } = await adminClient.from('profiles').insert({
    id: vmId,
    full_name,
    email,
    phone: phone || null,
    role: 'VENTURE_MANAGER',
    department: department || null,
    must_change_password: true,
  })

  if (profileError) {
    await adminClient.auth.admin.deleteUser(vmId)
    return { error: `Failed to create venture manager profile: ${profileError.message}` }
  }

  await logActivity({
    action: 'CREATED_VENTURE_MANAGER',
    entityType: 'profile',
    entityId: vmId,
    metadata: { member_name: full_name, member_email: email, department: department || null },
  })

  revalidatePath('/admin/venture-managers')
  return {
    success: `${full_name} has been added as a venture manager.`,
    data: { memberId: vmId },
  }
}

export async function updateVentureManager(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const validated = UpdateVentureManagerSchema.safeParse({
    id: formData.get('id'),
    full_name: formData.get('full_name'),
    phone: formData.get('phone') || undefined,
    department: formData.get('department') || undefined,
  })

  if (!validated.success) return { error: validated.error.errors[0].message }

  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return { error: 'Unauthorized' }

  const { id, full_name, phone, department } = validated.data
  const supabase = await createClient()

  const { error } = await supabase
    .from('profiles')
    .update({ full_name, phone: phone || null, department: department || null })
    .eq('id', id)

  if (error) return { error: 'Failed to update venture manager' }

  await logActivity({
    action: 'UPDATED_VENTURE_MANAGER',
    entityType: 'profile',
    entityId: id,
    metadata: { member_name: full_name, department: department || null },
  })

  revalidatePath('/admin/venture-managers')
  return { success: `${full_name} updated.` }
}

export async function deleteVentureManager(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = formData.get('id') as string
  if (!id) return { error: 'Missing venture manager ID' }

  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return { error: 'Unauthorized' }
  if (session.id === id) return { error: 'You cannot delete your own account.' }

  const adminClient = getAdminClient()

  await adminClient.from('activity_logs').delete().eq('user_id', id)

  const { error } = await adminClient.auth.admin.deleteUser(id)

  if (error) return { error: error.message || 'Failed to delete venture manager' }

  revalidatePath('/admin/venture-managers')
  return { success: 'Venture manager deleted.' }
}