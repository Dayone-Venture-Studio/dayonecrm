'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createWeeklyPlan, deleteWeeklyPlan } from '@/features/weekly-plans/actions'
import type { WeeklyPlan, Domain, Task } from '@/types'
import { useServerAction } from '@/lib/hooks/useServerAction'
import { TaskEditModal } from '@/components/tasks/TaskEditModal'
import { TaskCreateModal } from '@/components/tasks/TaskCreateModal'
import { TaskDetailModal } from '@/components/tasks/TaskDetailModal'
import { ModalOverlay } from '@/components/ui/ModalOverlay'
import { SprintDashboard } from './SprintDashboard'
import { StatusSummaryView } from './StatusSummaryView'
import { TeamWorkloadView } from './TeamWorkloadView'
import { ExternalLink } from 'lucide-react'

interface StaffMemberEntry {
  user_id: string
  role?: string
  profile: { id: string; full_name: string; email?: string | null } | null
}

interface Props {
  startupId: string
  allPlans: WeeklyPlan[]
  activePlan: WeeklyPlan | null
  domains: Domain[]
  tasks: Task[]
  staffMembers?: StaffMemberEntry[]
}

type ViewMode = 'status' | 'team'

function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d
}

function toDateStr(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function WeeklyPlanClient({
  startupId,
  allPlans,
  activePlan,
  domains,
  tasks,
  staffMembers = [],
}: Props) {
  const router = useRouter()

  // Server actions
  const [createPlan, createPlanPending] = useServerAction({
    onSuccess: () => setShowCreatePlanModal(false),
  })
  const [deletePlan, deletePlanPending] = useServerAction()

  // Modal states
  const [showCreatePlanModal, setShowCreatePlanModal] = useState(false)
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [viewingTask, setViewingTask] = useState<Task | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  // View mode
  const [viewMode, setViewMode] = useState<ViewMode>('status')

  // Default dates for new plan modal
  const defaultMonday = getMonday(new Date())
  const defaultSunday = new Date(defaultMonday)
  defaultSunday.setDate(defaultMonday.getDate() + 6)

  const [newPlanStart, setNewPlanStart] = useState(toDateStr(defaultMonday))
  const [newPlanEnd, setNewPlanEnd] = useState(toDateStr(defaultSunday))

  const todayStr = toDateStr(new Date())

  // Get sprint status badge
  const getPlanStatusBadge = (plan: WeeklyPlan) => {
    if (todayStr >= plan.week_start && todayStr <= plan.week_end) {
      return <span className="badge badge-success" style={{ fontSize: 10 }}>Current</span>
    }
    if (todayStr < plan.week_start) {
      return <span className="badge badge-info" style={{ fontSize: 10 }}>Upcoming</span>
    }
    return <span className="badge badge-neutral" style={{ fontSize: 10 }}>Past</span>
  }

  const handleCreatePlan = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const title = String(formData.get('title') || 'Sprint')
    createPlan(() => createWeeklyPlan({}, formData), {
      success: {
        title: 'Sprint created successfully.',
        description: `"${title}" is ready for planning.`,
      },
      error: (message: string) => ({ title: 'Could not create sprint.', description: message }),
    })
  }

  const handleDeletePlan = () => {
    if (!activePlan) return
    if (!confirm('Are you sure you want to delete this sprint? Tasks will remain unlinked.')) {
      return
    }
    const formData = new FormData()
    formData.append('id', activePlan.id)
    deletePlan(() => deleteWeeklyPlan({}, formData), {
      success: {
        title: 'Sprint deleted successfully.',
        description: `"${activePlan.title || 'Sprint'}" has been deleted.`,
      },
      error: (message: string) => ({ title: 'Could not delete sprint.', description: message }),
    })
  }

  const setDatePreset = (preset: 'this_week' | 'next_week' | 'next_month') => {
    if (preset === 'this_week') {
      const mon = getMonday(new Date())
      const sun = new Date(mon)
      sun.setDate(mon.getDate() + 6)
      setNewPlanStart(toDateStr(mon))
      setNewPlanEnd(toDateStr(sun))
    } else if (preset === 'next_week') {
      const nextMon = getMonday(new Date())
      nextMon.setDate(nextMon.getDate() + 7)
      const nextSun = new Date(nextMon)
      nextSun.setDate(nextMon.getDate() + 6)
      setNewPlanStart(toDateStr(nextMon))
      setNewPlanEnd(toDateStr(nextSun))
    } else if (preset === 'next_month') {
      const now = new Date()
      const nextMonthFirst = new Date(now.getFullYear(), now.getMonth() + 1, 1)
      const nextMonthLast = new Date(now.getFullYear(), now.getMonth() + 2, 0)
      setNewPlanStart(toDateStr(nextMonthFirst))
      setNewPlanEnd(toDateStr(nextMonthLast))
    }
  }

  return (
    <div>
      {/* Plan Switcher Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 24,
          flexWrap: 'wrap',
          background: 'var(--color-surface)',
          padding: '14px 18px',
          borderRadius: 10,
          border: '1px solid var(--color-border)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', flex: 1 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Sprints:
          </span>
          {allPlans.length === 0 ? (
            <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>No sprints created yet</span>
          ) : (
            allPlans.map((plan) => {
              const isSelected = activePlan?.id === plan.id
              const startStr = new Date(plan.week_start + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              const endStr = new Date(plan.week_end + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              const displayName = plan.title || plan.goal || `Sprint (${startStr} - ${endStr})`

              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => router.push(`/founder/weekly-plan?plan=${plan.id}`)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: isSelected ? 600 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: isSelected ? 'var(--color-brand)' : 'var(--color-surface-2)',
                    color: isSelected ? '#ffffff' : 'var(--color-text-primary)',
                    border: isSelected ? '1px solid var(--color-brand)' : '1px solid var(--color-border)',
                    boxShadow: isSelected ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                  }}
                  title={plan.goal || undefined}
                >
                  <span style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {displayName}
                  </span>
                  {getPlanStatusBadge(plan)}
                </button>
              )
            })
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowCreatePlanModal(true)}
          className="btn btn-primary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0 }}
        >
          <span>+ New Sprint</span>
        </button>
      </div>

      {!activePlan ? (
        /* No active plan */
        <div className="card" style={{ maxWidth: 580, margin: '40px auto', textAlign: 'center', padding: 36 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📅</div>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No Sprint Selected</h2>
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 24 }}>
            Create a new sprint to organize your team&apos;s work and track progress.
          </p>
          <button
            type="button"
            onClick={() => setShowCreatePlanModal(true)}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            + Create New Sprint
          </button>
        </div>
      ) : (
        /* Active plan view */
        <div>
          {/* Sprint Dashboard */}
          <SprintDashboard
            activePlan={activePlan}
            tasks={tasks}
            onPlanUpdated={() => router.refresh()}
          />

          {/* Quick Actions Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={() => setShowCreateTask(true)}
                className="btn btn-primary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <span>+ Add Task to Sprint</span>
              </button>
              <Link
                href={`/founder/tasks?plan=${activePlan.id}`}
                className="btn btn-secondary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <span>📊 View Full Kanban</span>
                <ExternalLink size={14} />
              </Link>
            </div>

            <button
              type="button"
              onClick={handleDeletePlan}
              className="btn btn-ghost btn-sm"
              disabled={deletePlanPending}
              style={{ color: 'var(--color-danger)' }}
            >
              🗑️ Delete Sprint
            </button>
          </div>

          {/* Tab Navigation */}
          <div style={{ borderBottom: '2px solid var(--color-border)', marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                type="button"
                onClick={() => setViewMode('status')}
                style={{
                  padding: '10px 20px',
                  fontSize: 14,
                  fontWeight: 600,
                  background: 'transparent',
                  border: 'none',
                  borderBottom: viewMode === 'status' ? '2px solid var(--color-brand)' : '2px solid transparent',
                  color: viewMode === 'status' ? 'var(--color-brand)' : 'var(--color-text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  marginBottom: -2,
                }}
              >
                📋 By Status
              </button>
              <button
                type="button"
                onClick={() => setViewMode('team')}
                style={{
                  padding: '10px 20px',
                  fontSize: 14,
                  fontWeight: 600,
                  background: 'transparent',
                  border: 'none',
                  borderBottom: viewMode === 'team' ? '2px solid var(--color-brand)' : '2px solid transparent',
                  color: viewMode === 'team' ? 'var(--color-brand)' : 'var(--color-text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  marginBottom: -2,
                }}
              >
                👥 By Team Member
              </button>
            </div>
          </div>

          {/* Task Views */}
          {viewMode === 'status' ? (
            <StatusSummaryView
              tasks={tasks}
              domains={domains}
              staffMembers={staffMembers}
              planId={activePlan.id}
              onTaskClick={(task) => setViewingTask(task)}
            />
          ) : (
            <TeamWorkloadView
              tasks={tasks}
              domains={domains}
              staffMembers={staffMembers}
              onTaskClick={(task) => setViewingTask(task)}
            />
          )}
        </div>
      )}

      {/* Create Sprint Modal */}
      {showCreatePlanModal && (
        <ModalOverlay isOpen={showCreatePlanModal} onClose={() => setShowCreatePlanModal(false)}>
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: 540,
              maxHeight: '90vh',
              overflowY: 'auto',
              background: 'var(--color-surface)',
              borderRadius: 12,
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--modal-shadow)',
              padding: 24,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Create New Sprint</h2>
              <button
                type="button"
                onClick={() => setShowCreatePlanModal(false)}
                className="btn btn-ghost btn-sm btn-icon"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePlan} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <input type="hidden" name="startup_id" value={startupId} />

              <div className="form-group">
                <label className="label">Sprint Title</label>
                <input
                  name="title"
                  className="input"
                  placeholder="e.g. Sprint 1, Week 38, Q1 Launch..."
                />
              </div>

              {/* Date Presets */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 11.5, color: 'var(--color-text-muted)' }}>Quick Presets:</span>
                <button
                  type="button"
                  onClick={() => setDatePreset('this_week')}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: 11.5, padding: '3px 8px' }}
                >
                  This Week
                </button>
                <button
                  type="button"
                  onClick={() => setDatePreset('next_week')}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: 11.5, padding: '3px 8px' }}
                >
                  Next Week
                </button>
                <button
                  type="button"
                  onClick={() => setDatePreset('next_month')}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: 11.5, padding: '3px 8px' }}
                >
                  Next Month
                </button>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="label">Start Date *</label>
                  <input
                    name="week_start"
                    type="date"
                    className="input"
                    value={newPlanStart}
                    onChange={(e) => setNewPlanStart(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="label">End Date *</label>
                  <input
                    name="week_end"
                    type="date"
                    className="input"
                    value={newPlanEnd}
                    onChange={(e) => setNewPlanEnd(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="label">Sprint Goal / Objective</label>
                <textarea
                  name="goal"
                  className="input"
                  placeholder="e.g. Complete MVP, onboard first 20 users, finalize branding…"
                  rows={3}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowCreatePlanModal(false)}
                  className="btn btn-secondary"
                  disabled={createPlanPending}
                >
                  Cancel
                </button>
                <button type="submit" disabled={createPlanPending} className="btn btn-primary">
                  {createPlanPending ? 'Creating…' : 'Create Sprint'}
                </button>
              </div>
            </form>
          </div>
        </ModalOverlay>
      )}

      {/* Create Task Modal */}
      {showCreateTask && (
        <TaskCreateModal
          startupId={startupId}
          domains={domains}
          weeklyPlans={allPlans}
          staffMembers={staffMembers}
          isFounder={true}
          isStaff={false}
          currentUserId=""
          currentPlanId={activePlan?.id}
          onClose={() => setShowCreateTask(false)}
        />
      )}

      {/* Task Detail Modal */}
      {viewingTask && (
        <TaskDetailModal
          task={viewingTask}
          onClose={() => setViewingTask(null)}
          domains={domains}
          weeklyPlans={allPlans}
          staffMembers={staffMembers}
          canEdit={true}
          onEdit={(task) => {
            setViewingTask(null)
            setEditingTask(task)
          }}
        />
      )}

      {/* Task Edit Modal */}
      {editingTask && (
        <TaskEditModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          domains={domains}
          startupId={startupId}
          weeklyPlans={allPlans}
          staffMembers={staffMembers}
        />
      )}
    </div>
  )
}
