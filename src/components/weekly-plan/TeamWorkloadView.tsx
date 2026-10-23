'use client'

import { useState } from 'react'
import type { Task, Domain } from '@/types'
import { TaskSummaryCard } from './TaskSummaryCard'
import { ChevronDown, ChevronRight, User, AlertTriangle } from 'lucide-react'

interface StaffMemberEntry {
  user_id: string
  role?: string
  profile: { id: string; full_name: string; email?: string | null } | null
}

interface TeamWorkloadViewProps {
  tasks: Task[]
  domains: Domain[]
  staffMembers: StaffMemberEntry[]
  onTaskClick: (task: Task) => void
}

interface TeamMemberGroup {
  memberId: string | null
  memberName: string
  tasks: Task[]
  todoCount: number
  inProgressCount: number
  doneCount: number
}

const MAX_VISIBLE_TASKS_PER_MEMBER = 3

export function TeamWorkloadView({
  tasks,
  domains,
  staffMembers,
  onTaskClick,
}: TeamWorkloadViewProps) {
  const [expandedMembers, setExpandedMembers] = useState<Set<string>>(new Set(['unassigned']))

  const toggleMember = (memberId: string) => {
    setExpandedMembers((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(memberId)) {
        newSet.delete(memberId)
      } else {
        newSet.add(memberId)
      }
      return newSet
    })
  }

  // Group tasks by assignee
  const groupTasksByAssignee = (): TeamMemberGroup[] => {
    const groups = new Map<string | null, TeamMemberGroup>()

    // Initialize groups for all staff members
    staffMembers.forEach((member) => {
      if (member.profile) {
        groups.set(member.user_id, {
          memberId: member.user_id,
          memberName: member.profile.full_name,
          tasks: [],
          todoCount: 0,
          inProgressCount: 0,
          doneCount: 0,
        })
      }
    })

    // Add unassigned group
    groups.set(null, {
      memberId: null,
      memberName: 'Unassigned',
      tasks: [],
      todoCount: 0,
      inProgressCount: 0,
      doneCount: 0,
    })

    // Distribute tasks to groups
    tasks.forEach((task) => {
      const group = groups.get(task.assigned_to || null)
      if (group) {
        group.tasks.push(task)
        if (task.status === 'TODO') group.todoCount++
        else if (task.status === 'IN_PROGRESS') group.inProgressCount++
        else if (task.status === 'DONE') group.doneCount++
      }
    })

    // Convert to array and filter out members with no tasks, sort by task count
    return Array.from(groups.values())
      .filter((group) => group.tasks.length > 0)
      .sort((a, b) => {
        // Unassigned always last
        if (a.memberId === null) return 1
        if (b.memberId === null) return -1
        // Sort by total task count descending
        return b.tasks.length - a.tasks.length
      })
  }

  const memberGroups = groupTasksByAssignee()

  // Get avatar initials
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {memberGroups.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <h3>No tasks assigned yet</h3>
          <p>Assign tasks to team members to see workload distribution</p>
        </div>
      ) : (
        memberGroups.map((group) => {
          const isExpanded = expandedMembers.has(group.memberId || 'unassigned')
          const isOverloaded = group.tasks.length > 5
          const memberKey = group.memberId || 'unassigned'

          return (
            <div
              key={memberKey}
              className="card"
              style={{
                padding: 16,
                borderLeft: isOverloaded ? '3px solid var(--color-warning)' : undefined,
              }}
            >
              {/* Member Header */}
              <button
                type="button"
                onClick={() => toggleMember(memberKey)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  marginBottom: isExpanded ? 16 : 0,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {/* Avatar */}
                  {group.memberId ? (
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: 'var(--color-brand)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14,
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      {getInitials(group.memberName)}
                    </div>
                  ) : (
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: 'var(--color-surface-2)',
                        border: '2px dashed var(--color-border)',
                        color: 'var(--color-text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14,
                        flexShrink: 0,
                      }}
                    >
                      <User size={20} />
                    </div>
                  )}

                  {/* Name and Stats */}
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {group.memberName}
                      </span>
                      {isOverloaded && (
                        <AlertTriangle size={14} color="var(--color-warning)" />
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'flex', gap: 12 }}>
                      <span>
                        <strong style={{ color: 'var(--color-text-secondary)' }}>{group.tasks.length}</strong> task
                        {group.tasks.length !== 1 ? 's' : ''}
                      </span>
                      <span>•</span>
                      <span>
                        <strong style={{ color: 'var(--color-text-secondary)' }}>{group.todoCount}</strong> TODO
                      </span>
                      <span>•</span>
                      <span>
                        <strong style={{ color: 'var(--color-text-secondary)' }}>{group.inProgressCount}</strong> IN PROGRESS
                      </span>
                      <span>•</span>
                      <span>
                        <strong style={{ color: 'var(--color-text-secondary)' }}>{group.doneCount}</strong> DONE
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expand/Collapse Icon */}
                <div style={{ color: 'var(--color-text-muted)' }}>
                  {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </div>
              </button>

              {/* Tasks List (Expanded) */}
              {isExpanded && (
                <div>
                  {group.tasks.slice(0, MAX_VISIBLE_TASKS_PER_MEMBER).map((task) => (
                    <TaskSummaryCard
                      key={task.id}
                      task={task}
                      domains={domains}
                      staffMembers={staffMembers}
                      onClick={onTaskClick}
                    />
                  ))}

                  {group.tasks.length > MAX_VISIBLE_TASKS_PER_MEMBER && (
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 8 }}>
                      + {group.tasks.length - MAX_VISIBLE_TASKS_PER_MEMBER} more task
                      {group.tasks.length - MAX_VISIBLE_TASKS_PER_MEMBER !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}
