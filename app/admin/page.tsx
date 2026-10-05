import Link from 'next/link'
import type { Metadata } from 'next'
import { PageHeader } from '@/components/layout/PageHeader'
import { AdminStatCards } from '@/components/admin/AdminStatCards'
import { PortfolioHealthSection } from '@/components/admin/PortfolioHealthSection'
import { ActiveStartupsCard } from '@/components/admin/ActiveStartupsCard'
import { RecentActivityCard } from '@/components/admin/RecentActivityCard'
import {
  getAdminStats,
  getPortfolioHealth,
  getStartupsOverview,
} from '@/lib/startups/adminQueries'
import { getGlobalActivity } from '@/lib/activity/queries'

export const metadata: Metadata = { title: 'Admin Dashboard' }

export default async function AdminDashboard() {
  const [stats, activity, startups, portfolioHealth] = await Promise.all([
    getAdminStats(),
    getGlobalActivity(8),
    getStartupsOverview(),
    getPortfolioHealth(),
  ])

  const statCards = [
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
    <div>
      <PageHeader
        title="Control Tower"
        subtitle="Portfolio overview and real-time performance monitoring"
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link href="/tv" target="_blank" className="btn btn-secondary">
              📺 Live TV Wall View
            </Link>
            {stats.pendingRegistrations > 0 && (
              <Link href="/admin/registrations" className="btn btn-primary">
                Review {stats.pendingRegistrations} Pending{' '}
                {stats.pendingRegistrations === 1 ? 'Application' : 'Applications'}
              </Link>
            )}
          </div>
        }
      />

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
    </div>
  )
}
