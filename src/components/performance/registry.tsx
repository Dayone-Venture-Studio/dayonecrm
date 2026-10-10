import type { JSX } from 'react'
import { MonthlyPerformanceScreen } from './screens/MonthlyPerformanceScreen'
import { WeeklyMilestonesScreen } from './screens/WeeklyMilestonesScreen'

export interface PerformanceScreen {
  id: string
  name: string
  Component: () => Promise<JSX.Element>
}

/**
 * Single source of truth for the performance wall.
 * Add a screen: create its component, then append one entry here.
 * Routing, prev/next navigation, and the default redirect all derive from this.
 */
export const PERFORMANCE_SCREENS: PerformanceScreen[] = [
  {
    id: 'monthly-performance',
    name: 'Monthly Performance',
    Component: MonthlyPerformanceScreen,
  },
  {
    id: 'weekly-milestones',
    name: 'Weekly Milestone Achievement',
    Component: WeeklyMilestonesScreen,
  },
]
