'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { logActivity } from '@/features/activity/actions'
import type {
  VentureManagerNote,
  NoteEntityType,
  NoteUrgency,
  NoteVisibility,
  ActionState,
} from '@/types'

// ─── Task Delegation Schema ──────────────────────────────────

const ReassignTaskSchema = z.object({
  taskId: z.string().uuid('Invalid task ID'),
  employeeId: z.string().uuid('Invalid employee ID'),
  note: z.string().optional(),
})

/**
 * Creates a new venture manager note
 */
export async function createNote(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Not authenticated' }
    }

    // Verify user is a venture manager
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'VENTURE_MANAGER') {
      return { error: 'Unauthorized: Venture Manager role required' }
    }

    const entityType = formData.get('entity_type') as NoteEntityType
    const entityId = formData.get('entity_id') as string
    const noteText = formData.get('note_text') as string
    const urgency = (formData.get('urgency') as NoteUrgency) || 'MEDIUM'
    const visibility = (formData.get('visibility') as NoteVisibility) || 'ADMIN_ONLY'

    if (!entityType || !entityId || !noteText) {
      return { error: 'Missing required fields' }
    }

    // Insert the note
    const { data: note, error } = await supabase
      .from('venture_manager_notes')
      .insert({
        created_by: user.id,
        entity_type: entityType,
        entity_id: entityId,
        note_text: noteText,
        urgency,
        visibility,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating note:', error)
      return { error: 'Failed to create note' }
    }

    // Log to activity
    let startupId: string | undefined
    if (entityType === 'STARTUP') {
      startupId = entityId
    } else if (entityType === 'TASK' || entityType === 'WEEKLY_PLAN') {
      // Fetch startup_id from the entity
      const table = entityType === 'TASK' ? 'tasks' : 'weekly_plans'
      const { data: entity } = await supabase
        .from(table)
        .select('startup_id')
        .eq('id', entityId)
        .single()
      startupId = entity?.startup_id
    }

    await logActivity({
      startupId,
      action: `Created ${urgency.toLowerCase()} priority note on ${entityType.toLowerCase()}`,
      entityType: 'VENTURE_MANAGER_NOTE',
      entityId: note.id,
      metadata: { urgency, visibility, entity_type: entityType },
    })

    revalidatePath('/venture-manager')
    revalidatePath('/admin')

    return { success: 'Note created successfully', data: note }
  } catch (err) {
    console.error('Unexpected error creating note:', err)
    return { error: 'An unexpected error occurred' }
  }
}

/**
 * Updates an existing venture manager note
 */
export async function updateNote(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Not authenticated' }
    }

    // Verify user is a venture manager
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'VENTURE_MANAGER') {
      return { error: 'Unauthorized: Venture Manager role required' }
    }

    const noteId = formData.get('note_id') as string
    const noteText = formData.get('note_text') as string
    const urgency = formData.get('urgency') as NoteUrgency
    const visibility = formData.get('visibility') as NoteVisibility

    if (!noteId) {
      return { error: 'Note ID is required' }
    }

    // Build update object
    const updates: Partial<VentureManagerNote> = {}
    if (noteText) updates.note_text = noteText
    if (urgency) updates.urgency = urgency
    if (visibility) updates.visibility = visibility

    if (Object.keys(updates).length === 0) {
      return { error: 'No fields to update' }
    }

    // Update the note
    const { data: note, error } = await supabase
      .from('venture_manager_notes')
      .update(updates)
      .eq('id', noteId)
      .eq('created_by', user.id) // Only allow updating own notes
      .select()
      .single()

    if (error) {
      console.error('Error updating note:', error)
      return { error: 'Failed to update note' }
    }

    await logActivity({
      action: 'Updated venture manager note',
      entityType: 'VENTURE_MANAGER_NOTE',
      entityId: noteId,
    })

    revalidatePath('/venture-manager')
    revalidatePath('/admin')

    return { success: 'Note updated successfully', data: note }
  } catch (err) {
    console.error('Unexpected error updating note:', err)
    return { error: 'An unexpected error occurred' }
  }
}

/**
 * Resolves (or unresolves) a venture manager note
 */
export async function resolveNote(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Not authenticated' }
    }

    // Verify user is venture manager or admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['VENTURE_MANAGER', 'ADMIN'].includes(profile.role)) {
      return { error: 'Unauthorized' }
    }

    const noteId = formData.get('note_id') as string
    const resolved = formData.get('resolved') === 'true'

    if (!noteId) {
      return { error: 'Note ID is required' }
    }

    const { data: note, error } = await supabase
      .from('venture_manager_notes')
      .update({
        resolved,
        resolved_by: resolved ? user.id : null,
        resolved_at: resolved ? new Date().toISOString() : null,
      })
      .eq('id', noteId)
      .select()
      .single()

    if (error) {
      console.error('Error resolving note:', error)
      return { error: 'Failed to update note status' }
    }

    await logActivity({
      action: resolved ? 'Resolved venture manager note' : 'Reopened venture manager note',
      entityType: 'VENTURE_MANAGER_NOTE',
      entityId: noteId,
    })

    revalidatePath('/venture-manager')
    revalidatePath('/admin')

    return { success: `Note ${resolved ? 'resolved' : 'reopened'} successfully`, data: note }
  } catch (err) {
    console.error('Unexpected error resolving note:', err)
    return { error: 'An unexpected error occurred' }
  }
}


/**
 * Deletes a note. Admins can delete any note; venture managers only their own.
 * Resolved notes cannot be deleted.
 */
export async function deleteNote(noteId: string): Promise<ActionState> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Not authenticated' }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['VENTURE_MANAGER', 'ADMIN'].includes(profile.role)) {
      return { error: 'Unauthorized' }
    }

    const { data: existing, error: fetchError } = await supabase
      .from('venture_manager_notes')
      .select('id, resolved, created_by')
      .eq('id', noteId)
      .single()

    if (fetchError || !existing) {
      return { error: 'Note not found' }
    }

    if (existing.resolved) {
      return { error: 'Resolved notes cannot be deleted' }
    }

    if (profile.role !== 'ADMIN' && existing.created_by !== user.id) {
      return { error: 'Unauthorized: you can only delete your own notes' }
    }

    const { error } = await supabase
      .from('venture_manager_notes')
      .delete()
      .eq('id', noteId)

    if (error) {
      console.error('Error deleting note:', error)
      return { error: 'Failed to delete note' }
    }

    await logActivity({
      action: 'Deleted venture manager note',
      entityType: 'VENTURE_MANAGER_NOTE',
      entityId: noteId,
    })

    revalidatePath('/venture-manager')
    revalidatePath('/admin')

    return { success: 'Note deleted successfully' }
  } catch (err) {
    console.error('Unexpected error deleting note:', err)
    return { error: 'An unexpected error occurred' }
  }
}


/**
 * Acknowledges a venture manager note (founder only)
 */
export async function acknowledgeNote(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Not authenticated' }
    }

    // Verify user is a founder
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'FOUNDER') {
      return { error: 'Unauthorized: Founder role required' }
    }

    const noteId = formData.get('note_id') as string

    if (!noteId) {
      return { error: 'Note ID is required' }
    }

    // Get the note to verify it belongs to founder's startup
    const { data: note, error: fetchError } = await supabase
      .from('venture_manager_notes')
      .select('id, entity_type, entity_id, acknowledged')
      .eq('id', noteId)
      .single()

    if (fetchError || !note) {
      return { error: 'Note not found' }
    }

    if (note.acknowledged) {
      return { error: 'Note has already been acknowledged' }
    }

    // Verify the note belongs to founder's startup
    let startupId: string | null = null

    if (note.entity_type === 'STARTUP') {
      startupId = note.entity_id
    } else if (note.entity_type === 'TASK') {
      const { data: task } = await supabase
        .from('tasks')
        .select('startup_id')
        .eq('id', note.entity_id)
        .single()
      startupId = task?.startup_id || null
    } else if (note.entity_type === 'WEEKLY_PLAN') {
      const { data: plan } = await supabase
        .from('weekly_plans')
        .select('startup_id')
        .eq('id', note.entity_id)
        .single()
      startupId = plan?.startup_id || null
    }

    if (!startupId) {
      return { error: 'Could not determine startup for this note' }
    }

    // Verify user is a founder of this startup
    const { data: membership } = await supabase
      .from('startup_members')
      .select('id')
      .eq('startup_id', startupId)
      .eq('user_id', user.id)
      .eq('role', 'FOUNDER')
      .single()

    if (!membership) {
      return { error: 'Unauthorized: You are not a founder of this startup' }
    }

    // Acknowledge the note
    const { data: updatedNote, error: updateError } = await supabase
      .from('venture_manager_notes')
      .update({
        acknowledged: true,
        acknowledged_by: user.id,
        acknowledged_at: new Date().toISOString(),
      })
      .eq('id', noteId)
      .select()
      .single()

    if (updateError) {
      console.error('Error acknowledging note:', updateError)
      return { error: 'Failed to acknowledge note' }
    }

    await logActivity({
      startupId,
      action: 'Acknowledged venture manager note',
      entityType: 'VENTURE_MANAGER_NOTE',
      entityId: noteId,
    })

    revalidatePath('/founder')
    revalidatePath('/venture-manager')
    revalidatePath('/admin')

    return { success: 'Note acknowledged successfully', data: updatedNote }
  } catch (err) {
    console.error('Unexpected error acknowledging note:', err)
    return { error: 'An unexpected error occurred' }
  }
}

/**
 * Un-acknowledges a venture manager note (founder only)
 */
export async function unacknowledgeNote(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Not authenticated' }
    }

    // Verify user is a founder
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'FOUNDER') {
      return { error: 'Unauthorized: Founder role required' }
    }

    const noteId = formData.get('note_id') as string

    if (!noteId) {
      return { error: 'Note ID is required' }
    }

    // Get the note to verify it belongs to founder's startup
    const { data: note, error: fetchError } = await supabase
      .from('venture_manager_notes')
      .select('id, entity_type, entity_id, acknowledged')
      .eq('id', noteId)
      .single()

    if (fetchError || !note) {
      return { error: 'Note not found' }
    }

    if (!note.acknowledged) {
      return { error: 'Note is not acknowledged' }
    }

    // Verify the note belongs to founder's startup
    let startupId: string | null = null

    if (note.entity_type === 'STARTUP') {
      startupId = note.entity_id
    } else if (note.entity_type === 'TASK') {
      const { data: task } = await supabase
        .from('tasks')
        .select('startup_id')
        .eq('id', note.entity_id)
        .single()
      startupId = task?.startup_id || null
    } else if (note.entity_type === 'WEEKLY_PLAN') {
      const { data: plan } = await supabase
        .from('weekly_plans')
        .select('startup_id')
        .eq('id', note.entity_id)
        .single()
      startupId = plan?.startup_id || null
    }

    if (!startupId) {
      return { error: 'Could not determine startup for this note' }
    }

    // Verify user is a founder of this startup
    const { data: membership } = await supabase
      .from('startup_members')
      .select('id')
      .eq('startup_id', startupId)
      .eq('user_id', user.id)
      .eq('role', 'FOUNDER')
      .single()

    if (!membership) {
      return { error: 'Unauthorized: You are not a founder of this startup' }
    }

    // Un-acknowledge the note
    const { data: updatedNote, error: updateError } = await supabase
      .from('venture_manager_notes')
      .update({
        acknowledged: false,
        acknowledged_by: null,
        acknowledged_at: null,
      })
      .eq('id', noteId)
      .select()
      .single()

    if (updateError) {
      console.error('Error un-acknowledging note:', updateError)
      return { error: 'Failed to un-acknowledge note' }
    }

    await logActivity({
      startupId,
      action: 'Un-acknowledged venture manager note',
      entityType: 'VENTURE_MANAGER_NOTE',
      entityId: noteId,
    })

    revalidatePath('/founder')
    revalidatePath('/venture-manager')
    revalidatePath('/admin')

    return { success: 'Note un-acknowledged successfully', data: updatedNote }
  } catch (err) {
    console.error('Unexpected error un-acknowledging note:', err)
    return { error: 'An unexpected error occurred' }
  }
}


// ─── Task Delegation ──────────────────────────────────────────

/**
 * Reassigns a startup task to an internal EMPLOYEE.
 * 
 * **Workflow:**
 * 1. Validates that the user is a VENTURE_MANAGER or ADMIN
 * 2. Validates that the target employee has the EMPLOYEE role
 * 3. Fetches the original startup task details
 * 4. Checks if the task is already delegated
 * 5. If already delegated: Updates the existing team_tasks entry and delegation record (reassignment)
 * 6. If not delegated: Creates a new team_tasks entry and delegation record (new delegation)
 * 7. Enriches the team_tasks description with "Assigned by [VM name] for [Startup name]"
 * 8. Logs activity for audit trail
 * 9. Revalidates relevant paths for cache invalidation
 * 
 * **Bidirectional Sync:**
 * Once delegated, status updates on either the startup task or team task will sync automatically.
 * See updateTaskStatus (tasks/actions.ts) and updateTeamTaskStatus (team/task-actions.ts).
 * 
 * **Edge Cases:**
 * - Validates employee role before delegation
 * - Handles reassignment with confirmation in UI
 * - Preserves delegation history in metadata
 * - Rollback on failure: deletes team_task if delegation insert fails
 * 
 * @param prevState - Previous action state (from useServerAction)
 * @param formData - Form data containing taskId, employeeId, and optional note
 * @returns ActionState with success message or error
 * 
 * @example
 * const formData = new FormData()
 * formData.set('taskId', task.id)
 * formData.set('employeeId', selectedEmployee.id)
 * formData.set('note', 'Please handle this urgently')
 * await reassignTaskToEmployee({}, formData)
 */
export async function reassignTaskToEmployee(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const validated = ReassignTaskSchema.safeParse({
      taskId: formData.get('taskId'),
      employeeId: formData.get('employeeId'),
      note: formData.get('note') || undefined,
    })

    if (!validated.success) {
      return { error: validated.error.errors[0].message }
    }

    const { taskId, employeeId, note } = validated.data

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Not authenticated' }
    }

    // Verify user is VENTURE_MANAGER or ADMIN
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', user.id)
      .single()

    if (!profile || !['VENTURE_MANAGER', 'ADMIN'].includes(profile.role)) {
      return { error: 'Unauthorized: Venture Manager role required' }
    }

    // Verify employee exists and has EMPLOYEE role
    const { data: employee } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('id', employeeId)
      .single()

    if (!employee || employee.role !== 'EMPLOYEE') {
      return { error: 'Invalid employee: Must have EMPLOYEE role' }
    }

    // Fetch the original task
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('id, title, description, priority, status, due_date, startup_id, domain_id, weekly_plan_id, assigned_to')
      .eq('id', taskId)
      .single()

    if (taskError || !task) {
      return { error: 'Task not found' }
    }

    // Fetch startup name for context
    const { data: startup } = await supabase
      .from('startups')
      .select('name')
      .eq('id', task.startup_id)
      .single()

    const startupName = startup?.name || 'Unknown Startup'

    // Check if task is already delegated
    const { data: existingDelegation } = await supabase
      .from('task_delegations')
      .select('id, team_task_id, delegated_to, profiles!task_delegations_delegated_to_fkey(full_name)')
      .eq('startup_task_id', taskId)
      .single()

    let teamTaskId: string
    let isReassignment = false
    let previousEmployeeName: string | null = null

    if (existingDelegation) {
      // Reassignment case
      isReassignment = true
      previousEmployeeName = (existingDelegation.profiles as any)?.full_name || 'Unknown'
      teamTaskId = existingDelegation.team_task_id

      // Update existing team_task
      const { error: updateError } = await supabase
        .from('team_tasks')
        .update({
          assigned_to: employeeId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', teamTaskId)

      if (updateError) {
        return { error: `Failed to update team task: ${updateError.message}` }
      }

      // Update delegation record
      const metadata = {
        note,
        reassigned_at: new Date().toISOString(),
        previous_employee: existingDelegation.delegated_to,
        previous_employee_name: previousEmployeeName,
      }

      const { error: delegationError } = await supabase
        .from('task_delegations')
        .update({
          delegated_to: employeeId,
          delegated_at: new Date().toISOString(),
          metadata,
        })
        .eq('id', existingDelegation.id)

      if (delegationError) {
        return { error: `Failed to update delegation: ${delegationError.message}` }
      }
    } else {
      // New delegation case
      const enrichedDescription = task.description
        ? `${task.description}\n\n---\nAssigned by ${profile.full_name} for ${startupName}${note ? `\nNote: ${note}` : ''}`
        : `Assigned by ${profile.full_name} for ${startupName}${note ? `\nNote: ${note}` : ''}`

      // Create team_tasks entry
      const { data: teamTask, error: teamTaskError } = await supabase
        .from('team_tasks')
        .insert({
          title: task.title,
          description: enrichedDescription,
          priority: task.priority,
          status: task.status,
          due_date: task.due_date,
          assigned_to: employeeId,
          created_by: user.id,
          source_task_id: taskId,
          startup_id: task.startup_id,
        })
        .select('id')
        .single()

      if (teamTaskError || !teamTask) {
        return { error: `Failed to create team task: ${teamTaskError?.message || 'unknown error'}` }
      }

      teamTaskId = teamTask.id

      // Create initial team_task_activities entry
      await supabase.from('team_task_activities').insert({
        task_id: teamTaskId,
        user_id: user.id,
        from_status: null,
        to_status: task.status,
      })

      // Create delegation record
      const metadata = {
        note,
        startup_name: startupName,
        original_assigned_to: task.assigned_to,
      }

      const { error: delegationError } = await supabase
        .from('task_delegations')
        .insert({
          startup_task_id: taskId,
          team_task_id: teamTaskId,
          delegated_by: user.id,
          delegated_to: employeeId,
          metadata,
        })

      if (delegationError) {
        // Rollback: delete team_task if delegation fails
        await supabase.from('team_tasks').delete().eq('id', teamTaskId)
        return { error: `Failed to create delegation: ${delegationError.message}` }
      }
    }

    // Log activity
    await logActivity({
      startupId: task.startup_id,
      action: isReassignment ? 'TASK_REASSIGNED_TO_EMPLOYEE' : 'TASK_DELEGATED_TO_EMPLOYEE',
      entityType: 'task',
      entityId: taskId,
      metadata: {
        task_title: task.title,
        employee_id: employeeId,
        employee_name: employee.full_name,
        team_task_id: teamTaskId,
        note,
        ...(isReassignment && { previous_employee_name: previousEmployeeName }),
      },
    })

    // Revalidate paths
    revalidatePath(`/venture-manager/startups/${task.startup_id}`)
    revalidatePath('/daily-sprint')
    revalidatePath('/venture-manager')

    const message = isReassignment
      ? `Task reassigned from ${previousEmployeeName} to ${employee.full_name}`
      : `Task successfully delegated to ${employee.full_name}`

    return {
      success: message,
      data: {
        teamTaskId,
        isReassignment,
        previousEmployeeName,
      },
    }
  } catch (err) {
    console.error('Unexpected error in reassignTaskToEmployee:', err)
    return { error: 'An unexpected error occurred' }
  }
}
