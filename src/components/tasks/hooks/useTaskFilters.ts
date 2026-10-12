import { useState, useMemo } from 'react'
import type { Task } from '@/types'
import { FILTER_ALL_DOMAINS } from '../constants'

export function useTaskFilters(tasks: Task[]) {
  const [filterDomain, setFilterDomain] = useState<string>(FILTER_ALL_DOMAINS)

  // Filter by domain
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const domainMatch = filterDomain === FILTER_ALL_DOMAINS || t.domain_id === filterDomain
      return domainMatch
    })
  }, [tasks, filterDomain])

  // Organize tasks by status
  const organizedTasks = useMemo(() => {
    return {
      todo: filteredTasks.filter((t) => t.status === 'TODO'),
      inProgress: filteredTasks.filter((t) => t.status === 'IN_PROGRESS'),
      done: filteredTasks.filter((t) => t.status === 'DONE'),
    }
  }, [filteredTasks])

  return {
    filterDomain,
    setFilterDomain,
    filteredTasks,
    organizedTasks,
  }
}
