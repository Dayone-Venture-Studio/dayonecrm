import { PageHeader } from '@/components/layout/PageHeader'
import { KanbanSkeleton } from '@/components/layout/LoadingStates'

export default function DailySprintLoading() {
  return (
    <div>
      <PageHeader title="Sprint Board" subtitle="Loading tasks…" />
      <KanbanSkeleton />
    </div>
  )
}
