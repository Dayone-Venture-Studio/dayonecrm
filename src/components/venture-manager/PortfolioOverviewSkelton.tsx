export function PortfolioOverviewSkelton() {
  return (
    <div className="mx-auto flex flex-col gap-6 px-8 py-6">
      <div className="flex flex-col gap-2.5">
        <div className="skeleton h-[26px] w-[220px] rounded-[8px]" />
        <div className="skeleton h-4 w-[340px] rounded-[6px]" />
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-12 mt-5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-34 rounded-[12px]" />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5 mt-5">
        <div className="skeleton h-[260px] rounded-[16px]" />
        <div className="skeleton h-[260px] rounded-[16px]" />
      </div>
    </div>
  )
}
