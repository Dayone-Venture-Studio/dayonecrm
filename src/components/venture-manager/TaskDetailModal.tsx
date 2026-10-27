'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ModalOverlay, ModalCloseButton } from '@/components/ui/ModalOverlay'
import { reassignTaskToEmployee } from '@/features/venture-manager/actions'
import { useServerAction } from '@/lib/hooks/useServerAction'
import {
  Calendar,
  User,
  Flag,
  Target,
  CheckCircle2,
  Clock,
  Tag,
  Building2,
  AlertCircle,
  UserPlus,
} from 'lucide-react'
import type { Task, Domain, Profile, TaskDelegationWithProfiles } from '@/types'

interface Props {
  task: Task | null
  onClose: () => void
  domains: Domain[]
  employees: Profile[]
  currentVmId: string
  delegation: TaskDelegationWithProfiles | null
  startupName: string
}

const STATUS_LABELS: Record<Task['status'], string> = {
  TODO: 'Todo',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
}

const STATUS_BADGES: Record<Task['status'], string> = {
  TODO: 'badge-neutral',
  IN_PROGRESS: 'badge-info',
  DONE: 'badge-success',
}

const PRIORITY_LABELS: Record<Task['priority'], string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
}

const PRIORITY_BADGES: Record<string, string> = {
  LOW: 'badge-neutral',
  MEDIUM: 'badge-warning',
  HIGH: 'badge-danger',
}

function formatDate(value: string | null | undefined, withTime = false) {
  if (!value) return '—'
  const date = new Date(withTime ? value : `${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...(withTime ? { hour: 'numeric', minute: '2-digit' } : {}),
  })
}

export function TaskDetailModal({
  task,
  onClose,
  domains,
  employees,
  currentVmId,
  delegation,
  startupName,
}: Props) {
  const router = useRouter()
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [note, setNote] = useState('')
  const [showReassignConfirm, setShowReassignConfirm] = useState(false)

  const [executeReassign, reassignPending] = useServerAction({
    onSuccess: () => {
      setSelectedEmployee('')
      setNote('')
      setShowReassignConfirm(false)
      router.refresh()
    },
  })

  if (!task) return null

  const domainName = domains.find((d) => d.id === task.domain_id)?.name
  const isAssignedToCurrentVm = task.assigned_to === currentVmId
  const isDelegated = !!delegation

  const handleReassignClick = () => {
    if (!selectedEmployee) return

    // Show confirmation if already delegated
    if (isDelegated && delegation) {
      setShowReassignConfirm(true)
      return
    }

    // Otherwise, reassign directly
    handleReassign()
  }

  const handleReassign = () => {
    if (!selectedEmployee) return

    const formData = new FormData()
    formData.set('taskId', task.id)
    formData.set('employeeId', selectedEmployee)
    if (note) formData.set('note', note)

    executeReassign(() => reassignTaskToEmployee({}, formData), {
      success: {
        title: isDelegated ? 'Task reassigned' : 'Task delegated',
        description: isDelegated
          ? `Task reassigned to ${employees.find((e) => e.id === selectedEmployee)?.full_name}`
          : `Task successfully delegated to ${employees.find((e) => e.id === selectedEmployee)?.full_name}`,
      },
      error: (error) => ({
        title: 'Failed to delegate task',
        description: error,
      }),
    })
  }

  const detailRow = (label: string, icon: React.ReactNode, value: React.ReactNode) => (
    <div className="flex flex-col gap-1 mb-3">
      <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.4px] text-text-muted">
        {icon}
        {label}
      </span>
      <span className="text-sm text-text-primary">{value}</span>
    </div>
  )

  return (
    <ModalOverlay isOpen={!!task} onClose={onClose}>
      <div className="card w-[680px] max-w-[calc(100vw-48px)] max-h-[90vh] overflow-y-auto bg-surface rounded-xl border border-border shadow-lg p-6">
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="flex-1">
            <h2 className="m-0 text-xl font-bold leading-tight text-text-primary mb-2">
              {task.title}
            </h2>
            {isAssignedToCurrentVm && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-dim text-brand text-xs font-bold">
                <UserPlus size={12} />
                Assigned to You
              </div>
            )}
          </div>
          <ModalCloseButton onClose={onClose} />
        </div>

        {/* Delegation Warning */}
        {isDelegated && delegation && (
          <div className="mb-4 p-3 rounded-lg bg-purple-50 border border-purple-200 flex items-start gap-2">
            <AlertCircle size={16} className="text-purple-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="m-0 text-sm font-semibold text-purple-900">
                Delegated to {delegation.employee?.full_name || 'Unknown Employee'}
              </p>
              <p className="m-0 mt-0.5 text-xs text-purple-700">
                Assigned on {formatDate(delegation.delegated_at, true)}
              </p>
            </div>
          </div>
        )}

        {/* Startup Context */}
        <div className="mb-4 p-3 rounded-lg bg-surface-2 border border-border-subtle flex items-center gap-2">
          <Building2 size={16} className="text-text-muted" />
          <span className="text-sm font-semibold text-text-primary">{startupName}</span>
        </div>

        {/* Description */}
        {task.description && (
          <div className="mb-5">
            <h3 className="text-xs font-bold uppercase tracking-wide text-text-muted mb-2">Description</h3>
            <p className="m-0 text-sm text-text-primary whitespace-pre-wrap leading-relaxed">
              {task.description}
            </p>
          </div>
        )}

        {/* Task Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-5 pb-5 border-b border-border-subtle">
          {detailRow('Status', <CheckCircle2 size={13} />, (
            <span className={`badge ${STATUS_BADGES[task.status]}`}>
              {STATUS_LABELS[task.status]}
            </span>
          ))}

          {detailRow('Priority', <Flag size={13} />, (
            <span className={`badge ${PRIORITY_BADGES[task.priority]}`}>
              {PRIORITY_LABELS[task.priority]}
            </span>
          ))}

          {detailRow('Due Date', <Calendar size={13} />, formatDate(task.due_date))}

          {domainName && detailRow('Domain', <Target size={13} />, domainName)}

          {detailRow('Created', <Clock size={13} />, formatDate(task.created_at, true))}

          {task.completed_at && detailRow('Completed', <CheckCircle2 size={13} />, formatDate(task.completed_at, true))}
        </div>

        {/* Reassignment Section */}
        {isAssignedToCurrentVm && (
          <div className="bg-surface-2 rounded-lg p-4 border border-border-subtle">
            <h3 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
              <UserPlus size={16} />
              {isDelegated ? 'Reassign to Different Employee' : 'Delegate to Employee'}
            </h3>

            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5">
                  Select Employee
                </label>
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="input w-full"
                  disabled={reassignPending}
                >
                  <option value="">Choose an employee...</option>
                  {employees.map((emp) => (
                    <option
                      key={emp.id}
                      value={emp.id}
                      disabled={emp.id === delegation?.delegated_to}
                    >
                      {emp.full_name}
                      {emp.id === delegation?.delegated_to ? ' (current assignee)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5">
                  Note (optional)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="input w-full"
                  rows={3}
                  placeholder="Add context or instructions for the employee..."
                  disabled={reassignPending}
                />
              </div>

              <button
                onClick={handleReassignClick}
                disabled={!selectedEmployee || reassignPending}
                className="btn btn-primary w-full"
              >
                {reassignPending
                  ? 'Processing...'
                  : isDelegated
                  ? 'Reassign Task'
                  : 'Delegate Task'}
              </button>
            </div>
          </div>
        )}

        {/* Reassignment Confirmation Dialog */}
        {showReassignConfirm && delegation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="card w-[420px] max-w-[calc(100vw-48px)] bg-surface rounded-xl border border-border shadow-xl p-6">
              <h3 className="text-lg font-bold text-text-primary mb-2">
                Confirm Reassignment
              </h3>
              <p className="text-sm text-text-secondary mb-4">
                This task is currently assigned to{' '}
                <strong className="text-text-primary">{delegation.employee?.full_name}</strong>.
                Reassign it to{' '}
                <strong className="text-text-primary">
                  {employees.find((e) => e.id === selectedEmployee)?.full_name}
                </strong>
                ?
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowReassignConfirm(false)}
                  className="btn btn-ghost"
                  disabled={reassignPending}
                >
                  Cancel
                </button>
                <button
                  onClick={handleReassign}
                  className="btn btn-primary"
                  disabled={reassignPending}
                >
                  {reassignPending ? 'Reassigning...' : 'Confirm Reassignment'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ModalOverlay>
  )
}
