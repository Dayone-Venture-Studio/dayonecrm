'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { getSession } from '@/lib/auth/getSession'
import { logActivity } from '@/features/activity/actions'
import type { ActionState } from '@/types'

const ApplyLeaveSchema = z.object({
  duration_type: z.enum(['FULL_DAY', 'HALF_DAY']),
  half_day_slot: z.enum(['FIRST_HALF', 'SECOND_HALF']).optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid start date'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid end date'),
  reason: z.string().trim().min(3, 'Reason must be at least 3 characters').max(1000),
})

const ReviewLeaveSchema = z.object({
  id: z.string().uuid(),
  decision: z.enum(['APPROVE', 'REJECT']),
  review_note: z.string().trim().max(500).optional(),
})

function isTeamMember(role: string) {
  return role === 'EMPLOYEE' || role === 'PROJECT_MANAGER'
}

export async function applyLeave(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const validated = ApplyLeaveSchema.safeParse({
    duration_type: formData.get('duration_type'),
    half_day_slot: formData.get('half_day_slot') || undefined,
    start_date: formData.get('start_date'),
    end_date: formData.get('end_date'),
    reason: formData.get('reason'),
  })

  if (!validated.success) return { error: validated.error.errors[0].message }

  const session = await getSession()
  if (!session || !isTeamMember(session.role)) return { error: 'Unauthorized' }

  const { duration_type, half_day_slot, start_date, end_date, reason } = validated.data

  if (duration_type === 'HALF_DAY') {
    if (!half_day_slot) return { error: 'Please select which half of the day' }
    if (start_date !== end_date) return { error: 'Half-day leave must be a single date' }
  } else if (half_day_slot) {
    return { error: 'Half-day slot is only for half-day leave' }
  }

  if (start_date > end_date) return { error: 'Start date must be on or before end date' }

  const supabase = await createClient()

  // Prevent overlapping pending/approved requests.
  const { data: overlapping } = await supabase
    .from('leave_requests')
    .select('id')
    .eq('user_id', session.id)
    .in('status', ['PENDING', 'APPROVED'])
    .lte('start_date', end_date)
    .gte('end_date', start_date)

  if (overlapping && overlapping.length > 0) {
    return { error: 'You already have a leave request overlapping these dates' }
  }

  const { error } = await supabase.from('leave_requests').insert({
    user_id: session.id,
    duration_type,
    half_day_slot: half_day_slot ?? null,
    start_date,
    end_date,
    reason,
    status: 'PENDING',
  } as never)

  if (error) return { error: `Failed to submit leave request: ${error.message}` }

  await logActivity({
    action: 'APPLIED_LEAVE',
    entityType: 'leave_request',
    entityId: undefined,
    metadata: { duration_type, start_date, end_date, reason },
  })

  revalidatePath('/leave')
  return { success: 'Leave request submitted. Your project manager will review it.' }
}

export async function reviewLeave(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const validated = ReviewLeaveSchema.safeParse({
    id: formData.get('id'),
    decision: formData.get('decision'),
    review_note: formData.get('review_note') || undefined,
  })

  if (!validated.success) return { error: validated.error.errors[0].message }

  const session = await getSession()
  if (!session || session.role !== 'PROJECT_MANAGER' && session.role !== 'ADMIN') {
    return { error: 'Unauthorized' }
  }

  const { id, decision, review_note } = validated.data
  const supabase = await createClient()

  const { data: request } = await supabase
    .from('leave_requests')
    .select('user_id, status')
    .eq('id', id)
    .single()

  if (!request) return { error: 'Leave request not found' }
  if (request.status !== 'PENDING') return { error: 'This request has already been reviewed' }
  if (request.user_id === session.id) return { error: 'You cannot review your own leave request' }

  const newStatus = decision === 'APPROVE' ? 'APPROVED' : 'REJECTED'

  const { error } = await supabase
    .from('leave_requests')
    .update({
      status: newStatus,
      reviewed_by: session.id,
      reviewed_at: new Date().toISOString(),
      review_note: review_note || null,
    })
    .eq('id', id)

  if (error) return { error: `Failed to update leave request: ${error.message}` }

  await logActivity({
    action: decision === 'APPROVE' ? 'APPROVED_LEAVE' : 'REJECTED_LEAVE',
    entityType: 'leave_request',
    entityId: id,
    metadata: { review_note: review_note || null },
  })

  revalidatePath('/leave')
  return {
    success: decision === 'APPROVE' ? 'Leave request approved.' : 'Leave request rejected.',
  }
}

export async function cancelLeave(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = formData.get('id') as string
  if (!id) return { error: 'Missing request ID' }

  const session = await getSession()
  if (!session || !isTeamMember(session.role)) return { error: 'Unauthorized' }

  const supabase = await createClient()
  const { data: request } = await supabase
    .from('leave_requests')
    .select('user_id, status')
    .eq('id', id)
    .single()

  if (!request) return { error: 'Leave request not found' }
  if (request.user_id !== session.id) return { error: 'Unauthorized' }
  if (request.status !== 'PENDING') return { error: 'Only pending requests can be cancelled' }

  // Use the service role so cancellation works regardless of RLS policy state.
  const adminClient = getAdminClient()
  const { error } = await adminClient
    .from('leave_requests')
    .update({ status: 'CANCELLED', updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return { error: `Failed to cancel leave request: ${error.message}` }

  revalidatePath('/leave')
  return { success: 'Leave request cancelled.' }
}