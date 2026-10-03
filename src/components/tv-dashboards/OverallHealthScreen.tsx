import { getMockData, overallHealthData } from '@/lib/tv-dashboards/mockData';
import { getAllTvStartups } from '@/lib/tv/telemetry';

export async function OverallHealthScreen() {
  const startups = await getAllTvStartups();

  return (
    <div className="w-full h-full flex flex-col pt-12 pb-16 bg-black text-white relative">
      <div className="px-12 mb-10">
        <h1 className="text-[80px] font-medium tracking-tight">Overall Health</h1>
      </div>

      <div className="flex-1 flex flex-row w-full border-t border-white/20 relative">
        {startups.map((startup, index) => {
          const data = getMockData(overallHealthData, startup.id, index);
          return (
            <div
              key={startup.id}
              className={`flex-1 flex flex-col px-4 pt-8 border-r border-white/20 ${index === startups.length - 1 ? 'border-r-0' : ''}`}
            >
              <h2 className="text-3xl font-medium mb-10 text-center">{startup.name}</h2>
              
              <div className="flex flex-col items-center flex-1">
                {/* Gauge Chart Placeholder (CSS based) */}
                <div className="w-32 h-32 rounded-full relative flex items-center justify-center mb-6"
                  style={{
                    background: `conic-gradient(#da291c ${data.score * 3.6}deg, #444 ${data.score * 3.6}deg)`
                  }}
                >
                   <div className="w-24 h-24 bg-black rounded-full absolute flex flex-col items-center justify-center">
                      <span className="text-4xl font-medium leading-none">{data.score}</span>
                      <span className="text-xs text-white/50">/100</span>
                   </div>
                </div>
                <div className="text-sm font-light text-white/60 mb-10">Health Score</div>

                <div className="w-full flex flex-col mb-8 px-2">
                  <div className="text-3xl font-medium">{data.morale}</div>
                  <div className="text-sm font-light text-white/60 mt-1">Team Morale</div>
                </div>

                <div className="w-full h-[1px] bg-white/20 mb-8" />

                <div className="w-full flex flex-col mb-8 px-2">
                  <div className="text-3xl font-medium">{data.nps}</div>
                  <div className="text-sm font-light text-white/60 mt-1">NPS</div>
                </div>

                <div className="w-full h-[1px] bg-white/20 mb-8" />

                <div className="w-full flex flex-col px-2">
                  <div className="text-3xl font-medium">{data.uptime}</div>
                  <div className="text-sm font-light text-white/60 mt-1">System Uptime</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Banner */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-[#da291c] flex">
        {startups.map((startup, index) => (
          <div key={startup.id + '-footer'} className={`flex-1 flex justify-center items-center ${index !== startups.length - 1 ? '' : ''}`}>
             <span className="text-white font-bold text-2xl tracking-tighter">day<span className="font-normal">one</span></span>
             <span className="text-[8px] text-white ml-1 leading-[8px] opacity-80">venture studio by iQue</span>
          </div>
        ))}
      </div>
    </div>
  );
}
