import { Suspense } from 'react'
import { requireVentureManager } from '@/lib/auth/requireRole'
import { getAllNotes } from '@/lib/venture-manager/queries'
import { NotesList } from '@/components/venture-manager/NotesList'
import { TableSkeleton } from '@/components/layout/LoadingStates'
import type { Metadata } from 'next'

export const metadata: Metadata = { 
  title: 'Venture Manager Notes',
}

export default function VentureManagerNotesPage() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#1a1a1a]">Venture Manager Notes</h1>
        <p className="text-gray-600 mt-2">Review all notes and flags from venture managers</p>
      </div>

      <Suspense fallback={<TableSkeleton rows={6} />}>
        <NotesContent />
      </Suspense>
    </div>
  )
}

async function NotesContent() {
  await requireVentureManager()

  const allNotes = await getAllNotes()
  const activeNotes = allNotes.filter(n => !n.resolved)
  const resolvedNotes = allNotes.filter(n => n.resolved)
  const criticalNotes = activeNotes.filter(n => n.urgency === 'CRITICAL')

  return (
    <>
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-700">{criticalNotes.length}</div>
          <div className="text-sm text-red-600 mt-1">Critical Notes</div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-orange-700">{activeNotes.length}</div>
          <div className="text-sm text-orange-600 mt-1">Active Notes</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-700">{resolvedNotes.length}</div>
          <div className="text-sm text-green-600 mt-1">Resolved Notes</div>
        </div>
      </div>

      {/* Active Notes */}
      <div className="bg-white rounded-lg border border-[#e2dbbe] p-6">
        <h2 className="text-xl font-bold mb-4">Active Notes ({activeNotes.length})</h2>
        <NotesList notes={activeNotes} showEntityInfo />
      </div>

      {/* Resolved Notes */}
      <div className="bg-white rounded-lg border border-[#e2dbbe] p-6">
        <h2 className="text-xl font-bold mb-4">Resolved Notes ({resolvedNotes.length})</h2>
        <NotesList notes={resolvedNotes} showEntityInfo />
      </div>
    </>
  )
}
