import { getStartupHealthData } from '@/lib/performance/getPerformanceDisplayData'
import { formatCompactCurrency } from '@/lib/performance/getPerformanceDisplayData'

export async function StartupHealthScreen() {
  const healthData = await getStartupHealthData()

  return (
    <div className="flex flex-col w-full h-full bg-black text-white">
      {/* Table Container */}
      <div className="flex-1 px-[2vw] pb-[3vh] overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Header Row */}
          <div className="grid grid-cols-[0.5fr_2fr_1.5fr_1.5fr_1.5fr] gap-4 bg-[#ca2f2b] px-6 py-4 mb-1">
            <div className="text-[1vw] font-medium text-white/90"></div>
            <div className="text-[1vw] font-medium text-white/90">COMPANY</div>
            <div className="text-[1vw] font-medium text-white/90 text-center">
              CASH RUNAWAY
              <div className="text-[0.7vw] font-normal text-white/70">Months</div>
            </div>
            <div className="text-[1vw] font-medium text-white/90 text-center">
              BURN RATE
              <div className="text-[0.7vw] font-normal text-white/70">Per months</div>
            </div>
            <div className="text-[1vw] font-medium text-white/90 text-center">
              CAC
              <div className="text-[0.7vw] font-normal text-white/70">Per Customer</div>
            </div>
          </div>

          {/* Data Rows */}
          <div className="flex-1 flex flex-col gap-1 overflow-y-auto">
            {healthData.map((row, index) => (
              <div
                key={row.id}
                className="grid grid-cols-[0.5fr_2fr_1.5fr_1.5fr_1.5fr] gap-4 px-6 py-4 border-b border-white/10"
              >
                {/* Index */}
                <div className="text-[1.2vw] text-white/90">
                  {String(index + 1).padStart(2, '0')}
                </div>

                {/* Company Name */}
                <div className="text-[1.2vw] text-white font-normal">
                  {row.name}
                </div>

                {/* Cash Runaway */}
                <div className="text-[2vw] font-bold text-[#ca2f2b] text-center">
                  {row.cashRunaway || 0}
                </div>

                {/* Burn Rate */}
                <div className="text-[2vw] font-bold text-[#ca2f2b] text-center">
                  {row.burnRate ? formatCompactCurrency(row.burnRate) : '₹0'}
                </div>

                {/* CAC */}
                <div className="text-[2vw] font-bold text-[#ca2f2b] text-center">
                  {row.cac ? formatCompactCurrency(row.cac) : '₹0'}
                </div>
              </div>
            ))}

            {healthData.length === 0 && (
              <div className="flex-1 flex items-center justify-center text-white/40 text-xl">
                No startup data available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
