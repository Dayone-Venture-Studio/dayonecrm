import {
  getMonthlyPerformanceRows,
  formatCompactCurrency,
} from '@/lib/performance/getPerformanceDisplayData'
import {
  PERFORMANCE_STATUS_LABEL,
  PERFORMANCE_STATUS_COLOR,
} from '@/components/performance/performanceStatus'

export async function MonthlyPerformanceScreen() {
  const rows = await getMonthlyPerformanceRows()

  if (rows.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-black/40 text-2xl">
        No active startups to display
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-row w-full min-h-0 border-t border-black/15">
      {rows.map((row, index) => (
        <div
          key={row.id}
          className={`@container flex-1 min-w-0 flex flex-col items-center px-[2vw] pt-[4vh] pb-[3vh] ${
            index === rows.length - 1 ? '' : 'border-r border-black/15'
          }`}
        >
          <h2 className="w-full shrink-0 text-center truncate text-[2vw] leading-tight font-medium text-black">
            {row.name}
          </h2>

          <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-evenly">
            <div className="flex items-start justify-center">
              <span
                className="text-[8vw] leading-[0.85] font-medium tracking-tighter"
                style={{ color: '#ca2f2b' }}
              >
                {row.achieved}
              </span>
              <span
                className="text-[4vw] leading-none font-medium mt-[0.5vw] ml-[0.2vw]"
                style={{ color: '#ca2f2b' }}
              >
                %
              </span>
            </div>

            <div
              className="text-[1.7vw] font-medium"
              style={{ color: PERFORMANCE_STATUS_COLOR[row.status] }}
            >
              {PERFORMANCE_STATUS_LABEL[row.status]}
            </div>

            <div className="w-2/3 h-px" style={{ background: '#ca2f2b' }} />

            <div className="w-full flex flex-col items-center gap-[1.2vw]">
              <span className="text-[1vw] font-medium uppercase tracking-widest text-black/60">
                Revenue
              </span>
              <span className="text-[4vw] leading-none font-medium tracking-tight text-black">
                {formatCompactCurrency(row.revenue)}
              </span>
            </div>

            <div className="w-2/3 h-px bg-black/15" />

            <div className="w-full flex flex-col items-center gap-[1.2vw]">
              <span className="text-[1vw] font-medium uppercase tracking-widest text-black/60">
                Target
              </span>
              <span className="text-[4vw] leading-none font-medium tracking-tight text-black/85">
                {formatCompactCurrency(row.target)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
