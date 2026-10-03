import { requireVentureManager } from '@/lib/auth/requireRole'
import { Sidebar } from '@/components/layout/Sidebar'
import type { ReactNode } from 'react'

interface VentureManagerLayoutProps {
  children: ReactNode
}

const ventureManagerNavItems = [
  { href: '/venture-manager', label: 'Portfolio Overview', icon: '📊' },
  { href: '/venture-manager/trends', label: 'Trends & Analytics', icon: '📈' },
  { href: '/venture-manager/notes', label: 'My Notes', icon: '📝' },
  { href: '/venture-manager/reports', label: 'Reports', icon: '📄' },
]

export default async function VentureManagerLayout({ children }: VentureManagerLayoutProps) {
  const session = await requireVentureManager()

  return (
    <div className="app-shell">
      <Sidebar
        brandLabel="Day One"
        brandSublabel="Venture Manager"
        navItems={ventureManagerNavItems}
        userName={session.full_name}
        userEmail={session.email}
        userRole="Venture Manager"
      />
      <main className="main-content animate-fade-in">{children}</main>
    </div>
  )
}
