import { requireVentureManager } from '@/lib/auth/requireRole'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { ventureManagerNav } from '@/components/layout/nav'
import type { ReactNode } from 'react'

interface VentureManagerLayoutProps {
  children: ReactNode
}

export default async function VentureManagerLayout({ children }: VentureManagerLayoutProps) {
  const session = await requireVentureManager()

  return (
    <DashboardShell
      session={session}
      brandLabel="Day One"
      brandSublabel="Venture Manager"
      userRole="Venture Manager"
      nav={ventureManagerNav}
    >
      {children}
    </DashboardShell>
  )
}