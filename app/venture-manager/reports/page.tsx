import { redirect } from 'next/navigation'
import { requireVentureManager } from '@/lib/auth/requireRole'
import { getReportsStartupList } from '@/lib/reports/queries'

export const metadata = {
  title: 'Startup Reports — Day One Venture Manager',
}

export default async function VentureManagerReportsIndexPage() {
  await requireVentureManager()

  const startups = await getReportsStartupList()
  const first = startups[0]

  if (first) {
    redirect(`/venture-manager/reports/${first.id}`)
  }

  redirect('/venture-manager')
}