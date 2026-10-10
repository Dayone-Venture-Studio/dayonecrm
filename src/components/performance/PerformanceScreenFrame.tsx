import type { ReactNode } from 'react'
import { PerformanceScreenNav } from './PerformanceScreenNav'

interface Props {
  name: string
  index: number
  total: number
  prevId: string
  nextId: string
  children: ReactNode
}

export function PerformanceScreenFrame({ name, index, total, prevId, nextId, children }: Props) {
  return (
    <div className="w-full h-full flex flex-col">
      <header className="flex items-start justify-between gap-6 px-12 pt-10 pb-6 shrink-0">
        <h1 className="text-[64px] leading-none font-medium tracking-tight text-black">
          {name}
        </h1>
        <div className="pt-2">
          <PerformanceScreenNav
            currentName={name}
            index={index}
            total={total}
            prevId={prevId}
            nextId={nextId}
          />
        </div>
      </header>

      <div className="flex-1 min-h-0 flex flex-col">{children}</div>

      <footer className="h-16 shrink-0 bg-[#ca2f2b] flex items-center justify-center">
        <span className="text-white font-bold text-2xl tracking-tighter">
          day<span className="font-normal">one</span>
        </span>
        <span className="text-[8px] text-white ml-1 leading-[8px] opacity-80">
          venture studio by iQue
        </span>
      </footer>
    </div>
  )
}
