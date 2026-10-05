import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth/getSession'
import { getMembershipForUser } from '@/lib/startups/queries'
import { TasksClient } from '@/components/tasks/TasksClient'
import { PageHeader } from '@/components/layout/PageHeader'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Tasks' }

export default async function FounderTasksPage() {
  const session = await getSession()
  const supabase = await createClient()

  const membership = await getMembershipForUser(session!.id, 'FOUNDER')
  const startupId = membership?.startup_id
  if (!startupId) return <div>Startup not found</div>

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

  return (
    <div>
      <PageHeader title="All Tasks" subtitle={`${tasks?.length || 0} tasks total`} />
      <TasksClient
        startupId={startupId}
        tasks={tasks || []}
        domains={domains || []}
        weeklyPlans={weeklyPlans || []}
        staffMembers={staff as any || []}
        isFounder={true}
      />
    </div>
  )
}
