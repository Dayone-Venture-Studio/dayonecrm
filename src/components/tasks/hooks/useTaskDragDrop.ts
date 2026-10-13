import { useState, useRef } from 'react'
import type { Task } from '@/types'

export function useTaskDragDrop(handleStatusChange: (taskId: string, newStatus: Task['status']) => Promise<void>) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)
  const justDraggedRef = useRef(false)

  const handleDragStart = (task: Task) => {
    justDraggedRef.current = true
    setDraggedTask(task)
  }

  const handleDragEnd = () => {
    setDraggedTask(null)
    setDragOverColumn(null)
    setTimeout(() => {
      justDraggedRef.current = false
    }, 150)
  }

  const handleDragOver = (e: React.DragEvent, columnStatus: string) => {
    e.preventDefault()
    setDragOverColumn(columnStatus)
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    setDragOverColumn(null)

    if (!draggedTask || draggedTask.status === newStatus) {
      setDraggedTask(null)
      return
    }

    // Use optimistic update handler
    await handleStatusChange(draggedTask.id, newStatus as Task['status'])
    
    setDraggedTask(null)
  }

  return {
    draggedTask,
    dragOverColumn,
    justDraggedRef,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  }
}
