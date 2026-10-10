import { getWeeklyMilestoneRows } from '@/lib/performance/getPerformanceDisplayData'

const CARD_STYLES = [
  {
    card: 'bg-[#ca2f2b]',
    percent: '#ffffff',
    text: 'text-white/90',
  },
  {
    card: 'bg-[#f6f2db] border-2 border-[#ca2f2b]',
    percent: '#111111',
    text: 'text-black/70',
  },
  {
    card: 'bg-black',
    percent: '#f6f2db',
    text: 'text-[#f6f2db]/80',
  },
]

export async function WeeklyMilestonesScreen() {
  const rows = await getWeeklyMilestoneRows()

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
          className={`flex-1 min-w-0 flex flex-col px-6 pt-10 pb-6 ${
            index === rows.length - 1 ? '' : 'border-r border-black/15'
          }`}
        >
          <h2 className="text-3xl font-medium text-black mb-8 text-center truncate w-full">
            {row.name}
          </h2>

          <div className="flex flex-col gap-5 flex-1 min-h-0 w-full">
            {row.milestones.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-black/30 text-sm">
                No milestones yet
              </div>
            ) : (
              row.milestones.slice(0, CARD_STYLES.length).map((milestone, i) => {
                const style = CARD_STYLES[i]
                return (
                  <div
                    key={i}
                    className={`flex-1 min-h-0 flex flex-col justify-center rounded-[40px] px-7 py-6 ${style.card}`}
                  >
                    <div
                      className="text-[64px] leading-none font-medium tracking-tighter mb-2"
                      style={{ color: style.percent }}
                    >
                      {milestone.percent}%
                    </div>
                    <div className={`text-sm font-medium leading-tight ${style.text}`}>
                      {milestone.text}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
