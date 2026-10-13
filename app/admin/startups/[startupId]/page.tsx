import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import {
  getStartupById,
  getMembersForStartup,
  getDomainsForStartup,
  getWeeklyPlansForStartup,
  getTasksForStartup,
} from '@/lib/startups/queries'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { DetailSkeleton } from '@/components/layout/LoadingStates'
import { StartupDetailClient } from '@/components/admin/StartupDetailClient'

export const metadata: Metadata = { title: 'Startup Detail' }

interface Props {
  params: Promise<{ startupId: string }>
}

export default function StartupDetailPage({ params }: Props) {
  return (
    <div>
      <div className="page-header">
        <Link
          href="/admin/startups"
          style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: 13 }}
        >
          ← Startups
        </Link>
      </div>

      <Suspense fallback={<DetailSkeleton />}>
        <StartupDetailContent params={params} />
      </Suspense>
    </div>
  )
}

async function StartupDetailContent({ params }: Props) {
  const { startupId } = await params
  const supabase = await createClient()

  // Fetch startup + members + domains + current week + tasks + activity
  const [startup, members, domains, weeklyPlans, recentTasks, { data: activity }] =
    await Promise.all([
      getStartupById(startupId),
      getMembersForStartup(startupId),
      getDomainsForStartup(startupId),
      getWeeklyPlansForStartup(startupId, { orderBy: 'week_start', ascending: false, limit: 4 }),
      getTasksForStartup(startupId, { orderBy: 'created_at', ascending: false, limit: 10 }),
      supabase
        .from('activity_logs')
        .select('*')
        .eq('startup_id', startupId)
        .order('created_at', { ascending: false })
        .limit(10),
    ])

  if (!startup) notFound()

  const founder = members.find((m) => m.role === 'FOUNDER')
  const staff = members.filter((m) => m.role === 'STAFF')
  const currentPlan = weeklyPlans[0]
  const currentPlanTasks = recentTasks.filter(
    (t) => t.weekly_plan_id === currentPlan?.id
  )

  return (
    <StartupDetailClient
      startup={startup}
      founder={founder}
      staff={staff}
      currentPlan={currentPlan}
      currentPlanTasks={currentPlanTasks}
      domains={domains}
      activity={activity || []}
    />
  )
}
