import { getMockData, weeklyMilestoneData } from '@/lib/tv-dashboards/mockData';
import { getAllTvStartups } from '@/lib/tv/telemetry';

export async function WeeklyMilestonesScreen() {
  const startups = await getAllTvStartups();

  return (
    <div className="w-full h-full flex flex-col pt-12 pb-16 bg-[#f2ede3]">
      <div className="px-12 mb-10">
        <h1 className="text-[80px] font-medium tracking-tight text-black">Weekly Milestone Achievement</h1>
      </div>

      <div className="flex-1 flex flex-row w-full border-t border-black/20 relative">
        {startups.map((startup, index) => {
          const milestones = getMockData(weeklyMilestoneData, startup.id, index);
          return (
            <div
              key={startup.id}
              className={`flex-1 flex flex-col pt-8 border-r border-black/20 ${index === startups.length - 1 ? 'border-r-0' : ''}`}
            >
              <h2 className="text-3xl font-medium mb-6 px-4">{startup.name}</h2>
              
              <div className="flex flex-col gap-4 flex-1 pb-4 px-2">
                {milestones.map((milestone, i) => (
                  <div
                    key={i}
                    className={`flex-1 flex flex-col justify-center px-4 w-full rounded-t-[50%] rounded-b-xl ${milestone.color} ${milestone.textCol} transition-all`}
                  >
                    <div className="text-center mt-auto mb-4">
                      <div className="text-[70px] leading-none font-medium tracking-tighter mb-1">{milestone.percent}%</div>
                      <div className="text-[14px] leading-tight font-medium opacity-90 px-1">{milestone.text}</div>
                    </div>
                  </div>
                ))}
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
