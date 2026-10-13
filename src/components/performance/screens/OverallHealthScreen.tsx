import { getOverallHealthMetrics } from '@/lib/performance/getPerformanceDisplayData'

function CircularProgress({ score, size = 120 }: { score: number; size?: number }) {
  const radius = (size - 32) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference
  const remaining = circumference - progress

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#374151"
          strokeWidth="24"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#ca2f2b"
          strokeWidth="24"
          strokeDasharray={`${progress} ${remaining}`}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-[2.2vw] font-bold text-white leading-none">
          {score}
        </div>
        <div className="text-[0.75vw] text-white/60">
          /100
        </div>
      </div>
    </div>
  )
}

export async function OverallHealthScreen() {
  const healthData = await getOverallHealthMetrics()

  return (
    <div className="flex flex-col w-full h-full bg-black text-white">
      {/* Grid Container */}
      <div className="flex-1 px-[2vw] py-[2vh] overflow-hidden">
        <div className="h-full grid grid-cols-5 grid-rows-1 gap-[1px] bg-white/10">
          {healthData.slice(0, 5).map((startup) => (
            <div
              key={startup.id}
              className="bg-black px-4 py-6 flex flex-col items-center justify-center border-t border-white/10"
            >
              {/* Startup Name - More compact */}
              <h2 className="text-[1.6vw] font-semibold text-white mb-6 text-center w-full line-clamp-1">
                {startup.name}
              </h2>

              {/* Circular Progress */}
              <div className="mb-4">
                <CircularProgress score={startup.healthScore} size={180} />
              </div>
              
              <div className="text-[0.75vw] text-white/60 mb-6">
                Health Score
              </div>

              {/* Metrics */}
              <div className="w-full space-y-4">
                {/* Team Morale */}
                <div className="flex flex-col items-center pb-3 border-b border-white/10">
                  <div className="text-[2vw] font-bold text-white">
                    {startup.teamMorale} / 10
                  </div>
                  <div className="text-[0.7vw] text-white/50">
                    Team Morale
                  </div>
                </div>

                {/* Active Tasks */}
                <div className="flex flex-col items-center pb-3 border-b border-white/10">
                  <div className="text-[2vw] font-bold text-white">
                    {startup.activeTasks}
                  </div>
                  <div className="text-[0.7vw] text-white/50">
                    Active Tasks
                  </div>
                </div>

                {/* Weekly Completion */}
                <div className="flex flex-col items-center">
                  <div className="text-[2vw] font-bold text-white">
                    {startup.weeklyCompletion}%
                  </div>
                  <div className="text-[0.7vw] text-white/50">
                    Weekly Completion
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Empty cells to fill the grid */}
          {Array.from({ length: Math.max(0, 5 - healthData.length) }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-black" />
          ))}
        </div>
      </div>
    </div>
  )
}
