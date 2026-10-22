'use client'

import Link from 'next/link'
import type { Task, Domain } from '@/types'
import { TaskSummaryCard } from './TaskSummaryCard'
import { ClipboardList, Rocket, CheckCheck, ExternalLink } from 'lucide-react'

interface StaffMemberEntry {
  user_id: string
  role?: string
  profile: { id: string; full_name: string; email?: string | null } | null
}

interface StatusSummaryViewProps {
  tasks: Task[]
  domains: Domain[]
  staffMembers: StaffMemberEntry[]
  planId: string
  onTaskClick: (task: Task) => void
}

const MAX_VISIBLE_TASKS = 5

export function StatusSummaryView({
  tasks,
  domains,
  staffMembers,
  planId,
  onTaskClick,
}: StatusSummaryViewProps) {
  // Organize tasks by status
  const todoTasks = tasks.filter((t: Task) => t.status === 'TODO')
  const inProgressTasks = tasks.filter((t: Task) => t.status === 'IN_PROGRESS')
  const doneTasks = tasks.filter((t: Task) => t.status === 'DONE')

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
      {/* TODO Column */}
      <div
        className="card"
        style={{
          padding: 16,
          borderTop: '3px solid var(--color-border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ClipboardList size={16} color="var(--color-text-muted)" />
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              TODO
            </h3>
          </div>
          <span className="badge badge-neutral">{todoTasks.length}</span>
        </div>

        {todoTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--color-text-muted)', fontSize: 13 }}>
            No tasks in TODO
          </div>
        ) : (
          <>
            <div>
              {todoTasks.slice(0, MAX_VISIBLE_TASKS).map((task: Task) => (
                <TaskSummaryCard
                  key={task.id}
                  task={task}
                  domains={domains}
                  staffMembers={staffMembers}
                  onClick={onTaskClick}
                />
              ))}
            </div>

            {todoTasks.length > MAX_VISIBLE_TASKS && (
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 8, marginBottom: 12 }}>
                + {todoTasks.length - MAX_VISIBLE_TASKS} more task{todoTasks.length - MAX_VISIBLE_TASKS !== 1 ? 's' : ''}
              </div>
            )}

            <Link
              href={`/founder/tasks?plan=${planId}&status=TODO`}
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <span>View All TODO</span>
              <ExternalLink size={12} />
            </Link>
          </>
        )}
      </div>

      {/* IN PROGRESS Column */}
      <div
        className="card"
        style={{
          padding: 16,
          borderTop: '3px solid var(--color-info)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Rocket size={16} color="var(--color-info)" />
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              IN PROGRESS
            </h3>
          </div>
          <span className="badge badge-info">{inProgressTasks.length}</span>
        </div>

        {inProgressTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--color-text-muted)', fontSize: 13 }}>
            No tasks in progress
          </div>
        ) : (
          <>
            <div>
              {inProgressTasks.slice(0, MAX_VISIBLE_TASKS).map((task: Task) => (
                <TaskSummaryCard
                  key={task.id}
                  task={task}
                  domains={domains}
                  staffMembers={staffMembers}
                  onClick={onTaskClick}
                />
              ))}
            </div>

            {inProgressTasks.length > MAX_VISIBLE_TASKS && (
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 8, marginBottom: 12 }}>
                + {inProgressTasks.length - MAX_VISIBLE_TASKS} more task{inProgressTasks.length - MAX_VISIBLE_TASKS !== 1 ? 's' : ''}
              </div>
            )}

            <Link
              href={`/founder/tasks?plan=${planId}&status=IN_PROGRESS`}
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <span>View All In Progress</span>
              <ExternalLink size={12} />
            </Link>
          </>
        )}
      </div>

      {/* DONE Column */}
      <div
        className="card"
        style={{
          padding: 16,
          borderTop: '3px solid var(--color-success)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCheck size={16} color="var(--color-success)" />
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              DONE
            </h3>
          </div>
          <span className="badge badge-success">{doneTasks.length}</span>
        </div>

        {doneTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--color-text-muted)', fontSize: 13 }}>
            No completed tasks yet
          </div>
        ) : (
          <>
            <div>
              {doneTasks.slice(0, MAX_VISIBLE_TASKS).map((task: Task) => (
                <TaskSummaryCard
                  key={task.id}
                  task={task}
                  domains={domains}
                  staffMembers={staffMembers}
                  onClick={onTaskClick}
                />
              ))}
            </div>

            {doneTasks.length > MAX_VISIBLE_TASKS && (
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 8, marginBottom: 12 }}>
                + {doneTasks.length - MAX_VISIBLE_TASKS} more task{doneTasks.length - MAX_VISIBLE_TASKS !== 1 ? 's' : ''}
              </div>
            )}

            <Link
              href={`/founder/tasks?plan=${planId}&status=DONE`}
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <span>View All Done</span>
              <ExternalLink size={12} />
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
