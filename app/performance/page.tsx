import { redirect } from 'next/navigation'
import { PERFORMANCE_SCREENS } from '@/components/performance/registry'

export default function PerformanceIndexPage() {
  redirect(`/performance/${PERFORMANCE_SCREENS[0].id}`)
}
