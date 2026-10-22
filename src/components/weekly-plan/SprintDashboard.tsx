'use client'

import { useState } from 'react'
import { useServerAction } from '@/lib/hooks/useServerAction'
import { updateWeeklyPlan } from '@/features/weekly-plans/actions'
import type { WeeklyPlan, Task } from '@/types'
import { AlertCircle, Calendar, Target } from 'lucide-react'

interface SprintDashboardProps {
  activePlan: WeeklyPlan
  tasks: Task[]
  onPlanUpdated?: () => void
}

export function SprintDashboard({ activePlan, tasks, onPlanUpdated }: SprintDashboardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [showRiskDetails, setShowRiskDetails] = useState(false)

  const [updatePlan, updatePending] = useServerAction({
    onSuccess: () => {
      setIsEditing(false)
      onPlanUpdated?.()
    },
  })

  // Calculate metrics
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.status === 'DONE').length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Calculate days remaining
  const today = new Date()
  const endDate = new Date(activePlan.week_end + 'T23:59:59')
  const startDate = new Date(activePlan.week_start + 'T00:00:00')
  const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

  // Identify risks
  const todayStr = today.toISOString().split('T')[0]
  const overdueTasks = tasks.filter((t) => t.status !== 'DONE' && t.due_date && t.due_date < todayStr)
  const unassignedHighPriority = tasks.filter((t) => t.priority === 'HIGH' && !t.assigned_to && t.status !== 'DONE')
  const hasRisks = overdueTasks.length > 0 || unassignedHighPriority.length > 0

  // Determine sprint status badge
  const getSprintStatus = (): { label: string; className: string } => {
    if (todayStr >= activePlan.week_start && todayStr <= activePlan.week_end) {
      return { label: 'Current', className: 'badge-success' }
    }
    if (todayStr < activePlan.week_start) {
      return { label: 'Upcoming', className: 'badge-info' }
    }
    return { label: 'Past', className: 'badge-neutral' }
  }

  const sprintStatus = getSprintStatus()

  const handleUpdatePlan = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    updatePlan(() => updateWeeklyPlan({}, formData), {
      success: {
        title: 'Sprint updated successfully.',
        description: `Changes to "${activePlan.title || 'sprint'}" have been saved.`,
      },
      error: (message: string) => ({ title: 'Could not update sprint.', description: message }),
    })
  }

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
              {activePlan.title || 'Sprint Plan'}
            </h2>
            <span className={`badge ${sprintStatus.className}`} style={{ fontSize: 11 }}>
              {sprintStatus.label}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, color: 'var(--color-text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Calendar size={14} />
              {new Date(activePlan.week_start + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} 
              {' → '}
              {new Date(activePlan.week_end + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            {daysRemaining >= 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Target size={14} />
                {daysRemaining === 0 ? 'Last day' : daysRemaining === 1 ? '1 day left' : `${daysRemaining} days left`}
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className="btn btn-secondary btn-sm"
          style={{ flexShrink: 0 }}
        >
          {isEditing ? 'Cancel' : '✏️ Edit Sprint'}
        </button>
      </div>

      {/* Edit Form */}
      {isEditing ? (
        <form onSubmit={handleUpdatePlan} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
          <input type="hidden" name="id" value={activePlan.id} />
          <div className="grid-2">
            <div className="form-group">
              <label className="label">Sprint Title</label>
              <input
                name="title"
                className="input"
                defaultValue={activePlan.title || ''}
                placeholder="e.g. Sprint 2: Core Features"
              />
            </div>
            <div className="form-group">
              <label className="label">Sprint Goal</label>
              <input
                name="goal"
                className="input"
                defaultValue={activePlan.goal || ''}
                placeholder="e.g. Launch MVP & onboard first 10 users"
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="label">Start Date</label>
              <input
                name="week_start"
                type="date"
                className="input"
                defaultValue={activePlan.week_start}
                required
              />
            </div>
            <div className="form-group">
              <label className="label">End Date</label>
              <input
                name="week_end"
                type="date"
                className="input"
                defaultValue={activePlan.week_end}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="btn btn-secondary btn-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updatePending}
              className="btn btn-primary btn-sm"
            >
              {updatePending ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      ) : (
        /* Goal Display */
        activePlan.goal && (
          <div style={{ marginBottom: 20, padding: 12, background: 'var(--color-surface-2)', borderRadius: 8, borderLeft: '3px solid var(--color-brand)' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Sprint Goal
            </div>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', fontStyle: 'italic', margin: 0 }}>
              &ldquo;{activePlan.goal}&rdquo;
            </p>
          </div>
        )
      )}

      {/* Progress Section */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
            Sprint Progress
          </span>
          <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-brand)' }}>
            {completionRate}%
          </span>
        </div>

        {/* Progress Bar */}
        <div style={{ 
          width: '100%', 
          height: 12, 
          background: 'var(--color-surface-2)', 
          borderRadius: 100, 
          overflow: 'hidden',
          border: '1px solid var(--color-border)',
          marginBottom: 8
        }}>
          <div style={{ 
            width: `${completionRate}%`, 
            height: '100%', 
            background: completionRate === 100 ? 'var(--color-success)' : 'var(--color-brand)',
            transition: 'width 0.3s ease',
            borderRadius: 100
          }} />
        </div>

        {/* Stats Row */}
        <div style={{ display: 'flex', gap: 20, fontSize: 13, color: 'var(--color-text-muted)' }}>
          <span>
            <strong style={{ color: 'var(--color-text-primary)' }}>{completedTasks}</strong> of{' '}
            <strong style={{ color: 'var(--color-text-primary)' }}>{totalTasks}</strong> tasks completed
          </span>
          <span>•</span>
          <span>
            <strong style={{ color: 'var(--color-text-primary)' }}>{tasks.filter(t => t.status === 'TODO').length}</strong> TODO
          </span>
          <span>•</span>
          <span>
            <strong style={{ color: 'var(--color-text-primary)' }}>{tasks.filter(t => t.status === 'IN_PROGRESS').length}</strong> IN PROGRESS
          </span>
        </div>
      </div>

      {/* Risk Alert Panel */}
      {hasRisks && (
        <div style={{ 
          padding: 12, 
          background: 'rgba(239, 68, 68, 0.1)', 
          border: '1px solid var(--color-danger)', 
          borderRadius: 8 
        }}>
          <button
            type="button"
            onClick={() => setShowRiskDetails(!showRiskDetails)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              color: 'var(--color-text-primary)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={18} color="var(--color-danger)" />
              <span style={{ fontSize: 14, fontWeight: 600 }}>Needs Attention</span>
            </div>
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
              {showRiskDetails ? '▼' : '▶'}
            </span>
          </button>

          <div style={{ marginTop: 8, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {overdueTasks.length > 0 && (
              <div style={{ fontSize: 13 }}>
                <span className="badge badge-danger" style={{ marginRight: 6 }}>
                  {overdueTasks.length}
                </span>
                <span style={{ color: 'var(--color-text-secondary)' }}>
                  {overdueTasks.length === 1 ? 'task overdue' : 'tasks overdue'}
                </span>
              </div>
            )}
            {unassignedHighPriority.length > 0 && (
              <div style={{ fontSize: 13 }}>
                <span className="badge badge-warning" style={{ marginRight: 6 }}>
                  {unassignedHighPriority.length}
                </span>
                <span style={{ color: 'var(--color-text-secondary)' }}>
                  high-priority unassigned
                </span>
              </div>
            )}
          </div>

          {showRiskDetails && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--color-border)' }}>
              {overdueTasks.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 6, textTransform: 'uppercase' }}>
                    Overdue Tasks
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {overdueTasks.slice(0, 3).map((task) => (
                      <div key={task.id} style={{ fontSize: 13, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-danger)', flexShrink: 0 }} />
                        {task.title}
                        {task.due_date && (
                          <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                            (Due {new Date(task.due_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
                          </span>
                        )}
                      </div>
                    ))}
                    {overdueTasks.length > 3 && (
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
                        + {overdueTasks.length - 3} more overdue
                      </div>
                    )}
                  </div>
                </div>
              )}

              {unassignedHighPriority.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 6, textTransform: 'uppercase' }}>
                    Unassigned High Priority
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {unassignedHighPriority.slice(0, 3).map((task) => (
                      <div key={task.id} style={{ fontSize: 13, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-warning)', flexShrink: 0 }} />
                        {task.title}
                      </div>
                    ))}
                    {unassignedHighPriority.length > 3 && (
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
                        + {unassignedHighPriority.length - 3} more unassigned
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
