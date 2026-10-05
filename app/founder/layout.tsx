import { requireFounder } from '@/lib/auth/requireRole'
import { getMembershipForUser } from '@/lib/startups/queries'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { founderNav, withTvWall } from '@/components/layout/nav'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Founder Dashboard' }

export default async function FounderLayout({ children }: { children: React.ReactNode }) {
  const session = await requireFounder()

  // Get startup name and logo for sidebar
  const membership = await getMembershipForUser(session.id, 'FOUNDER')
  const startup = membership?.startup

  return (
    <DashboardShell
      session={session}
      brandLabel={startup?.name || 'My Startup'}
      brandSublabel="Founder Dashboard"
      userRole="Founder"
      brandLogoUrl={startup?.logo_url || null}
      startupId={membership?.startup_id}
      nav={withTvWall(founderNav, membership?.startup_id)}
    >
      {children}
    </DashboardShell>
  )
}