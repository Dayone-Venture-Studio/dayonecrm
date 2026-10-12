import { Suspense } from 'react'
import type { Metadata } from 'next'
import { PageHeader } from '@/components/layout/PageHeader'
import { AdminDashboardSkeleton } from '@/components/admin/AdminDashboardSkeleton'
import { AdminDashboardClient } from '@/components/admin/AdminDashboardClient'
import {
  getAdminStats,
  getPortfolioHealth,
  getStartupsOverview,
} from '@/lib/startups/adminQueries'
import { getGlobalActivity } from '@/lib/activity/queries'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Admin Dashboard' }

export default function AdminDashboard() {
  return (
    <div>
      <PageHeader
        title="Control Tower"
        subtitle="Portfolio overview and real-time performance monitoring"
        actions={
          <Link href="/tv" target="_blank" className="btn btn-secondary">
            📺 Live TV Wall View
          </Link>
        }
      />
      <Suspense fallback={<AdminDashboardSkeleton />}>
        <AdminDashboardContent />
      </Suspense>
    </div>
  )
}

async function AdminDashboardContent() {
  const [stats, activity, startups, portfolioHealth] = await Promise.all([
    getAdminStats(),
    getGlobalActivity(8),
    getStartupsOverview(),
    getPortfolioHealth(),
  ])

  return (
    <AdminDashboardClient
      stats={stats}
      activity={activity}
      startups={startups}
      portfolioHealth={portfolioHealth}
    />
  )
}
