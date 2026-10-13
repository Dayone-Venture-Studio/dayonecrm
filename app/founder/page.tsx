import { Suspense } from 'react'
import { getSession } from '@/lib/auth/getSession'
import { getFounderDashboardData } from '@/lib/startups/founderQueries'
import { FounderDashboardSkeleton } from '@/components/founder/FounderDashboardSkeleton'
import { FounderDashboardClient } from '@/components/founder/FounderDashboardClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Founder Command Center — Day One' }

export default function FounderDashboard() {
  return (
    <Suspense fallback={<FounderDashboardSkeleton />}>
      <FounderDashboardContent />
    </Suspense>
  )
}

async function FounderDashboardContent() {
  const session = await getSession()
  const data = await getFounderDashboardData(session!.id)

  // Pass data to client component which will call useDataLoaded()
  return <FounderDashboardClient data={data} />
}
