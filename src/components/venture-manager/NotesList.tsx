'use client'

import { useState, type CSSProperties } from 'react'
import Link from 'next/link'
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
  Trash2,
  Building2,
  CornerDownRight,
} from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

type NoteItem = VentureManagerNoteWithProfile & {
  startup_id?: string | null
  startup_name?: string | null
  entity_label?: string | null
}

interface Props {
  notes: NoteItem[]
  onEdit?: (note: NoteItem) => void
  onRefresh?: () => void
  showEntityInfo?: boolean
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

export function NotesList({
  notes,
  onEdit,
  onRefresh,
  showEntityInfo = false,
}: Props) {
  const [resolvingId, setResolvingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean
    noteId: string | null
  }>({ isOpen: false, noteId: null })
  const [resolveConfirm, setResolveConfirm] = useState<{
    isOpen: boolean
    noteId: string | null
    currentlyResolved: boolean
  }>({ isOpen: false, noteId: null, currentlyResolved: false })
  const [reopenConfirm, setReopenConfirm] = useState<{
    isOpen: boolean
    noteId: string | null
  }>({ isOpen: false, noteId: null })

  const handleResolve = async (noteId: string) => {
    setResolvingId(noteId)
    try {
      const formData = new FormData()
      formData.append('note_id', noteId)
      formData.append('resolved', String(!resolveConfirm.currentlyResolved))
      await resolveNote({}, formData)
      onRefresh?.()
    } catch (err) {
      console.error('Failed to resolve note:', err)
    } finally {
      setResolvingId(null)
    }
  }

  const handleReopenNote = async (noteId: string) => {
    setResolvingId(noteId)
    try {
      const formData = new FormData()
      formData.append('note_id', noteId)
      formData.append('resolved', 'false')
      await resolveNote({}, formData)
      onRefresh?.()
    } catch (err) {
      console.error('Failed to reopen note:', err)
    } finally {
      setResolvingId(null)
    }
  }

  const handleDelete = async (noteId: string) => {
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

  const openDeleteConfirm = (noteId: string) => {
    setDeleteConfirm({ isOpen: true, noteId })
  }

  const closeDeleteConfirm = () => {
    setDeleteConfirm({ isOpen: false, noteId: null })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.noteId) return
    await handleDelete(deleteConfirm.noteId)
  }

  const openResolveConfirm = (noteId: string, currentlyResolved: boolean) => {
    setResolveConfirm({ isOpen: true, noteId, currentlyResolved })
  }

  const closeResolveConfirm = () => {
    setResolveConfirm({ isOpen: false, noteId: null, currentlyResolved: false })
  }

  const confirmResolve = async () => {
    if (!resolveConfirm.noteId) return
    await handleResolve(resolveConfirm.noteId)
  }

  const openReopenConfirm = (noteId: string) => {
    setReopenConfirm({ isOpen: true, noteId })
  }

  const closeReopenConfirm = () => {
    setReopenConfirm({ isOpen: false, noteId: null })
  }

  const confirmReopen = async () => {
    if (!reopenConfirm.noteId) return
    await handleReopenNote(reopenConfirm.noteId)
  }

  const visibilityIcons = {
    ADMIN_ONLY: <EyeOff size={11} />,
    SHARED_WITH_STARTUP: <Eye size={11} />,
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
        const accent = ACCENTS[note.urgency] ?? DEFAULT_ACCENT

        return (
          <div
            key={note.id}
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 12,
              padding: 20,
              boxShadow: '0 1px 2px rgba(30,27,24,0.04)',
              transition: 'box-shadow 0.2s, transform 0.2s',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0, flex: 1 }}>
                {showEntityInfo && (
                  note.startup_id && note.startup_name ? (
                    <Link
                      href={`/venture-manager/startups/${note.startup_id}`}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
                        fontSize: 13, fontWeight: 700, padding: '3px 10px', borderRadius: 999,
                        background: 'var(--color-brand-dim)', color: 'var(--color-brand)',
                        border: '1px solid var(--color-brand-glow)', textDecoration: 'none',
                      }}
                      title={`View ${note.startup_name}`}
                    >
                      <Building2 size={13} />
                      {note.startup_name}
                    </Link>
                  ) : (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
                      fontSize: 13, fontWeight: 700, padding: '3px 10px', borderRadius: 999,
                      background: 'var(--color-surface-3)', color: 'var(--color-text-muted)',
                      border: '1px solid var(--color-border)',
                    }}>
                      <Building2 size={13} />
                      Unknown startup
                    </span>
                  )
                )}

                {showEntityInfo && note.entity_label && note.entity_type !== 'STARTUP' && (
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

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                {onEdit && !note.resolved && (
                  <button 
                    onClick={() => onEdit(note)} 
                    style={{ 
                      background: 'transparent', 
                      border: 'none', 
                      cursor: 'pointer', 
                      padding: 4, 
                      color: 'var(--color-text-muted)',
                      transition: 'color 0.2s',
                    }} 
                    title="Edit note"
                    onMouseOver={(e) => {
                      e.currentTarget.style.color = 'var(--color-brand)'
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.color = 'var(--color-text-muted)'
                    }}
                  >
                    <Edit2 size={16} />
                  </button>
                )}
                <button
                  onClick={() => note.resolved ? openReopenConfirm(note.id) : openResolveConfirm(note.id, note.resolved)}
                  disabled={resolvingId === note.id}
                  style={{ 
                    background: 'transparent', 
                    border: 'none', 
                    cursor: resolvingId === note.id ? 'not-allowed' : 'pointer', 
                    padding: 4, 
                    color: note.resolved ? 'var(--color-text-muted)' : 'var(--color-success)', 
                    opacity: resolvingId === note.id ? 0.5 : 1,
                    transition: 'opacity 0.2s, color 0.2s',
                  }}
                  title={note.resolved ? 'Reopen note' : 'Mark as resolved'}
                  onMouseOver={(e) => {
                    if (resolvingId !== note.id) {
                      e.currentTarget.style.opacity = '0.7'
                    }
                  }}
                  onMouseOut={(e) => {
                    if (resolvingId !== note.id) {
                      e.currentTarget.style.opacity = '1'
                    }
                  }}
                >
                  {note.resolved ? <Circle size={16} /> : <CheckCircle size={16} />}
                </button>
                {!note.resolved && (
                  <button
                    onClick={() => openDeleteConfirm(note.id)}
                    disabled={deletingId === note.id}
                    style={{ 
                      background: 'transparent', 
                      border: 'none', 
                      cursor: deletingId === note.id ? 'not-allowed' : 'pointer', 
                      padding: 4, 
                      color: 'var(--color-text-muted)', 
                      opacity: deletingId === note.id ? 0.5 : 1,
                      transition: 'color 0.2s, opacity 0.2s',
                    }}
                    title="Delete note"
                    onMouseOver={(e) => {
                      if (deletingId !== note.id) {
                        e.currentTarget.style.color = 'var(--color-danger)'
                      }
                    }}
                    onMouseOut={(e) => {
                      if (deletingId !== note.id) {
                        e.currentTarget.style.color = 'var(--color-text-muted)'
                      }
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Note Text */}
            <p style={{ margin: 0, fontSize: 14, color: 'var(--color-text-primary)', lineHeight: 1.55 }}>
              {note.note_text}
            </p>

            {/* Footer: badges + metadata */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ ...BADGE_BASE, color: accent.color, background: accent.bg, border: `1px solid ${accent.border}` }}>
                  {note.urgency}
                </span>

                <span style={{ ...BADGE_BASE, color: 'var(--color-text-muted)', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                  {visibilityIcons[note.visibility]}
                  {note.visibility === 'ADMIN_ONLY' ? 'Admin only' : 'Shared'}
                </span>

                {note.resolved && (
                  <span style={{ ...BADGE_BASE, color: 'var(--color-success)', background: 'var(--color-success-dim)', border: '1px solid rgba(5,150,105,0.25)' }}>
                    <CheckCircle size={11} />
                    Resolved
                  </span>
                )}
              </div>

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
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-success)' }}>
                    <CheckCircle size={14} />
                    Resolved {new Date(note.resolved_at).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={closeDeleteConfirm}
        onConfirm={confirmDelete}
        title="Delete Note"
        message="Are you sure you want to delete this note? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        icon={<Trash2 size={20} />}
      />

      <ConfirmDialog
        isOpen={resolveConfirm.isOpen}
        onClose={closeResolveConfirm}
        onConfirm={confirmResolve}
        title="Mark as Resolved"
        message="Are you sure you want to mark this note as resolved? You can always reopen it later if needed."
        confirmText="Mark as Resolved"
        cancelText="Cancel"
        variant="success"
        icon={<CheckCircle size={20} />}
      />

      <ConfirmDialog
        isOpen={reopenConfirm.isOpen}
        onClose={closeReopenConfirm}
        onConfirm={confirmReopen}
        title="Reopen Note"
        message="Are you sure you want to reopen this note? This will move it back to active status."
        confirmText="Reopen Note"
        cancelText="Cancel"
        variant="warning"
        icon={<Circle size={20} />}
      />
    </div>
  )
}
