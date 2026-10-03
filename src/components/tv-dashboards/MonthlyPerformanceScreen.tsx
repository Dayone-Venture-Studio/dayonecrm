import { getMockData, monthlyPerformanceData } from '@/lib/tv-dashboards/mockData';
import { getAllTvStartups } from '@/lib/tv/telemetry';
import { CompanyLogo } from '@/components/brand/CompanyLogo'; // Assuming we have a logo component

export async function MonthlyPerformanceScreen() {
  const startups = await getAllTvStartups();

  return (
    <div className="w-full h-full flex flex-col pt-12 pb-16 bg-[#f2ede3]">
      <div className="px-12 mb-10">
        <h1 className="text-[80px] font-medium tracking-tight text-black">Monthly Performance</h1>
      </div>

      <div className="flex-1 flex flex-row w-full border-t border-black/20 relative">
        {startups.map((startup, index) => {
          const data = getMockData(monthlyPerformanceData, startup.id, index);
          return (
            <div
              key={startup.id}
              className={`flex-1 flex flex-col items-center pt-8  ${index === startups.length - 1 ? 'border-r-0' : ''}`}
            >
              <h2 className="text-3xl font-medium mb-1">{startup.name}</h2>
              <span className="text-4xl text-[#da291c] font-medium self-end pr-10 mb-[-10px]">%</span>
              <div className="text-[140px] leading-none font-medium text-[#da291c] tracking-tighter mb-4">
                {data.achieved}
              </div>
              <div className="text-xl text-[#da291c] font-light mb-8">Achieved</div>
              
              <div className="w-2/3 h-[1px] bg-[#da291c] mb-10" />

              <div className="text-lg font-medium mb-2">Revenue</div>
              <div className="text-[75px] leading-none font-medium tracking-tight mb-8">
                {data.revenue}
              </div>

              <div className="w-2/3 h-[1px] bg-black/20 mb-10" />

              <div className="text-sm font-medium text-black/60 mb-2">Target</div>
              <div className="text-[60px] leading-none font-medium tracking-tight">
                {data.target}
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
