import { PageHeader } from '@/components/layout/PageHeader'
import { TableSkeleton } from '@/components/layout/LoadingStates'

export default function TeamLoading() {
  return (
    <div>
      <PageHeader title="Team Management" subtitle="Loading team members…" />
      <TableSkeleton rows={6} />
    </div>
  )
}
