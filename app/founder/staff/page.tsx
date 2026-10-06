import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth/getSession'
import { getMembershipForUser } from '@/lib/startups/queries'
import { StaffClient } from '@/components/staff/StaffClient'
import { PageHeader } from '@/components/layout/PageHeader'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Staff Management' }

export default async function StaffPage() {
  const session = await getSession()
  const supabase = await createClient()

  const membership = await getMembershipForUser(session!.id, 'FOUNDER')
  const startupId = membership?.startup_id
  if (!startupId) return <div>Startup not found</div>

  const { data: staffMembers } = await supabase
    .from('startup_members')
    .select('*, profile:profiles(*)')
    .eq('startup_id', startupId)
    .eq('role', 'STAFF')
    .order('created_at', { ascending: true })

  return (
    <div>
      <PageHeader title="Staff" subtitle={`${staffMembers?.length || 0} team members`} />
      <StaffClient startupId={startupId} staff={staffMembers as any || []} />
    </div>
  )
}
