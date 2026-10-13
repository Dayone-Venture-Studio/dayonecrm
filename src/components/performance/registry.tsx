import type { JSX } from 'react'
import { MonthlyPerformanceScreen } from './screens/MonthlyPerformanceScreen'
import { WeeklyMilestonesScreen } from './screens/WeeklyMilestonesScreen'
import { FoundersOfTheWeekScreen } from './screens/FoundersOfTheWeekScreen'
import { StartupHealthScreen } from './screens/StartupHealthScreen'
import { CriticalBlockersScreen } from './screens/CriticalBlockersScreen'

export interface PerformanceScreen {
  id: string
  name: string
  Component: () => Promise<JSX.Element>
  darkMode?: boolean
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
  {
    id: 'founders-of-the-week',
    name: 'Founders of the Week',
    Component: FoundersOfTheWeekScreen,
  },
  {
    id: 'startup-health',
    name: 'Startup Health',
    Component: StartupHealthScreen,
    darkMode: true,
  },
  {
    id: 'critical-blockers',
    name: 'Critical Blockers',
    Component: CriticalBlockersScreen,
    darkMode: true,
  },
]
