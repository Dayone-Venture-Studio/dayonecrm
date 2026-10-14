'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { FounderNotesList } from './FounderNotesList'
import { Search, X, AlertTriangle, Bell, CheckCircle } from 'lucide-react'
import type { VentureManagerNoteWithContext } from '@/types'

interface Props {
  notes: VentureManagerNoteWithContext[]
  unacknowledgedCount: number
}

type StatusFilter = 'ALL' | 'UNACKNOWLEDGED' | 'ACKNOWLEDGED'

export function FounderNotesClient({ notes, unacknowledgedCount }: Props) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [urgency, setUrgency] = useState<string>('ALL')
  const [status, setStatus] = useState<StatusFilter>('ALL')

  const criticalCount = notes.filter((n) => n.urgency === 'CRITICAL' && !n.acknowledged).length
  const acknowledgedCount = notes.filter((n) => n.acknowledged).length

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return notes.filter((note) => {
      if (status === 'UNACKNOWLEDGED' && note.acknowledged) return false
      if (status === 'ACKNOWLEDGED' && !note.acknowledged) return false
      if (urgency !== 'ALL' && note.urgency !== urgency) return false
      if (q) {
        const haystack = [
          note.note_text,
          note.entity_label ?? '',
          note.entity_type,
          note.creator?.full_name ?? '',
        ]
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [notes, query, urgency, status])

  const hasFilters = query.trim() !== '' || urgency !== 'ALL' || status !== 'ALL'

  const clearFilters = () => {
    setQuery('')
    setUrgency('ALL')
    setStatus('ALL')
  }

  const handleRefresh = () => {
    router.refresh()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <StatCard
          icon={<AlertTriangle size={18} />}
          value={criticalCount}
          label="Critical Unacknowledged"
          color="var(--color-danger)"
          dim="var(--color-danger-dim)"
        />
        <StatCard
          icon={<Bell size={18} />}
          value={unacknowledgedCount}
          label="Needs Acknowledgement"
          color="var(--color-warning)"
          dim="var(--color-warning-dim)"
        />
        <StatCard
          icon={<CheckCircle size={18} />}
          value={acknowledgedCount}
          label="Acknowledged"
          color="var(--color-success)"
          dim="var(--color-success-dim)"
        />
      </div>

      {/* Filter bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 12,
          padding: 16,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 12,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flex: '1 1 240px',
            minWidth: 200,
            padding: '8px 12px',
            background: 'var(--color-surface-2)',
            border: '1px solid var(--color-border)',
            borderRadius: 8,
          }}
        >
          <Search size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes..."
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: 14,
              width: '100%',
              color: 'var(--color-text-primary)',
            }}
          />
        </div>

        <Select value={urgency} onChange={setUrgency}>
          <option value="ALL">All urgency</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </Select>

        <div style={{ display: 'inline-flex', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 8, padding: 3 }}>
          {(['ALL', 'UNACKNOWLEDGED', 'ACKNOWLEDGED'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              style={{
                padding: '6px 14px',
                fontSize: 12,
                fontWeight: 700,
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                background: status === s ? 'var(--color-brand)' : 'transparent',
                color: status === s ? '#fff' : 'var(--color-text-secondary)',
              }}
            >
              {s === 'ALL' ? `All (${notes.length})` : s === 'UNACKNOWLEDGED' ? `New (${unacknowledgedCount})` : `Done (${acknowledgedCount})`}
            </button>
          ))}
        </div>

        {hasFilters && (
          <button
            onClick={clearFilters}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '8px 12px',
              fontSize: 12,
              fontWeight: 600,
              borderRadius: 8,
              border: '1px solid var(--color-border)',
              background: 'transparent',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
            }}
          >
            <X size={14} />
            Clear
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 48 }}>
          <div className="empty-state-icon">📝</div>
          <h3>
            {hasFilters
              ? 'No notes match your filters'
              : status !== 'ALL'
              ? 'No notes in this category'
              : 'No notes from your venture managers'}
          </h3>
          <p>{hasFilters ? 'Try clearing the search or filters.' : 'Notes from your venture managers will appear here.'}</p>
        </div>
      ) : (
        <section>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 12px 0' }}>
            {status !== 'ALL' ? (status === 'UNACKNOWLEDGED' ? 'Needs Your Acknowledgement' : 'Acknowledged Notes') : 'All Notes'}{' '}
            <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>({filtered.length})</span>
          </h2>
          <FounderNotesList notes={filtered} onRefresh={handleRefresh} />
        </section>
      )}
    </div>
  )
}

function StatCard({
  icon,
  value,
  label,
  color,
  dim,
}: {
  icon: React.ReactNode
  value: number
  label: string
  color: string
  dim: string
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: 16,
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 12,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 40,
          height: 40,
          borderRadius: 10,
          background: dim,
          color,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>{label}</div>
      </div>
    </div>
  )
}

function Select({
  value,
  onChange,
  children,
}: {
  value: string
  onChange: (v: string) => void
  children: React.ReactNode
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        padding: '8px 12px',
        fontSize: 13,
        fontWeight: 600,
        borderRadius: 8,
        border: '1px solid var(--color-border)',
        background: 'var(--color-surface-2)',
        color: 'var(--color-text-primary)',
        cursor: 'pointer',
      }}
    >
      {children}
    </select>
  )
}
