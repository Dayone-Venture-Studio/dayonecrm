import { Suspense } from 'react'
import { requireVentureManager } from '@/lib/auth/requireRole'
import {
  getStartupById,
  getStartupNameById,
  getMembersForStartup,
  getDomainsForStartup,
  getWeeklyPlansForStartup,
  getTasksForStartup,
  getProfileNameMap,
} from '@/lib/startups/queries'
import { getStartupTrendData } from '@/lib/venture-manager/portfolioAnalytics'
import { getNotesForEntity, getNotesCountForEntity } from '@/lib/venture-manager/queries'
import { calculateStartupHealth } from '@/lib/performance/calculateStartupHealth'
import { CompanyLogo } from '@/components/brand/CompanyLogo'
import { StartupDetailClient } from '@/components/venture-manager/StartupDetailClient'
import { NotesTab } from '@/components/venture-manager/NotesTab'
import { TrendCharts } from '@/components/venture-manager/TrendCharts'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Startup, Task, Domain, StartupMember, Profile } from '@/types'

const TAB_TYPES = ['overview', 'tasks', 'notes', 'trends'] as const
type TabType = (typeof TAB_TYPES)[number]

const HEALTH_BADGE_CLASS = {
  Optimal: 'badge badge-success',
  'On Track': 'badge badge-info',
  Attention: 'badge badge-warning',
  'At Risk': 'badge badge-danger',
} as const

interface Props {
  params: Promise<{ startupId: string }>
  searchParams: Promise<{ tab?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { startupId } = await params
  const name = await getStartupNameById(startupId)

  return {
    title: name ? `${name} - Venture Manager` : 'Startup Details',
  }
}

function resolveTab(raw: string | undefined): TabType {
  return TAB_TYPES.includes(raw as TabType) ? (raw as TabType) : 'overview'
}

interface TabSectionProps {
  tab: TabType
  startupId: string
  startupName: string
}

async function TabSection({ tab, startupId, startupName }: TabSectionProps) {
  if (tab === 'notes') {
    const notes = await getNotesForEntity('STARTUP', startupId)
    return <NotesTab notes={notes} startupId={startupId} startupName={startupName} />
  }

  if (tab === 'trends') {
    const trendData = await getStartupTrendData(startupId, 8)
    return <TrendCharts trendData={trendData} />
  }

  return null
}

export default async function StartupDetailPage({ params, searchParams }: Props) {
  await requireVentureManager()
  const { startupId } = await params
  const { tab: rawTab } = await searchParams
  const activeTab = resolveTab(rawTab)

  // Eager data: header, health, counts, overview + tasks tabs
  const [startup, tasks, domains, members, weeklyPlans, profileMap, noteCount] = await Promise.all([
    getStartupById(startupId),
    getTasksForStartup(startupId),
    getDomainsForStartup(startupId),
    getMembersForStartup(startupId, { profileColumns: 'id, full_name, email, role' }),
    getWeeklyPlansForStartup(startupId, { orderBy: 'week_start', ascending: false, limit: 1 }),
    getProfileNameMap(),
    getNotesCountForEntity('STARTUP', startupId),
  ])

  if (!startup) {
    notFound()
  }

  // Calculate health
  const health = calculateStartupHealth(tasks as Task[], domains as Domain[], profileMap)

  // Get team members
  const teamMembers = (members || []) as (StartupMember & { profile: Profile })[]
  const founder = teamMembers.find((m) => m.role === 'FOUNDER')
  const staff = teamMembers.filter((m) => m.role === 'STAFF')

  return (
    <div className="flex flex-col gap-6 mx-auto w-full max-w-[1200px] px-8 py-6">
      {/* Back Navigation */}
      <Link
        href="/venture-manager"
        className="inline-flex items-center gap-1.5 text-brand text-sm font-semibold no-underline -mb-2"
      >
        <ArrowLeft size={16} />
        Back to Portfolio
      </Link>

      {/* Startup Header */}
      <div className="card flex items-center gap-5">
        <CompanyLogo logoUrl={startup.logo_url} name={startup.name} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-4">
            <h1 className="m-0 text-[28px] font-extrabold tracking-[-0.5px] text-text-primary">
              {startup.name}
            </h1>
            <div className="flex items-center gap-2">
              <span className={HEALTH_BADGE_CLASS[health.status]}>
                {health.status}
              </span>
              <span className="text-[13px] font-semibold text-text-muted">
                Health Score: <span className="text-text-primary">{health.score}/100</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-8 mt-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.5px] text-text-muted">Email</span>
              <span className="text-sm font-medium text-text-primary">{startup.email}</span>
            </div>
            {startup.phone && (
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-semibold uppercase tracking-[0.5px] text-text-muted">Phone</span>
                <span className="text-sm font-medium text-text-primary">{startup.phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Client-side Interactive Content; notes/trends data streams in */}
      <StartupDetailClient
        startup={startup as Startup}
        health={health}
        tasks={(tasks || []) as Task[]}
        domains={(domains || []) as Domain[]}
        founder={founder?.profile || null}
        staff={staff.map((s) => s.profile)}
        currentWeeklyPlan={weeklyPlans?.[0] || null}
        activeTab={activeTab}
        noteCount={noteCount}
      >
        <Suspense key={activeTab} fallback={<TabSkeleton />}>
          <TabSection tab={activeTab} startupId={startupId} startupName={startup.name} />
        </Suspense>
      </StartupDetailClient>
    </div>
  )
}

function TabSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="skeleton h-6 w-[180px]" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="skeleton h-24 w-full" />
      ))}
    </div>
  )
}
