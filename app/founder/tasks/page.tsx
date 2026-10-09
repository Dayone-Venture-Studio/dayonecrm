import { Suspense, cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth/getSession'
import { getMembershipForUser } from '@/lib/startups/queries'
import { TasksClient } from '@/components/tasks/TasksClient'
import { PageHeader } from '@/components/layout/PageHeader'
import { TableSkeleton, TextSkeleton } from '@/components/layout/LoadingStates'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Tasks' }

const getFounderTasksData = cache(async () => {
  const session = await getSession()
  const supabase = await createClient()

  const membership = await getMembershipForUser(session!.id, 'FOUNDER')
  const startupId = membership?.startup_id
  if (!startupId) return null

  const [{ data: tasks }, { data: domains }, { data: weeklyPlans }, { data: staff }] =
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
        .select('user_id, role, profile:profiles(id, full_name, email)')
        .eq('startup_id', startupId)
        .order('created_at', { ascending: true }),
    ])

  return {
    startupId,
    tasks: tasks || [],
    domains: domains || [],
    weeklyPlans: weeklyPlans || [],
    staffMembers: (staff as any) || [],
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
  if (!data) return <div>Startup not found</div>

  return (
    <TasksClient
      startupId={data.startupId}
      tasks={data.tasks}
      domains={data.domains}
      weeklyPlans={data.weeklyPlans}
      staffMembers={data.staffMembers}
      isFounder={true}
    />
  )
}
