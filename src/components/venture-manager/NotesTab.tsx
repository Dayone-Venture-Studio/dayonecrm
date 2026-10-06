'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { NoteModal } from './NoteModal'
import { NotesList } from './NotesList'
import { Plus } from 'lucide-react'
import type { VentureManagerNoteWithProfile } from '@/types'

interface Props {
  notes: VentureManagerNoteWithProfile[]
  startupId: string
  startupName: string
}

export function NotesTab({ notes, startupId, startupName }: Props) {
  const router = useRouter()
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<VentureManagerNoteWithProfile | null>(null)

  const refresh = () => router.refresh()

  const openNew = () => {
    setEditingNote(null)
    setIsNoteModalOpen(true)
  }

  const openEdit = (note: VentureManagerNoteWithProfile) => {
    setEditingNote(note)
    setIsNoteModalOpen(true)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)' }}>
          Notes ({notes.length})
        </h3>
        <button
          onClick={openNew}
          style={{
            padding: '8px 16px', background: 'var(--color-brand)', color: '#fff',
            borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          <Plus size={16} /> Add Note
        </button>
      </div>
      <NotesList
        notes={notes}
        onEdit={openEdit}
        onRefresh={refresh}
      />
      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onSuccess={refresh}
        entityType={editingNote?.entity_type ?? 'STARTUP'}
        entityId={editingNote?.entity_id ?? startupId}
        entityName={editingNote ? editingNote.entity_type.replace('_', ' ') : startupName}
        existingNote={editingNote}
      />
    </div>
  )
}
