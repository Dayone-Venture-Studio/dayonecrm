'use client'

import type { Task, Domain } from '@/types'
import { Calendar, User, AlertTriangle } from 'lucide-react'

interface StaffMemberEntry {
  user_id: string
  role?: string
  profile: { id: string; full_name: string; email?: string | null } | null
}

interface TaskSummaryCardProps {
  task: Task
  domains: Domain[]
  staffMembers: StaffMemberEntry[]
  onClick?: (task: Task) => void
}

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'badge-neutral',
  MEDIUM: 'badge-warning',
  HIGH: 'badge-danger',
}

const STATUS_COLORS: Record<string, string> = {
  TODO: 'badge-neutral',
  IN_PROGRESS: 'badge-info',
  DONE: 'badge-success',
}

export function TaskSummaryCard({ task, domains, staffMembers, onClick }: TaskSummaryCardProps) {
  const domainName = domains.find((d) => d.id === task.domain_id)?.name
  const assignedMember = staffMembers.find((m) => m.user_id === task.assigned_to)
  
  // Risk indicators
  const today = new Date().toISOString().split('T')[0]
  const isOverdue = task.status !== 'DONE' && task.due_date && task.due_date < today
  const isUnassignedHighPriority = task.priority === 'HIGH' && !task.assigned_to && task.status !== 'DONE'
  
  // Get assignee initials for avatar
  const getInitials = (name: string): string => {
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  const handleClick = (): void => {
    if (onClick) {
      onClick(task)
    }
  }

  return (
    <div
      onClick={handleClick}
      className={`task-card ${task.status === 'DONE' ? 'done' : ''}`}
      style={{
        padding: 10,
        marginBottom: 8,
        cursor: onClick ? 'pointer' : 'default',
        borderLeft: isOverdue ? '3px solid var(--color-danger)' : isUnassignedHighPriority ? '3px solid var(--color-warning)' : undefined,
        transition: 'all 0.15s ease',
      }}
    >
      {/* Header Row: Title + Risk Indicator */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
        <div style={{ flex: 1, fontSize: 13.5, fontWeight: 500, color: 'var(--color-text-primary)', lineHeight: 1.4 }}>
          {task.title}
        </div>
        {(isOverdue || isUnassignedHighPriority) && (
          <AlertTriangle 
            size={14} 
            color={isOverdue ? 'var(--color-danger)' : 'var(--color-warning)'} 
            style={{ flexShrink: 0 }}
          />
        )}
      </div>

      {/* Badges Row */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginBottom: 6 }}>
        <span className={`badge ${PRIORITY_COLORS[task.priority] || 'badge-neutral'}`} style={{ fontSize: 10 }}>
          {task.priority}
        </span>
        <span className={`badge ${STATUS_COLORS[task.status] || 'badge-neutral'}`} style={{ fontSize: 10 }}>
          {task.status.replace('_', ' ')}
        </span>
        {domainName && (
          <span className="badge badge-info" style={{ fontSize: 10 }}>
            {domainName}
          </span>
        )}
      </div>

      {/* Meta Row: Due Date + Assignee */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 11, color: 'var(--color-text-muted)' }}>
        {task.due_date && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Calendar size={11} />
            <span style={{ color: isOverdue ? 'var(--color-danger)' : undefined }}>
              {new Date(task.due_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        )}
        {assignedMember?.profile ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: 'var(--color-brand)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 9,
                fontWeight: 600,
              }}
              title={assignedMember.profile.full_name}
            >
              {getInitials(assignedMember.profile.full_name)}
            </div>
            <span>{assignedMember.profile.full_name}</span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: isUnassignedHighPriority ? 'var(--color-warning)' : undefined }}>
            <User size={11} />
            <span>Unassigned</span>
          </div>
        )}
      </div>
    </div>
  )
}
