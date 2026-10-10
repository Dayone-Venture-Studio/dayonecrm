import type { PerformanceStatus } from '@/types'

export const PERFORMANCE_STATUS_LABEL: Record<PerformanceStatus, string> = {
  AHEAD: 'Ahead',
  ON_TRACK: 'On Track',
  BEHIND: 'Behind',
  AT_RISK: 'At Risk',
}

export const PERFORMANCE_STATUS_COLOR: Record<PerformanceStatus, string> = {
  AHEAD: '#059669',
  ON_TRACK: '#ca2f2b',
  BEHIND: '#d97706',
  AT_RISK: '#ca2f2b',
}
