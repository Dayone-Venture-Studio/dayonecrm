import { ReactNode } from 'react';
import { TvScreenSwitcher } from '@/components/tv-dashboards/TvScreenSwitcher';

export default function TvDashboardsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 overflow-hidden font-sans selection:bg-transparent bg-[#f2ece1] text-black">
      <TvScreenSwitcher />
      {children}
    </div>
  );
}
