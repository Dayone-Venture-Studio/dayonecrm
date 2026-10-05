import { requireVentureManager } from '@/lib/auth/requireRole'
import { getPortfolioSnapshot, getTrendData } from '@/lib/venture-manager/portfolioAnalytics'
import { getAllActiveNotes } from '@/lib/venture-manager/queries'
import { VentureManagerDashboardClient } from '@/components/venture-manager/VentureManagerDashboardClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Portfolio Overview — Day One Venture Manager',
  description: 'Monitor and analyze all startup performance metrics across your portfolio',
}

export default async function VentureManagerDashboardPage() {
  await requireVentureManager()

  const [portfolioSnapshot, trendData, activeNotes] = await Promise.all([
    getPortfolioSnapshot(),
    getTrendData(8),
    getAllActiveNotes(),
  ])

  return (
    <VentureManagerDashboardClient
      portfolioSnapshot={portfolioSnapshot}
      trendData={trendData}
      activeNotes={activeNotes}
    />
  )
}
