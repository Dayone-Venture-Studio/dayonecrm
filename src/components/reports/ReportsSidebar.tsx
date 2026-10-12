'use client'

import Link from 'next/link'
import { useLinkStatus } from 'next/link'
import { usePathname } from 'next/navigation'
import { useSyncExternalStore } from 'react'
import { Building2, ChevronLeft, ChevronRight } from 'lucide-react'
import { CompanyLogo } from '@/components/brand/CompanyLogo'
import { cn } from '@/lib/utils'
import type { StartupReportSummary } from '@/lib/reports/queries'

const STORAGE_KEY = 'reports:sidebarCollapsed'
const STORAGE_EVENT = 'reports:sidebarCollapseChange'

const readCollapsed = (): boolean => {
  if (typeof window === 'undefined') return false
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

const subscribe = (callback: () => void): (() => void) => {
  window.addEventListener('storage', callback)
  window.addEventListener(STORAGE_EVENT, callback)
  return () => {
    window.removeEventListener('storage', callback)
    window.removeEventListener(STORAGE_EVENT, callback)
  }
}

const toggleCollapsed = (): void => {
  const next = !readCollapsed()
  try {
    localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
  } catch {
    // Ignore write failures (private mode) — collapse still animates.
  }
  window.dispatchEvent(new Event(STORAGE_EVENT))
}

interface ReportsSidebarProps {
  startups: StartupReportSummary[]
}

export const ReportsSidebar = ({ startups }: ReportsSidebarProps) => {
  const pathname = usePathname()
  const collapsed = useSyncExternalStore(subscribe, readCollapsed, () => false)

  return (
    <aside
      className={cn(
        'animate-slide-in-left sticky top-0 -mb-10 -ml-10 -mt-10 flex h-dvh max-h-dvh shrink-0 flex-col border-r border-border bg-surface py-6 transition-[width,padding] duration-200 ease-in-out',
        collapsed ? 'w-[68px] px-2' : 'w-[272px] px-3.5'
      )}
    >
      <CollapseButton collapsed={collapsed} />

      <div className="flex h-full flex-col gap-1 overflow-y-auto">
        {!collapsed && (
          <>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.6px] text-text-muted">
              Reports
            </p>
            <div className="mx-1.5 mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.6px] text-text-muted">
              <Building2 size={13} />
              Startups ({startups.length})
            </div>
          </>
        )}

        {startups.length === 0 ? (
          !collapsed && (
            <p className="px-1.5 py-2 text-[13px] text-text-muted">
              No startups in portfolio
            </p>
          )
        ) : (
          startups.map((startup) => (
            <StartupLink
              key={startup.id}
              href={`/venture-manager/reports/${startup.id}`}
              active={pathname === `/venture-manager/reports/${startup.id}`}
              logoUrl={startup.logo_url}
              label={startup.name}
              collapsed={collapsed}
            />
          ))
        )}
      </div>
    </aside>
  )
}

interface CollapseButtonProps {
  collapsed: boolean
}

const CollapseButton = ({ collapsed }: CollapseButtonProps) => (
  <button
    type="button"
    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
    onClick={toggleCollapsed}
    className="absolute -right-3.5 top-1/2 z-10 flex h-[26px] w-[26px] -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-border bg-surface-2 text-text-secondary shadow-sm transition-colors hover:bg-surface-3"
  >
    {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
  </button>
)

interface StartupLinkProps {
  href: string
  active: boolean
  logoUrl?: string | null
  label: string
  collapsed: boolean
}

const StartupLink = ({ href, active, logoUrl, label, collapsed }: StartupLinkProps) => (
  <Link
    href={href}
    title={collapsed ? label : undefined}
    aria-current={active ? 'page' : undefined}
    className={cn(
      'group relative flex min-h-10 items-center overflow-hidden whitespace-nowrap rounded-[10px] text-[13px] no-underline transition-colors duration-150',
      collapsed ? 'justify-center px-0' : 'gap-2.5 pl-3.5 pr-2.5',
      active
        ? 'bg-brand-dim font-bold text-brand'
        : 'font-medium text-text-secondary hover:bg-surface-2 hover:text-text-primary'
    )}
  >
    {active && !collapsed && (
      <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-brand" />
    )}
    <PendingHint />
    <CompanyLogo logoUrl={logoUrl ?? null} name={label} size="sm" />
    {!collapsed && <span className="truncate">{label}</span>}
  </Link>
)

/**
 * Fixed-size, always-rendered pulse that lights up while the link's navigation
 * is pending, so a slow report render still gives immediate click feedback.
 */
const PendingHint = () => {
  const { pending } = useLinkStatus()
  return <span aria-hidden className="reports-link-hint" data-pending={pending} />
}
