import { getCriticalBlockersData } from '@/lib/performance/getPerformanceDisplayData'
import { AlertTriangle } from 'lucide-react'

export async function CriticalBlockersScreen() {
  const blockersData = await getCriticalBlockersData()

  return (
    <div className="flex flex-col w-full h-full bg-black text-white">
      {/* Grid Container */}
      <div className="flex-1 p-[3vw] overflow-hidden">
        <div className="h-full grid grid-cols-4 grid-rows-2 gap-[1px] bg-white/10">
          {blockersData.map((startup) => (
            <div
              key={startup.id}
              className="bg-black p-6 flex flex-col"
            >
              {/* Startup Header */}
              <div className="flex items-center gap-3 mb-6">
                <AlertTriangle className="w-8 h-8 text-[#ca2f2b] fill-[#ca2f2b]" strokeWidth={0} />
                <h2 className="text-[1.5vw] font-medium text-white">
                  {startup.name}
                </h2>
              </div>

              {/* Bottlenecks */}
              <div className="flex-1 flex flex-col gap-6">
                {startup.blockers.slice(0, 3).map((blocker, index) => (
                  <div key={blocker.id} className="flex flex-col">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-[1.1vw] font-medium text-white">
                        Bottleneck {index + 1}
                      </span>
                      {blocker.daysOverdue !== undefined && (
                        <span className="text-[0.7vw] text-[#ca2f2b] font-medium">
                          {blocker.daysOverdue}d overdue
                        </span>
                      )}
                    </div>
                    <div className="text-[0.9vw] text-white/90 mb-1 line-clamp-2">
                      {blocker.title}
                    </div>
                    <div className="text-[0.75vw] text-white/50 mb-1">
                      {blocker.department || 'Department affected'}
                    </div>
                    <div className="text-[0.85vw] text-white/90 font-medium">
                      {blocker.ownerName}
                    </div>
                    <div className="w-full h-[1px] bg-white/20 mt-2"></div>
                  </div>
                ))}

                {startup.blockers.length === 0 && (
                  <div className="flex-1 flex items-center justify-center text-white/30 text-sm">
                    No critical blockers
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Empty cells to fill the grid */}
          {Array.from({ length: Math.max(0, 8 - blockersData.length) }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-black p-6 flex items-center justify-center">
              {i === 0 && blockersData.length < 8 && (
                <AlertTriangle className="w-24 h-24 text-[#ca2f2b] opacity-20 fill-[#ca2f2b]" strokeWidth={0} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
