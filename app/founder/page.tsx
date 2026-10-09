import { Suspense } from 'react'
import { getSession } from '@/lib/auth/getSession'
import { getFounderDashboardData } from '@/lib/startups/founderQueries'
import { DashboardSkeleton } from '@/components/layout/DashboardSkeleton'
import { FounderHeader } from '@/components/founder/FounderHeader'
import { FounderStatsRow } from '@/components/founder/FounderStatsRow'
import { FounderHealthCard } from '@/components/founder/FounderHealthCard'
import { FounderBlockersCard } from '@/components/founder/FounderBlockersCard'
import { FounderSprintCard } from '@/components/founder/FounderSprintCard'
import { FounderVelocityCard } from '@/components/founder/FounderVelocityCard'
import { FounderTeamTable } from '@/components/founder/FounderTeamTable'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Founder Command Center — Day One' }

export default function FounderDashboard() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <FounderDashboardContent />
    </Suspense>
  )
}

async function FounderDashboardContent() {
  const session = await getSession()
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
  } = await getFounderDashboardData(session!.id)

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto' }}>
      <FounderHeader
        startupId={startupId}
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
          startupId={startupId}
          startupName={startupName}
          startupLogoUrl={startupLogoUrl}
        />
      </div>

      <FounderTeamTable teamPerf={teamPerf} memberCount={members.length} />
    </div>
  )
}