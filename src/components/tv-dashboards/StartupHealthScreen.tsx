import { getMockData, startupHealthData } from '@/lib/tv-dashboards/mockData';
import { getAllTvStartups } from '@/lib/tv/telemetry';

export async function StartupHealthScreen() {
  const startups = await getAllTvStartups();

  return (
    <div className="w-full h-full flex flex-col pt-12 pb-16 bg-black text-white relative">
      <div className="px-12 mb-10">
        <h1 className="text-[80px] font-medium tracking-tight">Startup Health</h1>
      </div>

      <div className="flex-1 w-full flex flex-col mt-4">
        {/* Table Header */}
        <div className="w-full bg-[#da291c] text-white flex pt-8 pb-6 px-12">
          <div className="w-[10%]"></div>
          <div className="w-[25%] text-[32px] font-medium uppercase tracking-widest mt-auto">Company</div>
          <div className="w-[25%] flex flex-col text-center">
            <span className="text-[32px] font-medium uppercase tracking-widest leading-none">CASH RUNWAY</span>
            <span className="text-lg font-light mt-2">Months</span>
          </div>
          <div className="w-[20%] flex flex-col text-center">
            <span className="text-[32px] font-medium uppercase tracking-widest leading-none">Burn Rate</span>
            <span className="text-lg font-light mt-2">Per month</span>
          </div>
          <div className="w-[20%] flex flex-col text-center">
            <span className="text-[32px] font-medium uppercase tracking-widest leading-none">CAC</span>
            <span className="text-lg font-light mt-2">Per Customer</span>
          </div>
        </div>

        {/* Table Rows */}
        <div className="flex-1 flex flex-col w-full">
          {startups.map((startup, idx) => {
            const mockDataArray = Object.values(startupHealthData);
            const mockData = mockDataArray[idx % mockDataArray.length];
            return (
              <div key={startup.id} className="flex-1 flex w-full items-center px-12 border-b border-white/20">
                <div className="w-[10%] text-4xl font-medium tracking-tight">0{idx + 1}</div>
                <div className="w-[25%] text-5xl font-medium tracking-tight">{startup.name}</div>
                <div className="w-[25%] text-center text-[75px] leading-none font-medium text-[#da291c] tracking-tighter">
                  {mockData.cash}
                </div>
                <div className="w-[20%] text-center text-[75px] leading-none font-medium text-[#da291c] tracking-tighter">
                  {mockData.burn}
                </div>
                <div className="w-[20%] text-center text-[75px] leading-none font-medium text-[#da291c] tracking-tighter">
                  {mockData.cac}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Banner */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-black border-t border-[#da291c] flex">
        {startups.map((startup, index) => (
          <div key={startup.id + '-footer'} className={`flex-1 flex justify-center items-center ${index !== startups.length - 1 ? 'border-r border-[#da291c]' : ''}`}>
             <span className="text-[#da291c] font-bold text-2xl tracking-tighter">day<span className="font-normal">one</span></span>
             <span className="text-[8px] text-[#da291c] ml-1 leading-[8px] opacity-80">venture studio by iQue</span>
          </div>
        ))}
      </div>
    </div>
  );
}
