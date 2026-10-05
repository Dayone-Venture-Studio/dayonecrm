import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type {
  NoteEntityType,
  NoteUrgency,
  VentureManagerNoteWithProfile,
} from '@/types'

const NOTE_SELECT_FULL = `
  *,
  creator:created_by(id, full_name, email),
  resolver:resolved_by(id, full_name, email)
`

const NOTE_SELECT_CREATOR = `
  *,
  creator:created_by(id, full_name, email)
`

/**
 * Fetches notes for a specific entity
 */
export async function getNotesForEntity(
  entityType: NoteEntityType,
  entityId: string
): Promise<VentureManagerNoteWithProfile[]> {
  try {
    const supabase = await createClient()

    const { data: notes } = await supabase
      .from('venture_manager_notes')
      .select(NOTE_SELECT_FULL)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false })

    return (notes || []) as unknown as VentureManagerNoteWithProfile[]
  } catch (err) {
    console.error('Error fetching notes:', err)
    return []
  }
}

/**
 * Fetches all active (unresolved) notes
 */
export async function getAllActiveNotes(): Promise<VentureManagerNoteWithProfile[]> {
  try {
    const supabase = await createClient()

    const { data: notes } = await supabase
      .from('venture_manager_notes')
      .select(NOTE_SELECT_CREATOR)
      .eq('resolved', false)
      .order('urgency', { ascending: false }) // CRITICAL first
      .order('created_at', { ascending: false })

    return (notes || []) as unknown as VentureManagerNoteWithProfile[]
  } catch (err) {
    console.error('Error fetching active notes:', err)
    return []
  }
}

/**
 * Fetches all notes (with optional filters)
 */
export async function getAllNotes(filters?: {
  resolved?: boolean
  urgency?: NoteUrgency
  entityType?: NoteEntityType
}): Promise<VentureManagerNoteWithProfile[]> {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('venture_manager_notes')
      .select(NOTE_SELECT_FULL)

    if (filters?.resolved !== undefined) {
      query = query.eq('resolved', filters.resolved)
    }
    if (filters?.urgency) {
      query = query.eq('urgency', filters.urgency)
    }
    if (filters?.entityType) {
      query = query.eq('entity_type', filters.entityType)
    }

    const { data: notes } = await query.order('created_at', { ascending: false })

    return (notes || []) as unknown as VentureManagerNoteWithProfile[]
  } catch (err) {
    console.error('Error fetching notes:', err)
    return []
  }
}