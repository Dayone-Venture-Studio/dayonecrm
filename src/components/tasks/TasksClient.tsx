'use client'

import { useActionState, useState } from 'react'
import { deleteTask } from '@/features/tasks/actions'
import { TaskEditModal } from '@/components/tasks/TaskEditModal'
import { TaskCreateModal } from '@/components/tasks/TaskCreateModal'
import { TaskDetailModal } from '@/components/tasks/TaskDetailModal'
import { TaskToolbar } from './components/TaskToolbar'
import { TaskKanbanColumn } from './components/TaskKanbanColumn'
import { useTaskStatusUpdate } from './hooks/useTaskStatusUpdate'
import { useTaskDragDrop } from './hooks/useTaskDragDrop'
import { useTaskFilters } from './hooks/useTaskFilters'
import type { TasksClientProps } from './types'
import type { ActionState, Task } from '@/types'
import { ClipboardList, Rocket, CheckCheck } from 'lucide-react'

export function TasksClient({
  startupId,
  tasks,
  domains,
  weeklyPlans,
  staffMembers,
  isFounder = false,
  isStaff = false,
  currentUserId,
  currentPlanId,
}: TasksClientProps) {
  // Permissions
  const canCreateTask = isFounder || isStaff
  const canEditTask = (task: Task) => isFounder || (isStaff && task.created_by === currentUserId)
  const canDeleteTask = isFounder
  
  // Delete action state
  const [deleteState, deleteAction, deletePending] = useActionState<ActionState, FormData>(deleteTask, {})

  // Modal states
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [viewingTask, setViewingTask] = useState<Task | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Custom hooks
  const { optimisticTasks, pendingUpdates, handleStatusChange } = useTaskStatusUpdate(tasks, startupId)
  const dragDropHandlers = useTaskDragDrop(handleStatusChange)
  const { filterDomain, setFilterDomain, organizedTasks } = useTaskFilters(optimisticTasks)

  // Delete handler
  const handleDelete = (taskId: string) => {
    const formData = new FormData()
    formData.append('id', taskId)
    deleteAction(formData)
  }

  return (
    <div>
      {deleteState?.error && (
        <div className="alert alert-error mb-20">
          {deleteState.error}
        </div>
      )}
      {deleteState?.success && (
        <div className="alert alert-success mb-20">
          {deleteState.success}
        </div>
      )}

      <TaskToolbar
        domains={domains}
        filterDomain={filterDomain}
        onFilterChange={setFilterDomain}
        canCreateTask={canCreateTask}
        onCreateTask={() => setShowCreateForm(true)}
      />

      {optimisticTasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>No tasks yet</h3>
          <p>Create a task to start tracking work</p>
        </div>
      ) : (
        <div className="grid gap-5 items-start grid-cols-[repeat(auto-fit,minmax(300px,1fr))]">
          <TaskKanbanColumn
            title="TODO"
            icon={<ClipboardList size={16} />}
            status="TODO"
            tasks={organizedTasks.todo}
            count={organizedTasks.todo.length}
            badgeClass="badge-neutral"
            dragOverColumn={dragDropHandlers.dragOverColumn}
            draggedTask={dragDropHandlers.draggedTask}
            justDraggedRef={dragDropHandlers.justDraggedRef}
            pendingUpdates={pendingUpdates}
            domains={domains}
            staffMembers={staffMembers}
            canEditTask={canEditTask}
            canDeleteTask={canDeleteTask}
            onDragOver={dragDropHandlers.handleDragOver}
            onDragLeave={dragDropHandlers.handleDragLeave}
            onDrop={dragDropHandlers.handleDrop}
            onDragStart={dragDropHandlers.handleDragStart}
            onDragEnd={dragDropHandlers.handleDragEnd}
            onEdit={setEditingTask}
            onView={setViewingTask}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
          />

          <TaskKanbanColumn
            title="IN PROGRESS"
            icon={<Rocket size={16} />}
            status="IN_PROGRESS"
            tasks={organizedTasks.inProgress}
            count={organizedTasks.inProgress.length}
            badgeClass="badge-info"
            borderColor="var(--color-info)"
            dragOverColumn={dragDropHandlers.dragOverColumn}
            draggedTask={dragDropHandlers.draggedTask}
            justDraggedRef={dragDropHandlers.justDraggedRef}
            pendingUpdates={pendingUpdates}
            domains={domains}
            staffMembers={staffMembers}
            canEditTask={canEditTask}
            canDeleteTask={canDeleteTask}
            onDragOver={dragDropHandlers.handleDragOver}
            onDragLeave={dragDropHandlers.handleDragLeave}
            onDrop={dragDropHandlers.handleDrop}
            onDragStart={dragDropHandlers.handleDragStart}
            onDragEnd={dragDropHandlers.handleDragEnd}
            onEdit={setEditingTask}
            onView={setViewingTask}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
          />

          <TaskKanbanColumn
            title="DONE"
            icon={<CheckCheck size={16} />}
            status="DONE"
            tasks={organizedTasks.done}
            count={organizedTasks.done.length}
            badgeClass="badge-success"
            borderColor="var(--color-success)"
            dragOverColumn={dragDropHandlers.dragOverColumn}
            draggedTask={dragDropHandlers.draggedTask}
            justDraggedRef={dragDropHandlers.justDraggedRef}
            pendingUpdates={pendingUpdates}
            domains={domains}
            staffMembers={staffMembers}
            canEditTask={canEditTask}
            canDeleteTask={canDeleteTask}
            onDragOver={dragDropHandlers.handleDragOver}
            onDragLeave={dragDropHandlers.handleDragLeave}
            onDrop={dragDropHandlers.handleDrop}
            onDragStart={dragDropHandlers.handleDragStart}
            onDragEnd={dragDropHandlers.handleDragEnd}
            onEdit={setEditingTask}
            onView={setViewingTask}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
          />
        </div>
      )}

      {showCreateForm && canCreateTask && (
        <TaskCreateModal
          startupId={startupId}
          domains={domains}
          weeklyPlans={weeklyPlans}
          staffMembers={staffMembers}
          isFounder={isFounder}
          isStaff={isStaff}
          currentUserId={currentUserId}
          currentPlanId={currentPlanId}
          onClose={() => setShowCreateForm(false)}
        />
      )}

      {viewingTask && (
        <TaskDetailModal
          task={viewingTask}
          onClose={() => setViewingTask(null)}
          domains={domains}
          weeklyPlans={weeklyPlans}
          staffMembers={staffMembers}
          canEdit={canEditTask(viewingTask)}
          onEdit={(task) => {
            setViewingTask(null)
            setEditingTask(task)
          }}
        />
      )}

      {editingTask && (
        <TaskEditModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          domains={domains}
          startupId={startupId}
          weeklyPlans={weeklyPlans}
          staffMembers={staffMembers}
        />
      )}
    </div>
  )
}
