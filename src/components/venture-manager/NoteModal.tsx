'use client'

import { useState, useEffect } from 'react'
import { createNote, updateNote } from '@/features/venture-manager/actions'
import type { NoteEntityType, NoteUrgency, NoteVisibility, VentureManagerNote } from '@/types'
import { X, Save, AlertCircle } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  entityType: NoteEntityType
  entityId: string
  entityName?: string
  existingNote?: VentureManagerNote | null
}

export function NoteModal({
  isOpen,
  onClose,
  onSuccess,
  entityType,
  entityId,
  entityName,
  existingNote = null,
}: Props) {
  const [noteText, setNoteText] = useState('')
  const [urgency, setUrgency] = useState<NoteUrgency>('MEDIUM')
  const [visibility, setVisibility] = useState<NoteVisibility>('ADMIN_ONLY')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (existingNote) {
      setNoteText(existingNote.note_text)
      setUrgency(existingNote.urgency)
      setVisibility(existingNote.visibility)
    } else {
      setNoteText('')
      setUrgency('MEDIUM')
      setVisibility('ADMIN_ONLY')
    }
    setError(null)
  }, [existingNote, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const formData = new FormData()
      
      if (existingNote) {
        formData.append('note_id', existingNote.id)
        formData.append('note_text', noteText)
        formData.append('urgency', urgency)
        formData.append('visibility', visibility)
        const result = await updateNote(formData)
        
        if (result.error) {
          setError(result.error)
        } else {
          onSuccess?.()
          onClose()
        }
      } else {
        formData.append('entity_type', entityType)
        formData.append('entity_id', entityId)
        formData.append('note_text', noteText)
        formData.append('urgency', urgency)
        formData.append('visibility', visibility)
        const result = await createNote(formData)
        
        if (result.error) {
          setError(result.error)
        } else {
          onSuccess?.()
          onClose()
        }
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const urgencyColors = {
    LOW: 'bg-gray-100 text-gray-800 border-gray-300',
    MEDIUM: 'bg-blue-100 text-blue-800 border-blue-300',
    HIGH: 'bg-orange-100 text-orange-800 border-orange-300',
    CRITICAL: 'bg-red-100 text-red-800 border-red-300',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: 'var(--color-surface)', borderRadius: 16, border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-lg)', width: '100%', maxWidth: 640, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--color-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text-primary)', margin: 0, letterSpacing: '-0.3px' }}>
              {existingNote ? 'Edit Note' : 'Add Note'}
            </h2>
            {entityName && (
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '4px 0 0 0' }}>
                <span style={{ textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>{entityType.replace('_', ' ')}</span> • {entityName}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              background: 'var(--color-surface-2)', border: 'none', borderRadius: 8, padding: 8,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-text-muted)'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Error Message */}
          {error && (
            <div style={{ background: 'rgba(202,47,43,0.1)', border: '1px solid rgba(202,47,43,0.2)', borderRadius: 8, padding: 16, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <AlertCircle size={20} color="#ca2f2b" style={{ flexShrink: 0, marginTop: 2 }} />
              <p style={{ margin: 0, fontSize: 14, color: '#ca2f2b', fontWeight: 500 }}>{error}</p>
            </div>
          )}

          {/* Note Text */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Note Content <span style={{ color: '#ca2f2b' }}>*</span>
            </label>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={5}
              required
              style={{
                width: '100%', padding: 16, borderRadius: 10,
                border: '1px solid var(--color-border)', background: 'var(--color-surface)',
                color: 'var(--color-text-primary)', fontSize: 15,
                outline: 'none', resize: 'none', fontFamily: 'inherit',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
              }}
              placeholder="Describe the concern, observation, or action item..."
              disabled={isSubmitting}
              className="focus:ring-2 focus:ring-[#ca2f2b]"
            />
            <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-muted)', textAlign: 'right' }}>
              {noteText.length} characters
            </p>
          </div>

          {/* Urgency Level */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Urgency Level
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as NoteUrgency[]).map((level) => {
                const isSelected = urgency === level
                let color = 'var(--color-text-muted)'
                let bg = 'var(--color-surface-2)'
                let border = 'var(--color-border)'

                if (isSelected) {
                  if (level === 'LOW') { color = '#059669'; bg = 'rgba(5,150,105,0.1)'; border = 'rgba(5,150,105,0.4)' }
                  if (level === 'MEDIUM') { color = '#0284c7'; bg = 'rgba(2,132,199,0.1)'; border = 'rgba(2,132,199,0.4)' }
                  if (level === 'HIGH') { color = '#d97706'; bg = 'rgba(217,119,6,0.1)'; border = 'rgba(217,119,6,0.4)' }
                  if (level === 'CRITICAL') { color = '#ca2f2b'; bg = 'rgba(202,47,43,0.1)'; border = 'rgba(202,47,43,0.4)' }
                }

                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setUrgency(level)}
                    disabled={isSubmitting}
                    style={{
                      padding: '12px 8px', borderRadius: 8, border: `2px solid ${border}`, background: bg, color: color,
                      fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', letterSpacing: '0.5px'
                    }}
                  >
                    {level}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Visibility */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Visibility
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { value: 'ADMIN_ONLY', label: 'Admin Only', desc: 'Only visible to admins and venture managers' },
                { value: 'SHARED_WITH_STARTUP', label: 'Shared with Startup', desc: "Visible to the startup's founders and staff members" }
              ].map((opt) => {
                const isSelected = visibility === opt.value
                return (
                  <label key={opt.value} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 16, padding: 16, borderRadius: 10,
                    border: `2px solid ${isSelected ? 'var(--color-brand)' : 'var(--color-border)'}`,
                    background: isSelected ? 'rgba(202,47,43,0.02)' : 'var(--color-surface)',
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}>
                    <input
                      type="radio"
                      name="visibility"
                      value={opt.value}
                      checked={isSelected}
                      onChange={(e) => setVisibility(e.target.value as NoteVisibility)}
                      disabled={isSubmitting}
                      style={{ marginTop: 2, accentColor: 'var(--color-brand)', width: 16, height: 16 }}
                    />
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 2 }}>{opt.label}</div>
                      <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{opt.desc}</div>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 16, paddingTop: 16, borderTop: '1px solid var(--color-border-subtle)', marginTop: 8 }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                flex: 1, padding: '14px 24px', borderRadius: 8, border: '1px solid var(--color-border)',
                background: 'var(--color-surface-2)', color: 'var(--color-text-primary)',
                fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !noteText.trim()}
              style={{
                flex: 1, padding: '14px 24px', borderRadius: 8, border: 'none',
                background: 'var(--color-brand)', color: '#fff',
                fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: (isSubmitting || !noteText.trim()) ? 0.5 : 1
              }}
            >
              {isSubmitting ? (
                <>
                  <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  {existingNote ? 'Update Note' : 'Create Note'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
