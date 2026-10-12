'use client'

import { useDataLoaded } from '@/lib/providers/LoadingContext'
import { FounderHeader } from './FounderHeader'
import { FounderStatsRow } from './FounderStatsRow'
import { FounderHealthCard } from './FounderHealthCard'
import { FounderBlockersCard } from './FounderBlockersCard'
import { FounderSprintCard } from './FounderSprintCard'
import { FounderVelocityCard } from './FounderVelocityCard'
import { FounderTeamTable } from './FounderTeamTable'
import type { FounderDashboardData } from '@/lib/startups/founderQueries'

interface Props {
  data: FounderDashboardData
}

export function FounderDashboardClient({ data }: Props) {
  const {
    startupId,
    startupName,
    startupLogoUrl,
    currentPlan,
    members,
    health,
    teamPerf,
    taskStats,
    staffCount,
    domainCount,
    completionRate,
  } = data

  // Signal that data is loaded and ready to display
  useDataLoaded()

  return (
    <div>
      <FounderHeader
        startupId={startupId || ''}
        startupName={startupName}
        startupLogoUrl={startupLogoUrl}
      />

      <FounderStatsRow
        taskStats={taskStats}
        staffCount={staffCount}
        domainCount={domainCount}
        completionRate={completionRate}
      />

      {/* ── Executive Health & Critical Blockers Diagnostic Grid ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: 20,
          marginBottom: 28,
        }}
      >
        <FounderHealthCard health={health} />
        <FounderBlockersCard health={health} />
      </div>

      {/* ── Main 2-Column Workspaces ── */}
      <div className="grid-2">
        <FounderSprintCard currentPlan={currentPlan} taskStats={taskStats} />
        <FounderVelocityCard
          taskStats={taskStats}
          startupId={startupId || ''}
          startupName={startupName}
          startupLogoUrl={startupLogoUrl}
        />
      </div>

      <FounderTeamTable teamPerf={teamPerf} memberCount={members.length} />
    </div>
  )
}
