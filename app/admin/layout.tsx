import { requireAdmin } from '@/lib/auth/requireRole'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { adminNav } from '@/components/layout/nav'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin Dashboard' }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin()

  return (
    <DashboardShell
      session={session}
      brandLabel="Day One"
      brandSublabel="Admin Control Tower"
      userRole="Administrator"
      nav={adminNav}
    >
      {children}
    </DashboardShell>
  )
}