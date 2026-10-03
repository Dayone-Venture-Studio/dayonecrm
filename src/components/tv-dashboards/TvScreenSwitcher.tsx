'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutGrid, X } from 'lucide-react';

const SCREENS = [
  { id: 'monthly-performance', name: 'Monthly Performance' },
  { id: 'weekly-milestones', name: 'Weekly Milestones' },
  { id: 'founders', name: 'Founders' },
  { id: 'startup-health', name: 'Startup Health' },
  { id: 'critical-blockers', name: 'Critical Blockers' },
  { id: 'overall-health', name: 'Overall Health' },
  { id: 'top-wins', name: 'Top Wins' },
  { id: 'growth-metrics', name: 'Growth Metrics' },
];

export function TvScreenSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white flex items-center justify-center transition-all shadow-lg"
        title="Switch TV Screen"
      >
        {isOpen ? <X className="w-5 h-5" /> : <LayoutGrid className="w-5 h-5" />}
      </button>

      {isOpen && (
        <div className="absolute top-16 right-0 w-64 bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden py-2">
          <div className="px-4 py-2 text-xs font-bold text-white/50 uppercase tracking-wider border-b border-white/10 mb-2">
            TV Dashboards
          </div>
          <div className="flex flex-col">
            {SCREENS.map((screen) => {
              const isActive = pathname === `/tv/dashboards/${screen.id}`;
              return (
                <button
                  key={screen.id}
                  onClick={() => {
                    router.push(`/tv/dashboards/${screen.id}`);
                    setIsOpen(false);
                  }}
                  className={`px-4 py-2 text-left text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-[#da291c]/20 text-[#da291c] border-l-2 border-[#da291c]' 
                      : 'text-white/80 hover:bg-white/10 border-l-2 border-transparent'
                  }`}
                >
                  {screen.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
