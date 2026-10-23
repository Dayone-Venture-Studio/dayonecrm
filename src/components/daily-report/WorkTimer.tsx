/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useServerAction } from '@/lib/hooks/useServerAction'
import { endWorkSession } from '@/features/team/report-actions'

interface Props {
  startTime: string
  endedAt?: string | null
  reportDate?: string
  userName?: string
  roleLabel?: string
  email?: string
  department?: string | null
  phone?: string | null
}

function formatElapsed(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':')
}

export function WorkTimer({ startTime, endedAt, reportDate, userName, roleLabel, email, department, phone }: Props) {
  const router = useRouter()
  const [elapsed, setElapsed] = useState(0)

  const [executeEnd, endPending] = useServerAction({
    onSuccess: () => {
      router.refresh()
    },
  })

  const isEnded = Boolean(endedAt)

  useEffect(() => {
    if (isEnded) {
      const start = new Date(startTime).getTime()
      const end = new Date(endedAt as string).getTime()
      setElapsed(Math.max(0, Math.floor((end - start) / 1000)))
      return
    }
    const start = new Date(startTime).getTime()
    const tick = () => {
      const now = Date.now()
      setElapsed(Math.max(0, Math.floor((now - start) / 1000)))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [startTime, endedAt, isEnded])

  function handleLogOff() {
    const fd = new FormData()
    if (reportDate) fd.set('report_date', reportDate)
    executeEnd(() => endWorkSession({}, fd), {
      success: { title: 'Session ended', description: 'Your working time has been recorded.' },
      error: (err) => ({ title: 'Could not end session', description: err }),
    })
  }

  const startedLabel = new Date(startTime).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  const initial = (userName || 'U').trim().charAt(0).toUpperCase()

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 20,
        padding: 20,
      }}
    >
      {/* Left: profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0, flex: '1 1 220px' }}>
        <div
          style={{
            width: 104,
            height: 104,
            borderRadius: '50%',
            background: 'var(--color-brand-dim, rgba(202,47,43,0.1))',
            color: 'var(--color-brand, #ca2f2b)',
            border: '1px solid rgba(202, 47, 43, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 40,
            fontWeight: 800,
            flexShrink: 0,
          }}
        >
          {initial}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.2 }}>
            {userName || 'Employee'}
          </div>
          <div style={{ fontSize: 17, color: 'var(--color-text-secondary)', marginTop: 6 }}>
            {roleLabel || 'Employee'}
          </div>
          {email && (
            <div
              style={{
                fontSize: 15,
                color: 'var(--color-text-muted)',
                marginTop: 4,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {email}
            </div>
          )}
          {department && (
            <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 4 }}>
              Department: {department}
            </div>
          )}
          {phone && (
            <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 2 }}>
              Phone: {phone}
            </div>
          )}
        </div>
      </div>

      {/* Right: timer */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: '0 0 auto' }}>
        <div style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 600 }}>
          {isEnded ? `Session ended at ${new Date(endedAt as string).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : `Work session started at ${startedLabel}`}
        </div>
        <div
          style={{
            fontSize: 36,
            fontWeight: 800,
            letterSpacing: 2,
            color: 'var(--color-text-primary)',
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1,
          }}
          aria-live={isEnded ? 'off' : 'polite'}
        >
          {formatElapsed(elapsed)}
        </div>
        <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
          {isEnded ? 'Total working time' : 'Elapsed time'}
        </div>
        {!isEnded && (
          <button
            type="button"
            className="btn btn-danger btn-sm"
            disabled={endPending}
            onClick={handleLogOff}
            style={{ minHeight: 36, marginTop: 4 }}
          >
            {endPending ? 'Ending…' : 'Log Off'}
          </button>
        )}
      </div>
    </div>
  )
}