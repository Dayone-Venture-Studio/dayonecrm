import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/types'
import type {
  NoteEntityType,
  NoteUrgency,
  VentureManagerNote,
  VentureManagerNoteWithContext,
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
    if (note.acknowledged_by) ids.add(note.acknowledged_by)
  }

  const profileMap = await getProfilesByIds(Array.from(ids))

  return notes.map((note) => ({
    ...note,
    creator: profileMap.get(note.created_by) ?? null,
    resolver: note.resolved_by ? profileMap.get(note.resolved_by) ?? null : null,
    acknowledger: note.acknowledged_by ? profileMap.get(note.acknowledged_by) ?? null : null,
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
 * Fetches all notes related to a startup, including:
 * - Notes directly on the startup
 * - Notes on tasks belonging to the startup
 * - Notes on weekly plans belonging to the startup
 */
export async function getNotesForStartup(
  startupId: string
): Promise<VentureManagerNoteWithContext[]> {
  const supabase = await createClient()

  // Get all task IDs for this startup
  const { data: tasks } = await supabase
    .from('tasks')
    .select('id')
    .eq('startup_id', startupId)
  
  const taskIds = (tasks || []).map((t: { id: string }) => t.id)

  // Get all weekly plan IDs for this startup
  const { data: weeklyPlans } = await supabase
    .from('weekly_plans')
    .select('id')
    .eq('startup_id', startupId)
  
  const weeklyPlanIds = (weeklyPlans || []).map((w: { id: string }) => w.id)

  // Build query for all related notes
  const { data } = await supabase
    .from('venture_manager_notes')
    .select('*')
    .or(
      `and(entity_type.eq.STARTUP,entity_id.eq.${startupId}),` +
      (taskIds.length > 0 ? `and(entity_type.eq.TASK,entity_id.in.(${taskIds.join(',')})),` : '') +
      (weeklyPlanIds.length > 0 ? `and(entity_type.eq.WEEKLY_PLAN,entity_id.in.(${weeklyPlanIds.join(',')}))` : '')
    )
    .order('created_at', { ascending: false })

  const notes = (data || []) as VentureManagerNote[]
  const hydratedNotes = await hydrateNotes(notes)

  // Enrich with context (startup name, entity label)
  if (hydratedNotes.length === 0) return []

  // Get startup name
  const { data: startup } = await supabase
    .from('startups')
    .select('name')
    .eq('id', startupId)
    .single()

  const startupName = startup?.name || null

  // Get task titles
  const taskTitles = new Map<string, string>()
  if (taskIds.length > 0) {
    const { data: taskData } = await supabase
      .from('tasks')
      .select('id, title')
      .in('id', taskIds)
    for (const t of (taskData || []) as { id: string; title: string }[]) {
      taskTitles.set(t.id, t.title)
    }
  }

  // Get weekly plan titles
  const weeklyPlanTitles = new Map<string, string>()
  if (weeklyPlanIds.length > 0) {
    const { data: wpData } = await supabase
      .from('weekly_plans')
      .select('id, title, week_start')
      .in('id', weeklyPlanIds)
    for (const w of (wpData || []) as { id: string; title: string | null; week_start: string }[]) {
      weeklyPlanTitles.set(
        w.id,
        w.title || `Week of ${new Date(w.week_start).toLocaleDateString()}`
      )
    }
  }

  // Map to context
  return hydratedNotes.map((note) => ({
    ...note,
    startup_id: startupId,
    startup_name: startupName,
    entity_label:
      note.entity_type === 'STARTUP'
        ? 'Startup note'
        : note.entity_type === 'TASK'
        ? taskTitles.get(note.entity_id) || null
        : weeklyPlanTitles.get(note.entity_id) || null,
  }))
}

/**
 * Fetches the count of all notes related to a startup (including task and weekly plan notes)
 */
export async function getNotesCountForStartup(startupId: string): Promise<number> {
  const supabase = await createClient()

  // Get all task IDs for this startup
  const { data: tasks } = await supabase
    .from('tasks')
    .select('id')
    .eq('startup_id', startupId)
  
  const taskIds = (tasks || []).map((t: { id: string }) => t.id)

  // Get all weekly plan IDs for this startup
  const { data: weeklyPlans } = await supabase
    .from('weekly_plans')
    .select('id')
    .eq('startup_id', startupId)
  
  const weeklyPlanIds = (weeklyPlans || []).map((w: { id: string }) => w.id)

  // Count all related notes
  const { count } = await supabase
    .from('venture_manager_notes')
    .select('id', { count: 'exact', head: true })
    .or(
      `and(entity_type.eq.STARTUP,entity_id.eq.${startupId}),` +
      (taskIds.length > 0 ? `and(entity_type.eq.TASK,entity_id.in.(${taskIds.join(',')})),` : '') +
      (weeklyPlanIds.length > 0 ? `and(entity_type.eq.WEEKLY_PLAN,entity_id.in.(${weeklyPlanIds.join(',')}))` : '')
    )

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

/**
 * Fetches all notes enriched with both the note author/resolver profiles AND the
 * startup each note belongs to (notes only store entity_type + entity_id).
 *
 * entity_id resolution:
 *   STARTUP       -> startups.id
 *   TASK          -> tasks.id          -> tasks.startup_id
 *   WEEKLY_PLAN   -> weekly_plans.id   -> weekly_plans.startup_id
 */
export async function getAllNotesWithContext(filters?: {
  resolved?: boolean
  urgency?: NoteUrgency
  entityType?: NoteEntityType
}): Promise<VentureManagerNoteWithContext[]> {
  const notes = await getAllNotes(filters)
  if (notes.length === 0) return []

  const supabase = await createClient()

  const startupEntityIds = new Set<string>()
  const taskEntityIds = new Set<string>()
  const weekPlanEntityIds = new Set<string>()

  for (const note of notes) {
    if (note.entity_type === 'STARTUP') startupEntityIds.add(note.entity_id)
    else if (note.entity_type === 'TASK') taskEntityIds.add(note.entity_id)
    else if (note.entity_type === 'WEEKLY_PLAN') weekPlanEntityIds.add(note.entity_id)
  }

  // entity_id -> resolved context (startup id + human label for the note's subject)
  const context = new Map<string, { startup_id: string | null; entity_label: string | null }>()

  // STARTUP notes: entity_id IS the startup
  if (startupEntityIds.size > 0) {
    const { data } = await supabase
      .from('startups')
      .select('id, name')
      .in('id', Array.from(startupEntityIds))
    for (const s of (data || []) as { id: string; name: string }[]) {
      context.set(s.id, { startup_id: s.id, entity_label: 'Startup note' })
    }
  }

  // TASK notes: entity_id -> task -> its startup
  if (taskEntityIds.size > 0) {
    const { data } = await supabase
      .from('tasks')
      .select('id, startup_id, title')
      .in('id', Array.from(taskEntityIds))
    for (const t of (data || []) as { id: string; startup_id: string; title: string }[]) {
      context.set(t.id, { startup_id: t.startup_id, entity_label: t.title })
    }
  }

  // WEEKLY_PLAN notes: entity_id -> weekly plan -> its startup
  if (weekPlanEntityIds.size > 0) {
    const { data } = await supabase
      .from('weekly_plans')
      .select('id, startup_id, week_start, title')
      .in('id', Array.from(weekPlanEntityIds))
    for (const w of (data || []) as {
      id: string
      startup_id: string
      week_start: string
      title: string | null
    }[]) {
      context.set(w.id, {
        startup_id: w.startup_id,
        entity_label: w.title || `Week of ${new Date(w.week_start).toLocaleDateString()}`,
      })
    }
  }

  // Resolve startup names for every referenced startup
  const startupIds = new Set<string>()
  for (const c of context.values()) {
    if (c.startup_id) startupIds.add(c.startup_id)
  }

  const startupNames = new Map<string, string>()
  if (startupIds.size > 0) {
    const { data } = await supabase
      .from('startups')
      .select('id, name')
      .in('id', Array.from(startupIds))
    for (const s of (data || []) as { id: string; name: string }[]) {
      startupNames.set(s.id, s.name)
    }
  }

  return notes.map((note) => {
    const resolved = context.get(note.entity_id) ?? null
    const startupId = resolved?.startup_id ?? null
    return {
      ...note,
      startup_id: startupId,
      startup_name: startupId ? startupNames.get(startupId) ?? null : null,
      entity_label: resolved?.entity_label ?? null,
    }
  })
}

/**
 * Fetches all VM notes visible to a founder for their startup
 * Shows all notes (resolved and unresolved) related to the founder's startup
 */
export async function getNotesForFounder(
  startupId: string
): Promise<VentureManagerNoteWithContext[]> {
  const supabase = await createClient()

  // Get all task IDs for this startup
  const { data: tasks } = await supabase
    .from('tasks')
    .select('id')
    .eq('startup_id', startupId)
  
  const taskIds = (tasks || []).map((t: { id: string }) => t.id)

  // Get all weekly plan IDs for this startup
  const { data: weeklyPlans } = await supabase
    .from('weekly_plans')
    .select('id')
    .eq('startup_id', startupId)
  
  const weeklyPlanIds = (weeklyPlans || []).map((w: { id: string }) => w.id)

  // Build query for all related notes
  const { data } = await supabase
    .from('venture_manager_notes')
    .select('*')
    .or(
      `and(entity_type.eq.STARTUP,entity_id.eq.${startupId}),` +
      (taskIds.length > 0 ? `and(entity_type.eq.TASK,entity_id.in.(${taskIds.join(',')})),` : '') +
      (weeklyPlanIds.length > 0 ? `and(entity_type.eq.WEEKLY_PLAN,entity_id.in.(${weeklyPlanIds.join(',')}))` : '')
    )
    .order('acknowledged', { ascending: true }) // Unacknowledged first
    .order('created_at', { ascending: false })

  const notes = (data || []) as VentureManagerNote[]
  const hydratedNotes = await hydrateNotes(notes)

  // Enrich with context
  if (hydratedNotes.length === 0) return []

  // Get startup name
  const { data: startup } = await supabase
    .from('startups')
    .select('name')
    .eq('id', startupId)
    .single()

  const startupName = startup?.name || null

  // Get task titles
  const taskTitles = new Map<string, string>()
  if (taskIds.length > 0) {
    const { data: taskData } = await supabase
      .from('tasks')
      .select('id, title')
      .in('id', taskIds)
    for (const t of (taskData || []) as { id: string; title: string }[]) {
      taskTitles.set(t.id, t.title)
    }
  }

  // Get weekly plan titles
  const weeklyPlanTitles = new Map<string, string>()
  if (weeklyPlanIds.length > 0) {
    const { data: wpData } = await supabase
      .from('weekly_plans')
      .select('id, title, week_start')
      .in('id', weeklyPlanIds)
    for (const w of (wpData || []) as { id: string; title: string | null; week_start: string }[]) {
      weeklyPlanTitles.set(
        w.id,
        w.title || `Week of ${new Date(w.week_start).toLocaleDateString()}`
      )
    }
  }

  // Map to context
  return hydratedNotes.map((note) => ({
    ...note,
    startup_id: startupId,
    startup_name: startupName,
    entity_label:
      note.entity_type === 'STARTUP'
        ? 'Startup note'
        : note.entity_type === 'TASK'
        ? taskTitles.get(note.entity_id) || null
        : weeklyPlanTitles.get(note.entity_id) || null,
  }))
}

/**
 * Get count of unacknowledged notes for a founder's startup
 */
export async function getUnacknowledgedNotesCountForFounder(startupId: string): Promise<number> {
  const supabase = await createClient()

  // Get all task IDs for this startup
  const { data: tasks } = await supabase
    .from('tasks')
    .select('id')
    .eq('startup_id', startupId)
  
  const taskIds = (tasks || []).map((t: { id: string }) => t.id)

  // Get all weekly plan IDs for this startup
  const { data: weeklyPlans } = await supabase
    .from('weekly_plans')
    .select('id')
    .eq('startup_id', startupId)
  
  const weeklyPlanIds = (weeklyPlans || []).map((w: { id: string }) => w.id)

  // Count unacknowledged notes
  const { count } = await supabase
    .from('venture_manager_notes')
    .select('id', { count: 'exact', head: true })
    .eq('acknowledged', false)
    .or(
      `and(entity_type.eq.STARTUP,entity_id.eq.${startupId}),` +
      (taskIds.length > 0 ? `and(entity_type.eq.TASK,entity_id.in.(${taskIds.join(',')})),` : '') +
      (weeklyPlanIds.length > 0 ? `and(entity_type.eq.WEEKLY_PLAN,entity_id.in.(${weeklyPlanIds.join(',')}))` : '')
    )

  return count ?? 0
}


// ─── Task Delegation Queries ──────────────────────────────────

/**
 * Gets delegation information for a specific startup task.
 * 
 * Returns the delegation record with populated employee and delegator profiles.
 * Used by the VM Kanban to display delegation status and in the TaskDetailModal.
 * 
 * @param taskId - UUID of the startup task
 * @returns Delegation record with profiles, or null if task is not delegated
 * 
 * @example
 * const delegation = await getTaskDelegation(task.id)
 * if (delegation) {
 *   console.log(`Delegated to ${delegation.employee.full_name}`)
 * }
 */
export async function getTaskDelegation(taskId: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('task_delegations')
    .select(`
      id,
      startup_task_id,
      team_task_id,
      delegated_by,
      delegated_to,
      delegated_at,
      metadata,
      employee:profiles!task_delegations_delegated_to_fkey(id, full_name, email, role),
      delegator:profiles!task_delegations_delegated_by_fkey(id, full_name, email, role)
    `)
    .eq('startup_task_id', taskId)
    .single()

  return data ?? null
}

/**
 * Checks if a task is delegated (boolean check, faster than full fetch).
 * 
 * Useful for conditional rendering when you don't need the full delegation data.
 * 
 * @param taskId - UUID of the startup task
 * @returns true if task is delegated, false otherwise
 */
export async function isTaskDelegated(taskId: string): Promise<boolean> {
  const supabase = await createClient()

  const { count } = await supabase
    .from('task_delegations')
    .select('id', { count: 'exact', head: true })
    .eq('startup_task_id', taskId)

  return (count ?? 0) > 0
}

/**
 * Gets all tasks delegated to a specific employee.
 * 
 * Returns team_tasks entries with source task and startup context.
 * Used by the employee's daily sprint board to show delegated startup tasks
 * with special styling and context.
 * 
 * **Note:** The main daily sprint query (getMyTeamTasks) already includes this
 * data via the extended TASK_COLUMNS. This function is for specific use cases.
 * 
 * @param employeeId - UUID of the employee (EMPLOYEE role)
 * @returns Array of team tasks with delegation context
 */
export async function getDelegatedTasksForEmployee(employeeId: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('team_tasks')
    .select(`
      *,
      startup:startups(id, name, logo_url),
      source_task:tasks(id, title, description, startup_id, domain_id),
      delegation:task_delegations!task_delegations_team_task_id_fkey(
        id,
        delegated_by,
        delegated_at,
        metadata,
        delegator:profiles!task_delegations_delegated_by_fkey(id, full_name, role)
      )
    `)
    .eq('assigned_to', employeeId)
    .not('source_task_id', 'is', null)
    .order('created_at', { ascending: false })

  return data ?? []
}
