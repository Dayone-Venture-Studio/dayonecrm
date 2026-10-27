import { useState, useMemo } from 'react'
import type { Task } from '@/types'
import { FILTER_ALL_DOMAINS } from '../constants'

export function useTaskFilters(tasks: Task[], delegationMap?: Map<string, any>) {
  const [filterDomain, setFilterDomain] = useState<string>(FILTER_ALL_DOMAINS)

  // Filter by domain
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const domainMatch = filterDomain === FILTER_ALL_DOMAINS || t.domain_id === filterDomain
      return domainMatch
    })
  }, [tasks, filterDomain])

  // Organize tasks by status, using effective status (team_task status if delegated)
  const organizedTasks = useMemo(() => {
    // Map tasks with effective status
    const tasksWithEffectiveStatus = filteredTasks.map(task => {
      const delegation = delegationMap?.get(task.id)
      const effectiveStatus = delegation?.team_task?.status || task.status
      return { ...task, effectiveStatus, delegation }
    })

    return {
      todo: tasksWithEffectiveStatus.filter((t) => t.effectiveStatus === 'TODO'),
      inProgress: tasksWithEffectiveStatus.filter((t) => t.effectiveStatus === 'IN_PROGRESS'),
      done: tasksWithEffectiveStatus.filter((t) => t.effectiveStatus === 'DONE'),
    }
  }, [filteredTasks, delegationMap])

  return {
    filterDomain,
    setFilterDomain,
    filteredTasks,
    organizedTasks,
  }
}
