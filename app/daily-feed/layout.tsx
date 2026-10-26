import { requireTeamMember } from '@/lib/auth/requireRole'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { dailySprintNav } from '@/components/layout/nav'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Daily Feed' }

export default async function DailyFeedLayout({ children }: { children: React.ReactNode }) {
  const session = await requireTeamMember()

  return (
    <DashboardShell
      session={session}
      brandLabel="Day One"
      brandSublabel="Team Workspace"
      userRole={session.role === 'PROJECT_MANAGER' ? 'Project Manager' : 'Employee'}
      nav={dailySprintNav}
    >
      {children}
    </DashboardShell>
  )
}