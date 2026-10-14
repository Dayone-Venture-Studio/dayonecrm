'use client'

import { useMemo, useState, type ReactNode } from 'react'
import { AlertTriangle, Bell, CheckCircle, Search, X } from 'lucide-react'
import { NotesList } from './NotesList'
import type { VentureManagerNoteWithContext } from '@/types'

interface Props {
  notes: VentureManagerNoteWithContext[]
}

type StatusFilter = 'ACTIVE' | 'RESOLVED'

export function MyNotesClient({ notes }: Props) {
  const [query, setQuery] = useState('')
  const [startupId, setStartupId] = useState<string>('ALL')
  const [urgency, setUrgency] = useState<string>('ALL')
  const [status, setStatus] = useState<StatusFilter>('ACTIVE')

  // Startup options derived from the notes themselves (only startups that have notes)
  const startups = useMemo(() => {
    const map = new Map<string, string>()
    for (const note of notes) {
      if (note.startup_id && note.startup_name) map.set(note.startup_id, note.startup_name)
    }
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [notes])

  const criticalCount = notes.filter((n) => !n.resolved && n.urgency === 'CRITICAL').length
  const activeCount = notes.filter((n) => !n.resolved).length
  const resolvedCount = notes.filter((n) => n.resolved).length

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return notes.filter((note) => {
      if (status === 'ACTIVE' && note.resolved) return false
      if (status === 'RESOLVED' && !note.resolved) return false
      if (urgency !== 'ALL' && note.urgency !== urgency) return false
      if (startupId !== 'ALL' && note.startup_id !== startupId) return false
      if (q) {
        const haystack = [
          note.note_text,
          note.startup_name ?? '',
          note.entity_label ?? '',
          note.entity_type,
        ]
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [notes, query, startupId, urgency, status])

  const hasFilters = query.trim() !== '' || startupId !== 'ALL' || urgency !== 'ALL'

  const clearFilters = () => {
    setQuery('')
    setStartupId('ALL')
    setUrgency('ALL')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <StatCard
          icon={<AlertTriangle size={18} />}
          value={criticalCount}
          label="Critical"
          color="var(--color-danger)"
          dim="var(--color-danger-dim)"
        />
        <StatCard
          icon={<Bell size={18} />}
          value={activeCount}
          label="Active"
          color="var(--color-warning)"
          dim="var(--color-warning-dim)"
        />
        <StatCard
          icon={<CheckCircle size={18} />}
          value={resolvedCount}
          label="Resolved"
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
            placeholder="Search notes, startups, tasks…"
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

        <Select value={startupId} onChange={setStartupId}>
          <option value="ALL">All startups</option>
          {startups.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>

        <Select value={urgency} onChange={setUrgency}>
          <option value="ALL">All urgency</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </Select>

        <div style={{ display: 'inline-flex', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 8, padding: 3 }}>
          {(['ACTIVE', 'RESOLVED'] as StatusFilter[]).map((s) => (
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
              {s === 'ACTIVE' ? `Active (${activeCount})` : `Resolved (${resolvedCount})`}
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
          <h3>{hasFilters ? 'No notes match your filters' : status === 'RESOLVED' ? 'No resolved notes yet' : 'No active notes'}</h3>
          <p>{hasFilters ? 'Try clearing the search or filters.' : 'Notes you add from a startup page will appear here.'}</p>
        </div>
      ) : (
        <section>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 12px 0' }}>
            {status === 'ACTIVE' ? 'Active Notes' : 'Resolved Notes'}{' '}
            <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>({filtered.length})</span>
          </h2>
          <NotesList notes={filtered} showEntityInfo />
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
  icon: ReactNode
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
  children: ReactNode
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
