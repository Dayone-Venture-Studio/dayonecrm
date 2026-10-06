'use client'

import { useState } from 'react'
import { resolveNote, deleteNote } from '@/features/venture-manager/actions'
import type { VentureManagerNoteWithProfile } from '@/types'
import { 
  CheckCircle, 
  Circle, 
  Edit2, 
  Flag,
  Eye,
  EyeOff,
  Clock,
  User,
  Trash2
} from 'lucide-react'

interface Props {
  notes: VentureManagerNoteWithProfile[]
  onEdit?: (note: VentureManagerNoteWithProfile) => void
  onRefresh?: () => void
  showEntityInfo?: boolean
}

export function NotesList({
  notes,
  onEdit,
  onRefresh,
  showEntityInfo = false,
}: Props) {
  const [resolvingId, setResolvingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleResolve = async (noteId: string, resolved: boolean) => {
    setResolvingId(noteId)
    try {
      const formData = new FormData()
      formData.append('note_id', noteId)
      formData.append('resolved', String(!resolved))
      await resolveNote({}, formData)
      onRefresh?.()
    } catch (err) {
      console.error('Failed to resolve note:', err)
    } finally {
      setResolvingId(null)
    }
  }

  const handleDelete = async (noteId: string) => {
    if (!window.confirm('Delete this note?')) return
    setDeletingId(noteId)
    try {
      const result = await deleteNote(noteId)
      if (result.error) {
        window.alert(result.error)
        return
      }
      onRefresh?.()
    } catch (err) {
      console.error('Failed to delete note:', err)
    } finally {
      setDeletingId(null)
    }
  }

  const urgencyColors = {
    LOW: 'bg-gray-100 text-gray-800 border-gray-200',
    MEDIUM: 'bg-blue-100 text-blue-800 border-blue-200',
    HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
    CRITICAL: 'bg-red-100 text-red-800 border-red-200',
  }

  const visibilityIcons = {
    ADMIN_ONLY: <EyeOff className="w-3 h-3" />,
    SHARED_WITH_STARTUP: <Eye className="w-3 h-3" />,
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
        <p style={{ margin: '4px 0 0 0', fontSize: 13 }}>Create your first note to track concerns or observations</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {notes.map((note) => {
        let borderColor = 'var(--color-border)'
        let bgColor = 'var(--color-surface)'
        let badgeColor = 'var(--color-text-muted)'
        let badgeBg = 'var(--color-surface-2)'
        let badgeBorder = 'var(--color-border)'

        if (!note.resolved) {
          if (note.urgency === 'LOW') { badgeColor = '#059669'; badgeBg = 'rgba(5,150,105,0.1)'; badgeBorder = 'rgba(5,150,105,0.2)'; borderColor = 'rgba(5,150,105,0.3)' }
          if (note.urgency === 'MEDIUM') { badgeColor = '#0284c7'; badgeBg = 'rgba(2,132,199,0.1)'; badgeBorder = 'rgba(2,132,199,0.2)'; borderColor = 'rgba(2,132,199,0.3)' }
          if (note.urgency === 'HIGH') { badgeColor = '#d97706'; badgeBg = 'rgba(217,119,6,0.1)'; badgeBorder = 'rgba(217,119,6,0.2)'; borderColor = 'rgba(217,119,6,0.3)' }
          if (note.urgency === 'CRITICAL') { badgeColor = '#ca2f2b'; badgeBg = 'rgba(202,47,43,0.1)'; badgeBorder = 'rgba(202,47,43,0.2)'; borderColor = 'rgba(202,47,43,0.3)' }
        } else {
          bgColor = 'var(--color-surface-2)'
          borderColor = 'transparent'
        }

        return (
          <div key={note.id} style={{
            background: bgColor, borderRadius: 12, border: `1px solid ${borderColor}`,
            padding: 20, transition: 'all 0.2s',
            opacity: note.resolved ? 0.7 : 1,
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {/* Urgency Badge */}
                <span style={{
                  fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 4, letterSpacing: '0.5px',
                  color: badgeColor, background: badgeBg, border: `1px solid ${badgeBorder}`
                }}>
                  {note.urgency}
                </span>

                {/* Entity Type */}
                {showEntityInfo && (
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, letterSpacing: '0.5px', background: 'rgba(0,0,0,0.05)', color: 'var(--color-text-primary)' }}>
                    {note.entity_type.replace('_', ' ')}
                  </span>
                )}

                {/* Visibility */}
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, letterSpacing: '0.5px', background: 'rgba(0,0,0,0.05)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {visibilityIcons[note.visibility]}
                  {note.visibility === 'ADMIN_ONLY' ? 'ADMIN ONLY' : 'SHARED'}
                </span>

                {/* Resolved Status */}
                {note.resolved && (
                  <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 4, letterSpacing: '0.5px', background: 'rgba(5,150,105,0.1)', color: '#059669', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle size={12} />
                    RESOLVED
                  </span>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {onEdit && !note.resolved && (
                  <button onClick={() => onEdit(note)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--color-text-muted)' }} title="Edit note">
                    <Edit2 size={16} />
                  </button>
                )}
                <button
                  onClick={() => handleResolve(note.id, note.resolved)}
                  disabled={resolvingId === note.id}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, color: note.resolved ? 'var(--color-text-muted)' : '#059669', opacity: resolvingId === note.id ? 0.5 : 1 }}
                  title={note.resolved ? 'Reopen note' : 'Mark as resolved'}
                >
                  {note.resolved ? <Circle size={16} /> : <CheckCircle size={16} />}
                </button>
                {!note.resolved && (
                  <button
                    onClick={() => handleDelete(note.id)}
                    disabled={deletingId === note.id}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--color-text-muted)', opacity: deletingId === note.id ? 0.5 : 1 }}
                    title="Delete note"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Note Text */}
            <p style={{ margin: '0 0 16px 0', fontSize: 14, color: 'var(--color-text-primary)', lineHeight: 1.5, textDecoration: note.resolved ? 'line-through' : 'none', opacity: note.resolved ? 0.7 : 1 }}>
              {note.note_text}
            </p>

            {/* Metadata */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 500 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <User size={14} />
                {note.creator?.full_name || 'Unknown'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={14} />
                {new Date(note.created_at).toLocaleDateString()}
              </div>
              {note.resolved && note.resolved_at && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#059669' }}>
                  <CheckCircle size={14} />
                  Resolved {new Date(note.resolved_at).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
