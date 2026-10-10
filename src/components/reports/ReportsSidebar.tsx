'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSyncExternalStore } from 'react'
import { Building2, ChevronLeft, ChevronRight } from 'lucide-react'
import { CompanyLogo } from '@/components/brand/CompanyLogo'
import type { StartupReportSummary } from '@/lib/reports/queries'

const STORAGE_KEY = 'reports:sidebarCollapsed'
const STORAGE_EVENT = 'reports:sidebarCollapseChange'
const EXPANDED_WIDTH = 272
const COLLAPSED_WIDTH = 68

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
  window.dispatchEvent(new Event(STORAGE_EVENT))
}

interface Props {
  startups: StartupReportSummary[]
}

export function ReportsSidebar({ startups }: Props) {
  const pathname = usePathname()
  const collapsed = useSyncExternalStore(
    subscribe,
    readCollapsed,
    () => false
  )

  return (
    <aside
      className="animate-slide-in-left"
      style={{
        width: collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH,
        flexShrink: 0,
        borderRight: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
        position: 'sticky',
        top: 0,
        height: '100dvh',
        maxHeight: '100dvh',
        marginLeft: '-2.5rem',
        marginTop: '-2.5rem',
        marginBottom: '-2.5rem',
        padding: collapsed ? '24px 8px' : '24px 14px',
        transition: 'width 0.2s ease, padding 0.2s ease',
      }}
    >
      <button
        type="button"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        onClick={() => {
          localStorage.setItem(STORAGE_KEY, collapsed ? '0' : '1')
          toggleCollapsed()
        }}
        style={{
          position: 'absolute',
          right: -14,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 26,
          height: 26,
          borderRadius: '50%',
          border: '1px solid var(--color-border)',
          background: 'var(--color-surface-2)',
          color: 'var(--color-text-secondary)',
          cursor: 'pointer',
          boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
        }}
      >
        {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
      </button>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          height: '100%',
          overflowY: 'auto',
        }}
      >
        {!collapsed && (
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              color: 'var(--color-text-muted)',
              marginBottom: 8,
            }}
          >
            Reports
          </p>
        )}

        {!collapsed && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              color: 'var(--color-text-muted)',
              margin: '0 6px 8px',
            }}
          >
            <Building2 size={13} />
            Startups ({startups.length})
          </div>
        )}

        {startups.length === 0 ? (
          !collapsed && (
            <p
              style={{
                fontSize: 13,
                color: 'var(--color-text-muted)',
                padding: '8px 6px',
              }}
            >
              No startups in portfolio
            </p>
          )
        ) : (
          startups.map((startup) => {
            const active = pathname === `/venture-manager/reports/${startup.id}`
            return (
              <SidebarLink
                key={startup.id}
                href={`/venture-manager/reports/${startup.id}`}
                active={active}
                logoUrl={startup.logo_url}
                label={startup.name}
                collapsed={collapsed}
              />
            )
          })
        )}
      </div>
    </aside>
  )
}

function SidebarLink({
  href,
  active,
  logoUrl,
  label,
  collapsed,
}: {
  href: string
  active: boolean
  logoUrl?: string | null
  label: string
  collapsed: boolean
}) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : undefined,
        gap: 10,
        padding: '8px 10px',
        borderRadius: 10,
        textDecoration: 'none',
        fontSize: 13,
        fontWeight: active ? 700 : 500,
        color: active ? 'var(--color-brand)' : 'var(--color-text-secondary)',
        background: active ? 'var(--color-brand-dim)' : 'transparent',
        transition: 'all 0.15s ease',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = 'var(--color-surface-2)'
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = 'transparent'
      }}
    >
      <CompanyLogo logoUrl={logoUrl ?? null} name={label} size="sm" />
      {!collapsed && (
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
      )}
    </Link>
  )
}