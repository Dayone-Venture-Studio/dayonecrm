import { Suspense } from 'react'
import { requireVentureManager } from '@/lib/auth/requireRole'
import { getAllNotesWithContext } from '@/lib/venture-manager/queries'
import { MyNotesClient } from '@/components/venture-manager/MyNotesClient'
import { TableSkeleton } from '@/components/layout/LoadingStates'
import { DataLoadedSignal } from '@/components/layout/DataLoadedSignal'
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

  const allNotes = await getAllNotesWithContext()

  return (
    <>
      <DataLoadedSignal />
      <MyNotesClient notes={allNotes} />
    </>
  )
}
