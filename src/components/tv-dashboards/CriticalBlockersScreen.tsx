import { getMockData, criticalBlockersData } from '@/lib/tv-dashboards/mockData';
import { getAllTvStartups } from '@/lib/tv/telemetry';
import { AlertTriangle } from 'lucide-react';

export async function CriticalBlockersScreen() {
  const startups = await getAllTvStartups();

  return (
    <div className="w-full h-full flex flex-col pt-12 pb-16 bg-black text-white relative">
      <div className="px-12 mb-8">
        <h1 className="text-[80px] font-medium tracking-tight text-[#f2ede3]">Critical Blockers</h1>
      </div>

      <div className="flex-1 w-full border-t border-white/20 grid grid-cols-4 grid-rows-2">
        {startups.map((startup, index) => {
          const bottlenecks = getMockData(criticalBlockersData, startup.id, index);
          return (
            <div
              key={startup.id}
              className={`flex flex-col p-8 border-b  
                ${index === 3 || index === 6 ? 'border-r-0' : ''}
              `}
            >
              <div className="flex items-center gap-4 mb-8">
                <AlertTriangle className="w-12 h-12 text-[#da291c] fill-[#da291c]" />
                <h2 className="text-4xl font-medium">{startup.name}</h2>
              </div>

              <div className="flex flex-wrap gap-x-8 gap-y-12">
                {bottlenecks.map((bn, i) => (
                  <div key={i} className="w-[45%] flex flex-col">
                    <h3 className="text-2xl font-light mb-1">{bn.title}</h3>
                    <div className="text-[10px] text-white/50 uppercase tracking-wider mb-1">{bn.dept}</div>
                    <div className="text-[10px] text-white font-medium uppercase tracking-wider border-b border-white/30 pb-1 w-fit pr-4">{bn.owner}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        
        {/* 8th cell - Large warning icon */}
        <div className="flex items-center justify-center p-8 border-b-0 border-r-0">
           <AlertTriangle className="w-80 h-80 text-[#da291c] fill-[#da291c] opacity-90" />
        </div>
      </div>

      {/* Footer Banner */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-[#da291c] flex">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={'footer-' + index} className={`flex-1 flex justify-center items-center ${index !== 3 ? '' : ''}`}>
             <span className="text-white font-bold text-2xl tracking-tighter">day<span className="font-normal">one</span></span>
             <span className="text-[8px] text-white ml-1 leading-[8px] opacity-80">venture studio by iQue</span>
          </div>
        ))}
      </div>
    </div>
  );
}
