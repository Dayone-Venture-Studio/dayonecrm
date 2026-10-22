'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth/getSession'
import { logActivity } from '@/features/activity/actions'
import { DEPARTMENTS } from '@/lib/team/constants'
import type { ActionState, TaskStatus } from '@/types'

const DATE = /^\d{4}-\d{2}-\d{2}$/

const CreateTeamTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  due_date: z.string().regex(DATE, 'Invalid date').optional(),
  department: z.enum(DEPARTMENTS).optional(),
  assigned_to: z.string().uuid().optional(),
})

const UpdateTeamTaskSchema = CreateTeamTaskSchema.extend({
  id: z.string().uuid(),
})

const TEAM_ROLES = ['EMPLOYEE', 'PROJECT_MANAGER'] as const

/** Internal team member creates a task. Employees are forced to self-assign. */
export async function createTeamTask(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const validated = CreateTeamTaskSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description') || undefined,
    priority: formData.get('priority'),
    due_date: formData.get('due_date') || undefined,
    department: formData.get('department') || undefined,
    assigned_to: formData.get('assigned_to') || undefined,
  })

  if (!validated.success) return { error: validated.error.errors[0].message }

  const session = await getSession()
  if (!session || !TEAM_ROLES.includes(session.role as (typeof TEAM_ROLES)[number])) {
    return { error: 'Unauthorized' }
  }

  const isProjectManager = session.role === 'PROJECT_MANAGER'
  const { title, description, priority, due_date, department } = validated.data
  const assignedTo = isProjectManager ? validated.data.assigned_to ?? null : session.id

  const supabase = await createClient()
  const { data: task, error } = await supabase
    .from('team_tasks')
    .insert({
      title,
      description: description || null,
      priority,
      due_date: due_date || null,
      department: department || null,
      assigned_to: assignedTo,
      created_by: session.id,
      status: 'TODO',
    })
    .select('id')
    .single()

  if (error || !task) return { error: 'Failed to create task' }

  await supabase.from('team_task_activities').insert({
    task_id: task.id,
    user_id: session.id,
    from_status: null,
    to_status: 'TODO',
  })

  await logActivity({
    action: 'CREATED_TEAM_TASK',
    entityType: 'team_task',
    entityId: task.id,
    metadata: { task_title: title, assigned_to: assignedTo, department },
  })

  revalidatePath('/daily-sprint')
  return { success: 'Task created.', data: { taskId: task.id } }
}

/** Edit a task. Employees edit their own tasks but cannot reassign them. */
export async function updateTeamTask(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const idFromForm = formData.get('id')
  if (!idFromForm) return { error: 'Missing task ID' }

  const validated = UpdateTeamTaskSchema.safeParse({
    id: idFromForm,
    title: formData.get('title'),
    description: formData.get('description') || undefined,
    priority: formData.get('priority'),
    due_date: formData.get('due_date') || undefined,
    department: formData.get('department') || undefined,
    assigned_to: formData.get('assigned_to') || undefined,
  })

  if (!validated.success) return { error: validated.error.errors[0].message }

  const session = await getSession()
  if (!session || !TEAM_ROLES.includes(session.role as (typeof TEAM_ROLES)[number])) {
    return { error: 'Unauthorized' }
  }

  const isProjectManager = session.role === 'PROJECT_MANAGER'
  const { id, title, description, priority, due_date, department } = validated.data

  const supabase = await createClient()
  const update = {
    title,
    description: description || null,
    priority,
    due_date: due_date || null,
    department: department || null,
    ...(isProjectManager ? { assigned_to: validated.data.assigned_to ?? null } : {}),
  }

  const { error } = await supabase.from('team_tasks').update(update).eq('id', id)
  if (error) return { error: 'Failed to update task' }

  await logActivity({
    action: 'UPDATED_TEAM_TASK',
    entityType: 'team_task',
    entityId: id,
    metadata: { task_title: title },
  })

  revalidatePath('/daily-sprint')
  return { success: 'Task updated.' }
}

/**
 * Move a task between Kanban columns. Records who changed the status and when
 * in team_task_activities so the task shows a full status timeline.
 */
export async function updateTeamTaskStatus(
  taskId: string,
  status: TaskStatus
): Promise<ActionState> {
  const session = await getSession()
  if (!session || !TEAM_ROLES.includes(session.role as (typeof TEAM_ROLES)[number])) {
    return { error: 'Unauthorized' }
  }

  if (!['TODO', 'IN_PROGRESS', 'DONE'].includes(status)) {
    return { error: 'Invalid status' }
  }

  const supabase = await createClient()
  const { data: current, error: readError } = await supabase
    .from('team_tasks')
    .select('status, title')
    .eq('id', taskId)
    .single()

  if (readError || !current) return { error: 'Task not found' }
  if (current.status === status) return { success: 'No change' }

  const { error } = await supabase.from('team_tasks').update({ status }).eq('id', taskId)
  if (error) return { error: 'Failed to update task status' }

  await supabase.from('team_task_activities').insert({
    task_id: taskId,
    user_id: session.id,
    from_status: current.status,
    to_status: status,
  })

  if (status === 'DONE') {
    await logActivity({
      action: 'COMPLETED_TEAM_TASK',
      entityType: 'team_task',
      entityId: taskId,
      metadata: { task_title: current.title },
    })
  }

  revalidatePath('/daily-sprint')
  return { success: 'Status updated.' }
}

/** Project managers and admins delete tasks. */
export async function deleteTeamTask(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = formData.get('id') as string
  if (!id) return { error: 'Missing task ID' }

  const session = await getSession()
  if (!session || !['PROJECT_MANAGER', 'ADMIN'].includes(session.role)) {
    return { error: 'Unauthorized' }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('team_tasks').delete().eq('id', id)
  if (error) return { error: 'Failed to delete task' }

  revalidatePath('/daily-sprint')
  return { success: 'Task deleted.' }
}
