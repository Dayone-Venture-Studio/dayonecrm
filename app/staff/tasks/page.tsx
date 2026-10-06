import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth/getSession'
import { getMembershipForUser } from '@/lib/startups/queries'
import { TasksClient } from '@/components/tasks/TasksClient'
import { PageHeader } from '@/components/layout/PageHeader'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'My Tasks' }

export default async function StaffTasksPage() {
  const session = await getSession()
  const supabase = await createClient()

  const membership = await getMembershipForUser(session!.id, 'STAFF')
  const startupId = membership?.startup_id
  if (!startupId) return <div>Startup not found</div>

  const today = new Date().toISOString().split('T')[0]

  const [{ data: tasks }, { data: domains }, { data: weeklyPlans }, { data: staffMembers }] =
    await Promise.all([
      supabase
        .from('tasks')
        .select('*')
        .or(`assigned_to.eq.${session!.id},created_by.eq.${session!.id}`)
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
        .eq('startup_id', startupId),
    ])

  const currentPlan = weeklyPlans?.find((p) => p.week_start <= today && p.week_end >= today) || weeklyPlans?.[0]

  return (
    <div>
      <PageHeader title="My Tasks" subtitle={`${tasks?.length || 0} tasks assigned to you`} />
      <TasksClient
        startupId={startupId}
        tasks={tasks || []}
        domains={domains || []}
        weeklyPlans={weeklyPlans || []}
        staffMembers={(staffMembers as any) || []}
        isFounder={false}
        isStaff={true}
        currentUserId={session!.id}
        currentPlanId={currentPlan?.id}
      />
    </div>
  )
}
