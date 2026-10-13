import { Suspense, cache } from 'react'
import type { Metadata } from 'next'
import { PageHeader } from '@/components/layout/PageHeader'
import { TableSkeleton } from '@/components/layout/LoadingStates'
import { TeamClient } from '@/components/team/TeamClient'
import { getAllTeamMembers } from '@/lib/team/member-queries'

export const metadata: Metadata = { title: 'Team' }

const getMembers = cache(getAllTeamMembers)

export default function TeamPage() {
  return (
    <div>
      <PageHeader
        title="Team Management"
        subtitle="Manage internal employees and project managers"
      />
      <Suspense fallback={<TableSkeleton rows={6} />}>
        <TeamContent />
      </Suspense>
    </div>
  )
}

async function TeamContent() {
  const members = await getMembers()
  return <TeamClient members={members} />
}
