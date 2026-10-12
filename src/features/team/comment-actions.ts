'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth/getSession'
import { logActivity } from '@/features/activity/actions'
import { getTeamTaskDetail } from '@/lib/team/task-queries'
import type { ActionState, TeamTaskDetail } from '@/types'

const AddCommentSchema = z.object({
  task_id: z.string().uuid(),
  comment: z.string().min(1, 'Comment cannot be empty').max(2000),
})

const TEAM_ROLES = ['EMPLOYEE', 'PROJECT_MANAGER'] as const

/** Add a comment to a team task. Task access is enforced by RLS. */
export async function addTeamTaskComment(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const validated = AddCommentSchema.safeParse({
    task_id: formData.get('task_id'),
    comment: formData.get('comment'),
  })

  if (!validated.success) return { error: validated.error.errors[0].message }

  const session = await getSession()
  if (!session || !TEAM_ROLES.includes(session.role as (typeof TEAM_ROLES)[number])) {
    return { error: 'Unauthorized' }
  }

  const { task_id, comment } = validated.data
  const supabase = await createClient()

  const { error } = await supabase.from('team_task_comments').insert({
    task_id,
    user_id: session.id,
    comment,
  })

  if (error) return { error: 'Failed to add comment' }

  await logActivity({
    action: 'COMMENTED_TEAM_TASK',
    entityType: 'team_task',
    entityId: task_id,
    metadata: { comment_preview: comment.slice(0, 80) },
  })

  revalidatePath('/daily-sprint')
  return { success: 'Comment added.' }
}

/** Fetch a task with its comments and status history — called by the detail modal. */
export async function fetchTeamTaskDetail(taskId: string): Promise<TeamTaskDetail | null> {
  const session = await getSession()
  if (!session || !TEAM_ROLES.includes(session.role as (typeof TEAM_ROLES)[number])) {
    return null
  }
  return getTeamTaskDetail(taskId)
}
