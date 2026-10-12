import type { Domain } from '@/types'
import { FILTER_ALL_DOMAINS } from '../constants'

interface TaskToolbarProps {
  domains: Domain[]
  filterDomain: string
  onFilterChange: (domainId: string) => void
  canCreateTask: boolean
  onCreateTask: () => void
}

export function TaskToolbar({
  domains,
  filterDomain,
  onFilterChange,
  canCreateTask,
  onCreateTask,
}: TaskToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-5">
      <select
        value={filterDomain}
        onChange={(e) => onFilterChange(e.target.value)}
        className="input w-auto min-w-[140px]"
      >
        <option value={FILTER_ALL_DOMAINS}>All Domains</option>
        {domains.map((d) => (
          <option key={d.id} value={d.id}>{d.name}</option>
        ))}
      </select>
      <div className="flex-1" />
      {canCreateTask && (
        <button
          onClick={onCreateTask}
          className="btn btn-primary"
        >
          + New Task
        </button>
      )}
    </div>
  )
}
