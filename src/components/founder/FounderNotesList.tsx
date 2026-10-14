'use client'

import { useState, type CSSProperties } from 'react'
import { acknowledgeNote, unacknowledgeNote } from '@/features/venture-manager/actions'
import type { VentureManagerNoteWithContext } from '@/types'
import {
  CheckCircle,
  Flag,
  Clock,
  User,
  CornerDownRight,
  ThumbsUp,
} from 'lucide-react'

interface Props {
  notes: VentureManagerNoteWithContext[]
  onRefresh?: () => void
}

const ENTITY_LABELS: Record<string, string> = {
  STARTUP: 'Startup note',
  TASK: 'Task',
  WEEKLY_PLAN: 'Weekly plan',
}

const ACCENTS: Record<string, { color: string; bg: string; border: string }> = {
  LOW: { color: 'var(--color-success)', bg: 'var(--color-success-dim)', border: 'rgba(5,150,105,0.25)' },
  MEDIUM: { color: 'var(--color-info)', bg: 'var(--color-info-dim)', border: 'rgba(2,132,199,0.25)' },
  HIGH: { color: 'var(--color-warning)', bg: 'var(--color-warning-dim)', border: 'rgba(217,119,6,0.25)' },
  CRITICAL: { color: 'var(--color-danger)', bg: 'var(--color-danger-dim)', border: 'rgba(202,47,43,0.25)' },
}

const DEFAULT_ACCENT = ACCENTS.MEDIUM

const BADGE_BASE: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  fontSize: 10,
  fontWeight: 800,
  padding: '3px 8px',
  borderRadius: 999,
  letterSpacing: '0.4px',
  textTransform: 'uppercase',
}

export function FounderNotesList({
  notes,
  onRefresh,
}: Props) {
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const handleToggleAcknowledge = async (noteId: string, isAcknowledged: boolean) => {
    setTogglingId(noteId)
    try {
      const formData = new FormData()
      formData.append('note_id', noteId)
      
      const result = isAcknowledged 
        ? await unacknowledgeNote({}, formData)
        : await acknowledgeNote({}, formData)
      
      if (result.error) {
        window.alert(result.error)
      } else {
        onRefresh?.()
      }
    } catch (err) {
      console.error('Failed to toggle acknowledgement:', err)
      window.alert('An error occurred')
    } finally {
      setTogglingId(null)
    }
  }

  if (notes.length === 0) {
    return (
      <div style={{
        background: 'var(--color-surface-2)', borderRadius: 12, padding: 32,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        border: '1px dashed var(--color-border)', color: 'var(--color-text-muted)',
      }}>
        <Flag size={32} style={{ marginBottom: 12, opacity: 0.5 }} />
        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>No notes yet</p>
        <p style={{ margin: '4px 0 0 0', fontSize: 13 }}>Notes from your venture managers will appear here</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {notes.map((note) => {
        const accent = ACCENTS[note.urgency] ?? DEFAULT_ACCENT
        const isToggling = togglingId === note.id

        return (
          <div
            key={note.id}
            style={{
              background: 'var(--color-surface)',
              border: `2px solid ${accent.border}`,
              borderRadius: 12,
              padding: 20,
              boxShadow: '0 2px 4px rgba(30,27,24,0.06)',
              transition: 'all 0.2s',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0, flex: 1 }}>
                {note.entity_label && note.entity_type !== 'STARTUP' && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5, alignSelf: 'flex-start', maxWidth: 420,
                    fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)',
                  }}>
                    <CornerDownRight size={13} style={{ flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ENTITY_LABELS[note.entity_type] ?? note.entity_type}: {note.entity_label}
                    </span>
                  </span>
                )}
              </div>

              {/* Acknowledge Icon Button */}
              <button
                onClick={() => handleToggleAcknowledge(note.id, note.acknowledged)}
                disabled={isToggling}
                title={note.acknowledged ? 'Click to un-acknowledge' : 'Click to acknowledge'}
                style={{
                  padding: 10,
                  borderRadius: 8,
                  border: 'none',
                  background: note.acknowledged ? 'transparent' : 'var(--color-surface-2)',
                  color: note.acknowledged ? 'var(--color-success)' : 'var(--color-text-secondary)',
                  cursor: isToggling ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: isToggling ? 0.6 : 1,
                  transition: 'all 0.2s',
                  flexShrink: 0,
                }}
                onMouseOver={(e) => {
                  if (!isToggling) {
                    e.currentTarget.style.background = note.acknowledged ? 'var(--color-danger-dim)' : 'var(--color-success-dim)'
                    e.currentTarget.style.color = note.acknowledged ? 'var(--color-danger)' : 'var(--color-success)'
                  }
                }}
                onMouseOut={(e) => {
                  if (!isToggling) {
                    e.currentTarget.style.background = note.acknowledged ? 'transparent' : 'var(--color-surface-2)'
                    e.currentTarget.style.color = note.acknowledged ? 'var(--color-success)' : 'var(--color-text-secondary)'
                  }
                }}
              >
                {isToggling ? (
                  <div style={{ width: 20, height: 20, border: '2px solid rgba(0,0,0,0.1)', borderTopColor: 'var(--color-text-secondary)', borderRadius: '50%' }} className="animate-spin" />
                ) : (
                  <ThumbsUp size={20} fill={note.acknowledged ? 'currentColor' : 'none'} />
                )}
              </button>
            </div>

            {/* Note Text */}
            <p style={{ margin: 0, fontSize: 14, color: 'var(--color-text-primary)', lineHeight: 1.55, marginBottom: 16 }}>
              {note.note_text}
            </p>

            {/* Footer: badges + metadata */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ ...BADGE_BASE, color: accent.color, background: accent.bg, border: `1px solid ${accent.border}` }}>
                  {note.urgency}
                </span>

                {note.acknowledged && (
                  <span style={{ ...BADGE_BASE, color: 'var(--color-success)', background: 'var(--color-success-dim)', border: '1px solid rgba(5,150,105,0.25)' }}>
                    <CheckCircle size={11} />
                    Acknowledged
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 500, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <User size={14} />
                  {note.creator?.full_name || 'VM'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={14} />
                  {new Date(note.created_at).toLocaleDateString()}
                </div>
                {note.acknowledged && note.acknowledged_at && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-success)' }}>
                    <CheckCircle size={14} />
                    {note.acknowledger?.full_name ? `By ${note.acknowledger.full_name}` : 'By you'} • {new Date(note.acknowledged_at).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
