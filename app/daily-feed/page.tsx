import type { Metadata } from 'next'
import { PageHeader } from '@/components/layout/PageHeader'
import { requireTeamMember } from '@/lib/auth/requireRole'
import { getMyTeamTasks } from '@/lib/team/task-queries'
import { buildDailyReport, getAllReportsByDate } from '@/lib/team/report-queries'
import { DailyFeedClient } from '@/components/daily-feed/DailyFeedClient'

export const metadata: Metadata = { title: 'Daily Feed' }
export const dynamic = 'force-dynamic'

function isValidDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value))
}

function toLocalISO(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function clampToToday(date: string): string {
  const today = toLocalISO(new Date())
  return date > today ? today : date
}

export default async function DailyFeedPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const session = await requireTeamMember()
  const params = await searchParams
  const today = toLocalISO(new Date())
  const rawDate = params?.date || today
  const date = clampToToday(isValidDate(rawDate) ? rawDate : today)

  const tasks = await getMyTeamTasks(session.id)
  const report = buildDailyReport(tasks)
  report.date = date

  const allReports = await getAllReportsByDate(date)
  const existing = allReports.find((r) => r.user_id === session.id) || null

  return (
    <div className="scroll-container">
      {/* <PageHeader title="Daily Feed" subtitle="Team daily updates" sticky /> */}
      <DailyFeedClient
        report={report}
        reports={allReports}
        existing={existing}
        selectedDate={date}
        currentUserId={session.id}
      />
      <div style={{marginBottom: '2rem'}}></div>
    </div>
  )
}