import { Suspense, cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { getSession } from '@/lib/auth/getSession'
import { getMembershipForUser } from '@/lib/startups/queries'
import { TasksClient } from '@/components/tasks/TasksClient'
import { PageHeader } from '@/components/layout/PageHeader'
import { TableSkeleton, TextSkeleton } from '@/components/layout/LoadingStates'
import { DataLoadedSignal } from '@/components/layout/DataLoadedSignal'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Tasks' }

const getFounderTasksData = cache(async () => {
  const session = await getSession()
  const supabase = await createClient()

  const membership = await getMembershipForUser(session!.id, 'FOUNDER')
  const startupId = membership?.startup_id
  if (!startupId) return null

  const [{ data: tasks }, { data: domains }, { data: weeklyPlans }, { data: members }] =
    await Promise.all([
      supabase
        .from('tasks')
        .select('*')
        .eq('startup_id', startupId)
        .order('created_at', { ascending: false }),
      supabase.from('domains').select('*').eq('startup_id', startupId),
      supabase
        .from('weekly_plans')
        .select('id, week_start, week_end, title, goal')
        .eq('startup_id', startupId)
        .order('week_start', { ascending: false }),
      supabase
        .from('startup_members')
        .select('user_id, role')
        .eq('startup_id', startupId)
        .order('created_at', { ascending: true }),
    ])

  const typedMembers = (members ?? []) as Array<{ user_id: string; role: string }>
  const memberIds = typedMembers.map((m) => m.user_id)
  let profilesById = new Map<string, { id: string; full_name: string; email: string | null }>()
  if (memberIds.length > 0) {
    const adminClient = getAdminClient()
    const { data: profiles } = await adminClient
      .from('profiles')
      .select('id, full_name, email')
      .in('id', memberIds)
    const typedProfiles = (profiles ?? []) as Array<{ id: string; full_name: string; email: string | null }>
    profilesById = new Map(typedProfiles.map((p) => [p.id, p]))
  }

  const staffMembers = typedMembers.map((m) => ({
    user_id: m.user_id,
    role: m.role,
    profile: profilesById.get(m.user_id) ?? null,
  }))

  // Also allow assigning tasks to venture managers.
  const { data: vmProfiles } = await getAdminClient()
    .from('profiles')
    .select('id, full_name, email')
    .eq('role', 'VENTURE_MANAGER')

  const vmMembers = ((vmProfiles ?? []) as Array<{ id: string; full_name: string; email: string | null }>).map(
    (p) => ({
      user_id: p.id,
      role: 'VENTURE_MANAGER',
      profile: p,
    })
  )

  staffMembers.push(...vmMembers)

  // Fetch delegation data for all tasks
  const taskIds = (tasks || []).map((t: any) => t.id)
  let delegationsData: any = null
  
  if (taskIds.length > 0) {
    const adminClient = getAdminClient()
    delegationsData = await adminClient
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
        team_task:team_tasks!task_delegations_team_task_id_fkey(status)
      `)
      .in('startup_task_id', taskIds)
  }

  // Create a map of task_id -> delegation
  const delegationMap = new Map()
  if (delegationsData?.data) {
    for (const delegation of delegationsData.data) {
      delegationMap.set(delegation.startup_task_id, delegation)
    }
  }

  return {
    startupId,
    tasks: tasks || [],
    domains: domains || [],
    weeklyPlans: weeklyPlans || [],
    staffMembers,
    delegationMap,
  }
})

export default function FounderTasksPage() {
  return (
    <div>
      <PageHeader
        title="All Tasks"
        subtitle={
          <Suspense fallback={<TextSkeleton width={90} />}>
            <TasksSubtitle />
          </Suspense>
        }
      />

      <Suspense fallback={<TableSkeleton rows={8} />}>
        <FounderTasksContent />
      </Suspense>
    </div>
  )
}

async function TasksSubtitle() {
  const data = await getFounderTasksData()
  if (!data) return null
  return <>{data.tasks.length} tasks total</>
}

async function FounderTasksContent() {
  const data = await getFounderTasksData()
  if (!data)
    return (
      <>
        <DataLoadedSignal />
        <div>Startup not found</div>
      </>
    )

  return (
    <>
      <DataLoadedSignal />
      <TasksClient
        startupId={data.startupId}
        tasks={data.tasks}
        domains={data.domains}
        weeklyPlans={data.weeklyPlans}
        staffMembers={data.staffMembers}
        isFounder={true}
        delegationMap={data.delegationMap}
      />
    </>
  )
}
