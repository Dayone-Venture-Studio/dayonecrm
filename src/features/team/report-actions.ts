'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth/getSession'
import type { ActionState } from '@/types'

const SubmitReportSchema = z.object({
  report_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  yesterday: z.string().optional(),
  today: z.string().optional(),
  pending: z.string().optional(),
  blockers: z.string().optional(),
  followups: z.string().optional(),
  priority: z.string().optional(),
})

export async function submitDailyReport(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession()
  if (!session || session.role !== 'EMPLOYEE') return { error: 'Unauthorized' }

  const validated = SubmitReportSchema.safeParse({
    report_date: formData.get('report_date'),
    yesterday: formData.get('yesterday') || undefined,
    today: formData.get('today') || undefined,
    pending: formData.get('pending') || undefined,
    blockers: formData.get('blockers') || undefined,
    followups: formData.get('followups') || undefined,
    priority: formData.get('priority') || undefined,
  })

  if (!validated.success) return { error: validated.error.errors[0].message }

  const { report_date, yesterday, today, pending, blockers, followups, priority } = validated.data
  const content = {
    yesterday: yesterday || '',
    today: today || '',
    pending: pending || '',
    blockers: blockers || '',
    followups: followups || '',
    priority: priority || '',
  }

  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('daily_reports')
    .select('id')
    .eq('user_id', session.id)
    .eq('report_date', report_date)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from('daily_reports')
      .update({ content })
      .eq('id', existing.id)
    if (error) return { error: 'Failed to submit report' }
  } else {
    const { error } = await supabase
      .from('daily_reports')
      .insert({ user_id: session.id, report_date, content })
    if (error) return { error: 'Failed to submit report' }
  }

  revalidatePath('/daily-sprint')
  revalidatePath('/daily-feed')
  return { success: 'Morning report submitted.', data: { report_date } }
}

export async function endWorkSession(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession()
  if (!session || session.role !== 'EMPLOYEE') return { error: 'Unauthorized' }

  const report_date = (formData.get('report_date') as string) || new Date().toISOString().split('T')[0]

  const supabase = await createClient()
  const { data: existing } = await supabase
    .from('daily_reports')
    .select('id, ended_at')
    .eq('user_id', session.id)
    .eq('report_date', report_date)
    .maybeSingle()

  if (!existing) return { error: 'No active session found' }
  if (existing.ended_at) return { success: 'Session already ended.' }

  const { error } = await supabase
    .from('daily_reports')
    .update({ ended_at: new Date().toISOString() })
    .eq('id', existing.id)

  if (error) return { error: 'Failed to end session' }

  revalidatePath('/daily-sprint')
  revalidatePath('/daily-feed')
  return { success: 'Work session ended.' }
}

export async function deleteDailyReport(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }

  const reportId = formData.get('report_id') as string
  if (!reportId) return { error: 'Missing report ID' }

  const supabase = await createClient()

  // Employees can only delete their own reports
  if (session.role === 'EMPLOYEE') {
    const { data: report } = await supabase
      .from('daily_reports')
      .select('user_id')
      .eq('id', reportId)
      .maybeSingle()
    if (!report || report.user_id !== session.id) return { error: 'Unauthorized' }
  }

  const { error } = await supabase.from('daily_reports').delete().eq('id', reportId)
  if (error) return { error: 'Failed to delete report' }

  revalidatePath('/daily-feed')
  return { success: 'Report deleted.' }
}