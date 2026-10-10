import { requireVentureManager } from '@/lib/auth/requireRole'
import { getReportsStartupList } from '@/lib/reports/queries'
import { ReportsSidebar } from '@/components/reports/ReportsSidebar'
import type { ReactNode } from 'react'

interface ReportsLayoutProps {
  children: ReactNode
}

export default async function ReportsLayout({ children }: ReportsLayoutProps) {
  await requireVentureManager()

  const startups = await getReportsStartupList()

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'stretch',
        minHeight: 'calc(100vh - 1px)',
      }}
    >
      <ReportsSidebar startups={startups} />
      <main style={{ flex: 1, minWidth: 0 }}>{children}</main>
    </div>
  )
}