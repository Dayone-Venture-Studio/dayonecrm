import { requireStaff } from '@/lib/auth/requireRole'
import { getMembershipForUser } from '@/lib/startups/queries'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { staffNav } from '@/components/layout/nav'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Staff Dashboard' }

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const session = await requireStaff()

  const membership = await getMembershipForUser(session.id, 'STAFF')
  const startup = membership?.startup

  return (
    <DashboardShell
      session={session}
      brandLabel={startup?.name || 'My Startup'}
      brandSublabel="Staff Portal"
      userRole="Staff"
      brandLogoUrl={startup?.logo_url || null}
      startupId={membership?.startup_id}
      nav={staffNav}
    >
      {children}
    </DashboardShell>
  )
}