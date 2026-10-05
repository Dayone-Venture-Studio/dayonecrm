import { Sidebar } from '@/components/layout/Sidebar'
import type { NavItem } from '@/components/layout/nav'
import type { ReactNode } from 'react'
import type { SessionUser } from '@/types'

interface DashboardShellProps {
  session: SessionUser
  brandLabel: string
  brandSublabel: string
  /** Display label ("Founder", "Administrator", …). Sidebar gates FounderLogoManager on `=== 'Founder'`. */
  userRole: string
  brandLogoUrl?: string | null
  startupId?: string | null
  nav: NavItem[]
  children: ReactNode
}

/**
 * Shared app-shell wrapper used by every role layout.
 * Server component — `Sidebar` is the only client island.
 */
export function DashboardShell({
  session,
  brandLabel,
  brandSublabel,
  userRole,
  brandLogoUrl = null,
  startupId = null,
  nav,
  children,
}: DashboardShellProps) {
  return (
    <div className="app-shell">
      <Sidebar
        brandLabel={brandLabel}
        brandSublabel={brandSublabel}
        brandLogoUrl={brandLogoUrl}
        startupId={startupId ?? undefined}
        navItems={nav}
        userName={session.full_name}
        userEmail={session.email}
        userRole={userRole}
      />
      <main className="main-content animate-fade-in">{children}</main>
    </div>
  )
}