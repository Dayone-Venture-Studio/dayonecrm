'use client'

import type { ReactNode } from 'react'
import { ModalOverlay } from '@/components/ui/ModalOverlay'
import { Pencil, Calendar, User, Flag, Target, ClipboardList, CheckCircle2, Clock, Tag } from 'lucide-react'
import type { Task, Domain, WeeklyPlan } from '@/types'

interface StaffMemberEntry {
  user_id: string
  role?: string
  profile: { id: string; full_name: string; email?: string | null } | null
}

interface Props {
  task: Task | null
  onClose: () => void
  domains: Domain[]
  weeklyPlans: Pick<WeeklyPlan, 'id' | 'week_start' | 'week_end' | 'title' | 'goal'>[]
  staffMembers: StaffMemberEntry[]
  canEdit?: boolean
  onEdit?: (task: Task) => void
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

const COMPLETION_BADGES: Record<string, string> = {
  EARLY: 'badge-success',
  ON_TIME: 'badge-info',
  LATE: 'badge-warning',
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
  weeklyPlans,
  staffMembers,
  canEdit = false,
  onEdit,
}: Props) {
  if (!task) return null

  const domainName = domains.find((d) => d.id === task.domain_id)?.name
  const assignedMember = staffMembers.find((m) => m.user_id === task.assigned_to)
  const weeklyPlan = weeklyPlans.find((p) => p.id === task.weekly_plan_id)

  const detailRow = (label: string, icon: ReactNode, value: ReactNode) => (
    <div className="flex flex-col gap-1 mb-3">
      <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.4px] text-[var(--color-text-secondary)]">
        {icon}
        {label}
      </span>
      <span className="text-sm text-[var(--color-text-primary)]">{value}</span>
    </div>
  )

  return (
    <ModalOverlay isOpen={!!task} onClose={onClose}>
      <div className="card w-[640px] max-w-[calc(100vw-48px)] max-h-[90vh] overflow-y-auto bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-[var(--modal-shadow)] p-6">
        <div className="flex items-start justify-between gap-3 mb-5">
          <h2 className="m-0 text-xl font-bold leading-tight text-[var(--color-text-primary)]">
            {task.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-icon text-lg leading-none shrink-0"
            title="Close"
          >
            ✕
          </button>
        </div>

        <div className="mb-5">
          <div className="flex items-center gap-1.5 mb-2">
            <ClipboardList size={13} />
            <span className="text-[11px] font-semibold uppercase tracking-[0.4px] text-[var(--color-text-secondary)]">
              Description
            </span>
          </div>
          <p className="m-0 text-sm whitespace-pre-wrap leading-relaxed text-[var(--color-text-primary)]">
            {task.description?.trim() || 'No description provided.'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {detailRow(
            'Domain',
            <Tag size={13} />,
            domainName ? <span className="badge badge-info">{domainName}</span> : '—',
          )}
          {detailRow(
            'Priority',
            <Flag size={13} />,
            <span className={`badge ${PRIORITY_BADGES[task.priority] || 'badge-neutral'}`}>
              {PRIORITY_LABELS[task.priority]}
            </span>,
          )}
          {detailRow(
            'Weekly Plan',
            <Target size={13} />,
            weeklyPlan
              ? `${weeklyPlan.title || weeklyPlan.goal || 'Weekly Sprint'} (${formatDate(weeklyPlan.week_start)} → ${formatDate(weeklyPlan.week_end)})`
              : 'No Plan',
          )}
          {detailRow(
            'Due Date',
            <Calendar size={13} />,
            formatDate(task.due_date),
          )}
          {detailRow(
            'Assign To',
            <User size={13} />,
            assignedMember?.profile
              ? `${assignedMember.profile.full_name}${assignedMember.role ? ` • ${assignedMember.role}` : ''}`
              : 'Unassigned',
          )}
          {detailRow(
            'Status',
            <CheckCircle2 size={13} />,
            <span className="flex flex-wrap items-center gap-2">
              <span className={`badge ${STATUS_BADGES[task.status]}`}>{STATUS_LABELS[task.status]}</span>
              {task.completion_status && (
                <span className={`badge ${COMPLETION_BADGES[task.completion_status] || 'badge-neutral'}`}>
                  {task.completion_status.replace('_', ' ')}
                </span>
              )}
            </span>,
          )}
        </div>

        <div className="flex flex-wrap gap-5 pt-4 border-t border-[var(--color-border)] mb-5">
          <span className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
            <Clock size={13} />
            Created {formatDate(task.created_at, true)}
          </span>
          {task.completed_at && (
            <span className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
              <CheckCircle2 size={13} />
              Completed {formatDate(task.completed_at, true)}
            </span>
          )}
        </div>

        <div className="flex justify-end gap-2.5">
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Close
          </button>
          {canEdit && onEdit && (
            <button type="button" onClick={() => onEdit(task)} className="btn btn-primary">
              <Pencil size={14} />
              <span>Edit Task</span>
            </button>
          )}
        </div>
      </div>
    </ModalOverlay>
  )
}
