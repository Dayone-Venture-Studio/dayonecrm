import { Suspense, cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth/getSession'
import { getMembershipForUser } from '@/lib/startups/queries'
import { StaffClient } from '@/components/staff/StaffClient'
import { PageHeader } from '@/components/layout/PageHeader'
import { TableSkeleton, TextSkeleton } from '@/components/layout/LoadingStates'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Staff Management' }

const getStaffData = cache(async () => {
  const session = await getSession()
  const supabase = await createClient()

  const membership = await getMembershipForUser(session!.id, 'FOUNDER')
  const startupId = membership?.startup_id
  if (!startupId) return null

  const { data: staffMembers } = await supabase
    .from('startup_members')
    .select('*, profile:profiles(*)')
    .eq('startup_id', startupId)
    .eq('role', 'STAFF')
    .order('created_at', { ascending: true })

  return { startupId, staff: (staffMembers as any) || [] }
})

export default function StaffPage() {
  return (
    <div>
      <PageHeader
        title="Staff"
        subtitle={
          <Suspense fallback={<TextSkeleton width={110} />}>
            <StaffSubtitle />
          </Suspense>
        }
      />

      <Suspense fallback={<TableSkeleton rows={6} />}>
        <StaffContent />
      </Suspense>
    </div>
  )
}

async function StaffSubtitle() {
  const data = await getStaffData()
  if (!data) return null
  return <>{data.staff.length} team members</>
}

async function StaffContent() {
  const data = await getStaffData()
  if (!data) return <div>Startup not found</div>

  return <StaffClient startupId={data.startupId} staff={data.staff} />
}
