import { notFound } from 'next/navigation';
import { MonthlyPerformanceScreen } from '@/components/tv-dashboards/MonthlyPerformanceScreen';
import { WeeklyMilestonesScreen } from '@/components/tv-dashboards/WeeklyMilestonesScreen';
import { FoundersScreen } from '@/components/tv-dashboards/FoundersScreen';
import { StartupHealthScreen } from '@/components/tv-dashboards/StartupHealthScreen';
import { CriticalBlockersScreen } from '@/components/tv-dashboards/CriticalBlockersScreen';
import { OverallHealthScreen } from '@/components/tv-dashboards/OverallHealthScreen';
import { TopWinsScreen } from '@/components/tv-dashboards/TopWinsScreen';
import { GrowthMetricsScreen } from '@/components/tv-dashboards/GrowthMetricsScreen';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ screenId: string }>;
}

export default async function TvDashboardScreen({ params }: Props) {
  const { screenId } = await params;

  switch (screenId) {
    case 'monthly-performance':
      return <MonthlyPerformanceScreen />;
    case 'weekly-milestones':
      return <WeeklyMilestonesScreen />;
    case 'founders':
      return <FoundersScreen />;
    case 'startup-health':
      return <StartupHealthScreen />;
    case 'critical-blockers':
      return <CriticalBlockersScreen />;
    case 'overall-health':
      return <OverallHealthScreen />;
    case 'top-wins':
      return <TopWinsScreen />;
    case 'growth-metrics':
      return <GrowthMetricsScreen />;
    default:
      notFound();
  }
}
