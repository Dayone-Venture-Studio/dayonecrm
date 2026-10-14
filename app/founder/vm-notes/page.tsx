import { Suspense } from 'react'
import { requireRole } from '@/lib/auth/requireRole'
import { getMembershipForUser } from '@/lib/startups/queries'
import { getNotesForFounder, getUnacknowledgedNotesCountForFounder } from '@/lib/venture-manager/queries'
import { FounderNotesClient } from '@/components/founder/FounderNotesClient'
import { TableSkeleton } from '@/components/layout/LoadingStates'
import { DataLoadedSignal } from '@/components/layout/DataLoadedSignal'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'VM Notes - Founder Dashboard',
}

export default function FounderVMNotesPage() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#1a1a1a]">Venture Manager Notes</h1>
        <p className="text-gray-600 mt-2">
          View and acknowledge notes from your venture managers
        </p>
      </div>

      <Suspense fallback={<TableSkeleton rows={6} />}>
        <NotesContent />
      </Suspense>
    </div>
  )
}

async function NotesContent() {
  const user = await requireRole(['FOUNDER'])

  // Get founder's startup
  const membership = await getMembershipForUser(user.id, 'FOUNDER')
  
  if (!membership) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🏢</div>
        <h3>No Startup Found</h3>
        <p>You are not associated with any startup</p>
      </div>
    )
  }

  const startupId = membership.startup_id

  // Fetch notes and counts
  const [notes, unacknowledgedCount] = await Promise.all([
    getNotesForFounder(startupId),
    getUnacknowledgedNotesCountForFounder(startupId),
  ])

  return (
    <>
      <DataLoadedSignal />
      <FounderNotesClient 
        notes={notes} 
        unacknowledgedCount={unacknowledgedCount}
      />
    </>
  )
}
