import { getMockData, topWinsData } from '@/lib/tv-dashboards/mockData';
import { getAllTvStartups } from '@/lib/tv/telemetry';
import { Star } from 'lucide-react'; // Placeholder for the burst icon

export async function TopWinsScreen() {
  const startups = await getAllTvStartups();

  return (
    <div className="w-full h-full flex flex-col pt-12 pb-16 bg-[#f2ede3] text-black relative">
      <div className="px-12 mb-8">
        <h1 className="text-[80px] font-medium tracking-tight">Top Wins This Week</h1>
      </div>

      <div className="flex-1 w-full border-t border-black/20 grid grid-cols-4 grid-rows-2">
        {startups.map((startup, index) => {
          const wins = getMockData(topWinsData, startup.id, index);
          return (
            <div
              key={startup.id}
              className={`flex flex-col p-8 border-b  
                ${index === 3 || index === 6 ? 'border-r-0' : ''}
              `}
            >
              <div className="flex items-center gap-4 mb-8">
                {/* Custom multi-point star / burst (using lucide star for now, colored red) */}
                <svg className="w-12 h-12 text-[#da291c] fill-[#da291c]" viewBox="0 0 24 24">
                  <path d="M12 0l2.5 8h8.5l-7 5.5 2.5 8.5-6.5-5-6.5 5 2.5-8.5-7-5.5h8.5z"/>
                </svg>
                <h2 className="text-4xl font-medium">{startup.name}</h2>
              </div>

              <div className="flex flex-col gap-6">
                {wins.map((win, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-3 h-3 rounded-full bg-[#da291c] mt-2 shrink-0"></div>
                    <div className="flex flex-col">
                      <h3 className="text-3xl font-light leading-none mb-1">{win.title}</h3>
                      <div className="text-sm font-medium text-black/70">{win.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        
        {/* 8th cell - Large burst icon */}
        <div className="flex items-center justify-center p-8 border-b-0 border-r-0">
          <svg className="w-80 h-80 text-[#da291c] fill-[#da291c] opacity-90" viewBox="0 0 24 24">
            <path d="M12 0l2.5 8h8.5l-7 5.5 2.5 8.5-6.5-5-6.5 5 2.5-8.5-7-5.5h8.5z"/>
          </svg>
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
