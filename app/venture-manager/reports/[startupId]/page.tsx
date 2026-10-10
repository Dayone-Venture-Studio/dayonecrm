import { Suspense } from 'react'
import { requireVentureManager } from '@/lib/auth/requireRole'
import { getStartupById } from '@/lib/startups/queries'
import { getStartupReportData, type StartupReportSummary } from '@/lib/reports/queries'
import { StartupReport } from '@/components/reports/StartupReport'
import { ReportsSkeleton } from '@/components/reports/ReportsSkeleton'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ startupId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { startupId } = await params
  const startup = await getStartupById(startupId)

  return {
    title: startup ? `${startup.name} Report — Day One Venture Manager` : 'Startup Report',
  }
}

export default function VentureManagerStartupReportPage({ params }: Props) {
  return (
    <Suspense fallback={<ReportsSkeleton />}>
      <StartupReportContent params={params} />
    </Suspense>
  )
}

async function StartupReportContent({ params }: Props) {
  await requireVentureManager()

  const { startupId } = await params
  const startup = await getStartupById(startupId)

  if (!startup) {
    notFound()
  }

  const data = await getStartupReportData(startup as StartupReportSummary)

  return <StartupReport data={data} />
}