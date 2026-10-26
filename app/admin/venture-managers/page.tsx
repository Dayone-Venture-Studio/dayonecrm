import { Suspense, cache } from 'react'
import type { Metadata } from 'next'
import { PageHeader } from '@/components/layout/PageHeader'
import { TableSkeleton } from '@/components/layout/LoadingStates'
import { VentureManagersClient } from '@/components/venture-managers/VentureManagersClient'
import { getAllVentureManagers } from '@/lib/venture-managers/queries'

export const metadata: Metadata = { title: 'Venture Managers' }

const getMembers = cache(getAllVentureManagers)

export default function VentureManagersPage() {
  return (
    <div>
      <PageHeader
        title="Venture Managers"
        subtitle="Manage venture manager accounts"
      />
      <Suspense fallback={<TableSkeleton rows={6} />}>
        <Content />
      </Suspense>
    </div>
  )
}

async function Content() {
  const members = await getMembers()
  return <VentureManagersClient members={members} />
}