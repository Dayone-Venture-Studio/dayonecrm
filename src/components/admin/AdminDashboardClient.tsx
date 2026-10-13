'use client'

import Link from 'next/link'
import { useDataLoaded } from '@/lib/providers/LoadingContext'
import { AdminStatCards, type AdminStatCard } from './AdminStatCards'
import { PortfolioHealthSection } from './PortfolioHealthSection'
import { ActiveStartupsCard } from './ActiveStartupsCard'
import { RecentActivityCard } from './RecentActivityCard'
import type { ActivityLog } from '@/types'
import type { StartupOverviewRow, PortfolioHealth } from '@/lib/startups/adminQueries'

interface Props {
  stats: {
    totalStartups: number
    activeStartups: number
    pendingRegistrations: number
    totalTasksThisWeek: number
    completedTasks: number
    overdueTasks: number
  }
  activity: ActivityLog[]
  startups: StartupOverviewRow[]
  portfolioHealth: PortfolioHealth
}

export function AdminDashboardClient({ stats, activity, startups, portfolioHealth }: Props) {
  // Signal that data is loaded and ready to display
  useDataLoaded()

  const statCards: AdminStatCard[] = [
    { label: 'Total Startups', value: stats.totalStartups, icon: '🏢', color: 'var(--color-brand)' },
    { label: 'Active Startups', value: stats.activeStartups, icon: '✅', color: 'var(--color-success)' },
    {
      label: 'Pending Reviews',
      value: stats.pendingRegistrations,
      icon: '⏳',
      color: stats.pendingRegistrations > 0 ? 'var(--color-warning)' : 'var(--color-text-muted)',
    },
    { label: 'Tasks This Week', value: stats.totalTasksThisWeek, icon: '📋', color: 'var(--color-info)' },
    { label: 'Completed Tasks', value: stats.completedTasks, icon: '🎯', color: 'var(--color-success)' },
    {
      label: 'Overdue Tasks',
      value: stats.overdueTasks,
      icon: '🔴',
      color: stats.overdueTasks > 0 ? 'var(--color-danger)' : 'var(--color-text-muted)',
    },
  ]

  return (
    <>
      {stats.pendingRegistrations > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <Link href="/admin/registrations" className="btn btn-primary">
            Review {stats.pendingRegistrations} Pending{' '}
            {stats.pendingRegistrations === 1 ? 'Application' : 'Applications'}
          </Link>
        </div>
      )}

      <AdminStatCards cards={statCards} />

      <PortfolioHealthSection
        cards={portfolioHealth.cards}
        avgHealth={portfolioHealth.avgHealth}
        atRiskCount={portfolioHealth.atRiskCount}
      />

      <div className="grid-2">
        <ActiveStartupsCard startups={startups} />
        <RecentActivityCard activity={activity} />
      </div>
    </>
  )
}
