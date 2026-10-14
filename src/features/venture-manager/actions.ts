'use server'

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
