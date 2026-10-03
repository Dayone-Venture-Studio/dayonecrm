import { getMockData, growthMetricsData } from '@/lib/tv-dashboards/mockData';
import { getAllTvStartups } from '@/lib/tv/telemetry';

export async function GrowthMetricsScreen() {
  const startups = await getAllTvStartups();

  return (
    <div className="w-full h-full flex flex-col pt-12 pb-16 bg-black text-white relative">
      <div className="px-12 mb-10">
        <h1 className="text-[80px] font-medium tracking-tight">Growth Metrics</h1>
      </div>

      <div className="flex-1 flex flex-row w-full border-t border-white/20 relative">
        {startups.map((startup, index) => {
          const data = getMockData(growthMetricsData, startup.id, index);
          return (
            <div
              key={startup.id}
              className={`flex-1 flex flex-col px-4 pt-8  ${index === startups.length - 1 ? 'border-r-0' : ''}`}
            >
              <h2 className="text-3xl font-medium mb-12 text-center">{startup.name}</h2>
              
              <div className="flex flex-col items-center mb-12">
                <span className="text-3xl font-medium self-end pr-8 mb-[-10px]">%</span>
                <div className="text-[90px] leading-none font-medium tracking-tighter">
                  {data.percent}
                </div>
              </div>

              <div className="flex justify-between w-full px-2 mb-8">
                <div className="flex flex-col">
                  <span className="text-2xl font-medium">{data.newUsers}</span>
                  <span className="text-[10px] text-white/50 uppercase tracking-wider">New users</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-2xl font-medium">{data.visits}</span>
                  <span className="text-[10px] text-white/50 uppercase tracking-wider">Website visits</span>
                </div>
              </div>

              {/* Bar Chart section */}
              <div className="flex-1 flex items-end justify-center gap-4 px-2 pb-10">
                <div className="flex flex-col items-center h-full w-[45%] justify-end gap-2">
                  <div 
                    className="w-full bg-[#da291c] rounded-t-[50px] transition-all"
                    style={{ height: `${data.barHeights[0]}%` }}
                  />
                  <div className="text-center text-[10px] text-white/50 uppercase tracking-wider leading-tight">
                    Previous<br/>Month
                  </div>
                </div>
                <div className="flex flex-col items-center h-full w-[45%] justify-end gap-2">
                  <div 
                    className="w-full bg-[#f2ede3] rounded-t-[50px] transition-all"
                    style={{ height: `${data.barHeights[1]}%` }}
                  />
                  <div className="text-center text-[10px] text-white/50 uppercase tracking-wider leading-tight">
                    This<br/>Month
                  </div>
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
