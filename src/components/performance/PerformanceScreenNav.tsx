'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  currentName: string
  index: number
  total: number
  prevId: string
  nextId: string
}

export function PerformanceScreenNav({ currentName, index, total, prevId, nextId }: Props) {
  const router = useRouter()
  const go = (id: string) => router.push(`/performance/${id}`)

  const buttonClass =
    'w-11 h-11 rounded-full border border-black/15 bg-white/60 hover:bg-white text-black flex items-center justify-center transition-colors shadow-sm disabled:opacity-40'

  return (
    <div className="flex items-center gap-3">
      <div className="text-right mr-1 hidden sm:block">
        <div className="text-[10px] uppercase tracking-[0.22em] text-black/40">
          Performance View
        </div>
        <div className="text-sm font-medium text-black/75 max-w-[260px] truncate">
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

      <span className="text-sm text-black/45 tabular-nums w-12 text-center">
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
