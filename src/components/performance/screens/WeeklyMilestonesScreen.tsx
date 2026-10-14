import { Fragment } from 'react'
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
    <div className="flex flex-1 w-full min-h-0 items-stretch border-t border-black/15 px-[2vw]">
      {rows.map((row, index) => (
        <Fragment key={row.id}>
          {index > 0 && (
            <div className="mx-[2vw] w-px shrink-0 self-stretch bg-black/15" />
          )}
          <div className="flex flex-1 min-w-0 flex-col px-4 pt-[4vh] pb-[3vh]">
            <h2 className="mb-[4vh] w-full shrink-0 truncate text-center text-[2vw] leading-tight font-medium text-black">
              {row.name}
            </h2>

            <div className="flex flex-1 min-h-0 w-full flex-col items-center gap-5">
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
                      className={`mx-auto flex w-full max-w-[40rem] flex-1 min-h-0 flex-col justify-center rounded-[40px] px-7 py-6 ${style.card}`}
                    >
                      <div
                        className="text-[4vw] leading-none font-medium tracking-tighter mb-2"
                        style={{ color: style.percent }}
                      >
                        {milestone.percent}%
                      </div>
                      <div className={`text-[1vw] font-medium leading-tight truncate ${style.text}`}>
                        {milestone.text}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </Fragment>
      ))}
    </div>
  )
}
