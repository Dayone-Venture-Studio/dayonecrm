export const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'badge-neutral',
  MEDIUM: 'badge-warning',
  HIGH: 'badge-danger',
}

export const TASK_STATUS = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
} as const

export const COMPLETION_STATUS_COLORS: Record<string, string> = {
  EARLY: 'badge-success',
  ON_TIME: 'badge-info',
  LATE: 'badge-warning',
}

export const FILTER_ALL_DOMAINS = 'ALL'
