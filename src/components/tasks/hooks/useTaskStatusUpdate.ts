import { useState, useOptimistic, useTransition } from 'react'
import type { Task } from '@/types'
import { updateTaskStatusOptimistic } from '@/features/tasks/actions'

export function useTaskStatusUpdate(tasks: Task[], startupId: string) {
  // Optimistic state for task status updates
  const [optimisticTasks, updateOptimisticTasks] = useOptimistic(
    tasks,
    (currentTasks, updatedTask: { id: string; status: string }) => {
      return currentTasks.map((task) =>
        task.id === updatedTask.id
          ? { ...task, status: updatedTask.status as Task['status'] }
          : task
      )
    }
  )
  
  const [, startTransition] = useTransition()
  const [pendingUpdates, setPendingUpdates] = useState<Set<string>>(new Set())

  // Handler for optimistic status updates with race condition protection
  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    const originalTask = optimisticTasks.find((t) => t.id === taskId)
    if (!originalTask || originalTask.status === newStatus) return

    // Prevent concurrent updates on the same task
    if (pendingUpdates.has(taskId)) {
      console.warn(`Update already pending for task ${taskId}`)
      return
    }

    // Mark task as pending
    setPendingUpdates((prev) => new Set(prev).add(taskId))

    // Optimistically update the UI
    startTransition(() => {
      updateOptimisticTasks({ id: taskId, status: newStatus })
    })

    try {
      // Call the server action
      const result = await updateTaskStatusOptimistic(taskId, newStatus, startupId)

      // Handle errors - revert and log
      if (!result.success) {
        startTransition(() => {
          updateOptimisticTasks({ id: taskId, status: originalTask.status })
        })
        console.error('Failed to update task status:', result.error)
      }
    } catch (error) {
      // Handle unexpected errors
      startTransition(() => {
        updateOptimisticTasks({ id: taskId, status: originalTask.status })
      })
      console.error('handleStatusChange error:', error)
    } finally {
      // Remove task from pending set
      setPendingUpdates((prev) => {
        const newSet = new Set(prev)
        newSet.delete(taskId)
        return newSet
      })
    }
  }

  return {
    optimisticTasks,
    pendingUpdates,
    handleStatusChange,
  }
}
