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
          className={`flex-1 min-w-0 flex flex-col items-center pt-10 px-6 ${
            index === rows.length - 1 ? '' : 'border-r border-black/15'
          }`}
        >
          <h2 className="text-3xl font-medium text-black mb-10 text-center truncate w-full">
            {row.name}
          </h2>

          <div className="flex items-start justify-center mb-2">
            <span
              className="text-[140px] leading-none font-medium tracking-tighter"
              style={{ color: '#ca2f2b' }}
            >
              {row.achieved}
            </span>
            <span className="text-5xl font-medium mt-3 ml-1" style={{ color: '#ca2f2b' }}>
              %
            </span>
          </div>

          <div
            className="text-xl font-light mb-10"
            style={{ color: PERFORMANCE_STATUS_COLOR[row.status] }}
          >
            {PERFORMANCE_STATUS_LABEL[row.status]}
          </div>

          <div className="w-2/3 h-[1px] mb-10" style={{ background: '#ca2f2b' }} />

          <div className="w-full flex flex-col items-center mb-8">
            <span className="text-lg font-medium text-black mb-3">Revenue</span>
            <span className="text-[64px] leading-none font-medium tracking-tight text-black">
              {formatCompactCurrency(row.revenue)}
            </span>
          </div>

          <div className="w-2/3 h-[1px] bg-black/15 mb-10" />

          <div className="w-full flex flex-col items-center">
            <span className="text-sm font-medium text-black/60 mb-3">Target</span>
            <span className="text-[52px] leading-none font-medium tracking-tight text-black/85">
              {formatCompactCurrency(row.target)}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
