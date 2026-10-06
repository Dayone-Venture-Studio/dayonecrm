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
    <div style={{ padding: '24px 32px', maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Back Navigation */}
      <Link
        href="/venture-manager"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          color: 'var(--color-brand)', fontSize: 14, fontWeight: 600, textDecoration: 'none',
          marginBottom: -8,
        }}
      >
        <ArrowLeft size={16} />
        Back to Portfolio
      </Link>

      {/* Startup Header */}
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 16, padding: '24px 32px',
        display: 'flex', alignItems: 'center', gap: 20,
        boxShadow: 'var(--shadow-sm)',
      }}>
        <CompanyLogo logoUrl={startup.logo_url} name={startup.name} size="lg" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-text-primary)', margin: 0, letterSpacing: '-0.5px' }}>
              {startup.name}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 999,
                color: health.status === 'Optimal' ? '#059669' : health.status === 'On Track' ? '#0284c7' : health.status === 'Attention' ? '#d97706' : '#ca2f2b',
                background: health.status === 'Optimal' ? 'rgba(5,150,105,0.1)' : health.status === 'On Track' ? 'rgba(2,132,199,0.1)' : health.status === 'Attention' ? 'rgba(217,119,6,0.1)' : 'rgba(202,47,43,0.1)',
                border: `1px solid ${health.status === 'Optimal' ? 'rgba(5,150,105,0.2)' : health.status === 'On Track' ? 'rgba(2,132,199,0.2)' : health.status === 'Attention' ? 'rgba(217,119,6,0.2)' : 'rgba(202,47,43,0.2)'}`
              }}>
                {health.status}
              </span>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-muted)' }}>
                Health Score: <span style={{ color: 'var(--color-text-primary)' }}>{health.score}/100</span>
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32, marginTop: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</span>
              <span style={{ fontSize: 14, color: 'var(--color-text-primary)', fontWeight: 500 }}>{startup.email}</span>
            </div>
            {startup.phone && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone</span>
                <span style={{ fontSize: 14, color: 'var(--color-text-primary)', fontWeight: 500 }}>{startup.phone}</span>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ height: 24, width: 180, borderRadius: 8, background: 'var(--color-surface-2)' }} />
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ height: 96, borderRadius: 10, background: 'var(--color-surface-2)' }} />
      ))}
    </div>
  )
}
