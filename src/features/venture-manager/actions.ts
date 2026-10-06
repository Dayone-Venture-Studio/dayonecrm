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
 * Deletes a note (admin only)
 */
export async function deleteNote(noteId: string): Promise<ActionState> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Not authenticated' }
    }

    // Only admins can delete notes
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'ADMIN') {
      return { error: 'Unauthorized: Admin role required' }
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
