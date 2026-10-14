'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  currentName: string
  index: number
  total: number
  prevId: string
  nextId: string
  darkMode?: boolean
}

export function PerformanceScreenNav({ currentName, index, total, prevId, nextId, darkMode = false }: Props) {
  const router = useRouter()
  const go = (id: string) => router.push(`/performance/${id}`)

  const buttonClass = darkMode
    ? 'w-11 h-11 rounded-full border border-white/15 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shadow-sm disabled:opacity-40'
    : 'w-11 h-11 rounded-full border border-black/15 bg-white/60 hover:bg-white text-black flex items-center justify-center transition-colors shadow-sm disabled:opacity-40'

  const textColorClass = darkMode ? 'text-white/40' : 'text-black/40'
  const textColorClass2 = darkMode ? 'text-white/75' : 'text-black/75'
  const textColorClass3 = darkMode ? 'text-white/45' : 'text-black/45'

  return (
    <div className="flex items-center gap-3">
      <div className="text-right mr-1 hidden sm:block">
        <div className={`text-[1cqw] uppercase tracking-[0.22em] ${textColorClass}`}>
          Performance View
        </div>
        <div className={`text-[1cqw] font-medium ${textColorClass2} max-w-[260px] truncate`}>
          {currentName}
        </div>
      </div>

      <button
        type="button"
        onClick={() => go(prevId)}
        className={buttonClass}
        aria-label="Previous performance screen"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <span className={`text-[1cqw] ${textColorClass3} tabular-nums w-12 text-center`}>
        {index + 1} / {total}
      </span>

      <button
        type="button"
        onClick={() => go(nextId)}
        className={buttonClass}
        aria-label="Next performance screen"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  )
}
