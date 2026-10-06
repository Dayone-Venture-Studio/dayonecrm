import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/types'
import type {
  NoteEntityType,
  NoteUrgency,
  VentureManagerNote,
  VentureManagerNoteWithProfile,
} from '@/types'

// NOTE: venture_manager_notes.created_by / resolved_by FK to auth.users(id),
// not profiles(id) — PostgREST cannot embed them. Fetch profiles separately.

/**
 * Fetches profiles by IDs and returns them as a Map for efficient lookup.
 * Used for hydrating note creator/resolver references.
 */
async function getProfilesByIds(ids: string[]): Promise<Map<string, Profile>> {
  if (ids.length === 0) return new Map()

  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, email, phone, role, created_at, updated_at')
    .in('id', ids)

  const profiles = (data || []) as Profile[]
  return new Map(profiles.map((p) => [p.id, p]))
}

/**
 * Enriches notes with creator and resolver profile information.
 * Batches profile fetches to minimize database queries.
 */
async function hydrateNotes(
  notes: VentureManagerNote[]
): Promise<VentureManagerNoteWithProfile[]> {
  if (notes.length === 0) return []

  const ids = new Set<string>()
  for (const note of notes) {
    if (note.created_by) ids.add(note.created_by)
    if (note.resolved_by) ids.add(note.resolved_by)
  }

  const profileMap = await getProfilesByIds(Array.from(ids))

  return notes.map((note) => ({
    ...note,
    creator: profileMap.get(note.created_by) ?? null,
    resolver: note.resolved_by ? profileMap.get(note.resolved_by) ?? null : null,
  }))
}

/**
 * Fetches notes for a specific entity
 */
export async function getNotesForEntity(
  entityType: NoteEntityType,
  entityId: string
): Promise<VentureManagerNoteWithProfile[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('venture_manager_notes')
    .select('*')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false })

  const notes = (data || []) as VentureManagerNote[]
  return await hydrateNotes(notes)
}

/**
 * Fetches only the count of notes for a specific entity (cheap, for tab labels)
 */
export async function getNotesCountForEntity(
  entityType: NoteEntityType,
  entityId: string
): Promise<number> {
  const supabase = await createClient()

  const { count } = await supabase
    .from('venture_manager_notes')
    .select('id', { count: 'exact', head: true })
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)

  return count ?? 0
}

/**
 * Fetches all active (unresolved) notes
 */
export async function getAllActiveNotes(): Promise<VentureManagerNoteWithProfile[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('venture_manager_notes')
    .select('*')
    .eq('resolved', false)
    .order('urgency', { ascending: false }) // CRITICAL first
    .order('created_at', { ascending: false })

  const notes = (data || []) as VentureManagerNote[]
  return await hydrateNotes(notes)
}

/**
 * Fetches all notes (with optional filters)
 */
export async function getAllNotes(filters?: {
  resolved?: boolean
  urgency?: NoteUrgency
  entityType?: NoteEntityType
}): Promise<VentureManagerNoteWithProfile[]> {
  const supabase = await createClient()

  let query = supabase.from('venture_manager_notes').select('*')

  if (filters?.resolved !== undefined) {
    query = query.eq('resolved', filters.resolved)
  }
  if (filters?.urgency) {
    query = query.eq('urgency', filters.urgency)
  }
  if (filters?.entityType) {
    query = query.eq('entity_type', filters.entityType)
  }

  const { data } = await query.order('created_at', { ascending: false })
  const notes = (data || []) as VentureManagerNote[]
  return await hydrateNotes(notes)
}
