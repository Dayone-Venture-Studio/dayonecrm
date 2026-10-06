'use client'

import { useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { NoteModal } from './NoteModal'
import type { Startup, Task, Domain, Profile, WeeklyPlan, VentureManagerNoteWithProfile, NoteEntityType } from '@/types'
import type { StartupHealthSummary } from '@/lib/performance/calculateStartupHealth'
import {
  Users,
  Layers,
  CheckSquare,
  MessageSquare,
  TrendingUp,
  Calendar,
} from 'lucide-react'

interface Props {
  startup: Startup
  health: StartupHealthSummary
  tasks: Task[]
  domains: Domain[]
  founder: Profile | null
  staff: Profile[]
  currentWeeklyPlan: WeeklyPlan | null
  activeTab: TabType
  noteCount: number
  children?: ReactNode
}

type TabType = 'overview' | 'tasks' | 'notes' | 'trends'

export function StartupDetailClient({
  startup,
  health,
  tasks,
  domains,
  founder,
  staff,
  currentWeeklyPlan,
  activeTab,
  noteCount,
  children,
}: Props) {
  const router = useRouter()
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<VentureManagerNoteWithProfile | null>(null)

  // Note Modal Context State
  const [noteEntityType, setNoteEntityType] = useState<NoteEntityType>('STARTUP')
  const [noteEntityId, setNoteEntityId] = useState<string>(startup.id)
  const [noteEntityName, setNoteEntityName] = useState<string>(startup.name)

  const openNoteModal = (type: NoteEntityType = 'STARTUP', id: string = startup.id, name: string = startup.name, existing: VentureManagerNoteWithProfile | null = null) => {
    setNoteEntityType(type)
    setNoteEntityId(id)
    setNoteEntityName(name)
    setEditingNote(existing)
    setIsNoteModalOpen(true)
  }

  const basePath = `/venture-manager/startups/${startup.id}`
  const tabHref = (id: TabType) => (id === 'overview' ? basePath : `${basePath}?tab=${id}`)

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: TrendingUp },
    { id: 'tasks' as TabType, label: `Tasks (${tasks.length})`, icon: CheckSquare },
    { id: 'notes' as TabType, label: `Notes (${noteCount})`, icon: MessageSquare },
    { id: 'trends' as TabType, label: 'Trends', icon: Calendar },
  ]

  const handleNoteSuccess = () => {
    router.refresh()
  }

  const tasksByStatus = {
    done: tasks.filter((t) => t.status === 'DONE'),
    inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS'),
    todo: tasks.filter((t) => t.status === 'TODO'),
  }

  return (
    <>
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
      }}>
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border-subtle)', padding: '0 8px', background: 'var(--color-surface-2)' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <Link
                key={tab.id}
                href={tabHref(tab.id)}
                scroll={false}
                style={{
                  padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 8,
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  fontSize: 14, fontWeight: isActive ? 700 : 600,
                  color: isActive ? 'var(--color-brand)' : 'var(--color-text-muted)',
                  borderBottom: `2px solid ${isActive ? 'var(--color-brand)' : 'transparent'}`,
                  marginBottom: -1, transition: 'all 0.2s',
                  textDecoration: 'none',
                }}
              >
                <Icon size={16} />
                {tab.label}
              </Link>
            )
          })}
        </div>

        {/* Tab Content */}
        <div style={{ padding: 32 }}>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              {/* Key Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                {[
                  { label: 'Completion Rate', value: `${health.completionRate}%`, color: '#059669', bg: 'rgba(5,150,105,0.06)', border: 'rgba(5,150,105,0.2)' },
                  { label: 'Total Tasks', value: health.totalTasks, color: '#0284c7', bg: 'rgba(2,132,199,0.06)', border: 'rgba(2,132,199,0.2)' },
                  { label: 'Overdue Tasks', value: health.overdueTasks, color: '#d97706', bg: 'rgba(217,119,6,0.06)', border: 'rgba(217,119,6,0.2)' },
                  { label: 'Active Blockers', value: health.blockers.length, color: '#ca2f2b', bg: 'rgba(202,47,43,0.06)', border: 'rgba(202,47,43,0.2)' },
                ].map((m, i) => (
                  <div key={i} style={{
                    background: m.bg, border: `1px solid ${m.border}`, borderRadius: 12, padding: '20px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: 32, fontWeight: 800, color: m.color, lineHeight: 1 }}>{m.value}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: m.color, marginTop: 8, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{m.label}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                {/* Team */}
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <Users size={18} color="var(--color-text-muted)" />
                    Team ({staff.length + (founder ? 1 : 0)})
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {founder && (
                      <div style={{
                        background: 'rgba(2,132,199,0.03)', border: '1px solid rgba(2,132,199,0.15)',
                        borderRadius: 10, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                      }}>
                        <div>
                          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>{founder.full_name}</p>
                          <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>{founder.email}</p>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 800, color: '#0284c7', background: 'rgba(2,132,199,0.1)', padding: '4px 10px', borderRadius: 999, letterSpacing: '0.5px' }}>
                          FOUNDER
                        </span>
                      </div>
                    )}
                    {staff.map((member) => (
                      <div key={member.id} style={{
                        background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                        borderRadius: 10, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                      }}>
                        <div>
                          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>{member.full_name}</p>
                          <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>{member.email}</p>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', background: 'var(--color-surface-2)', padding: '4px 10px', borderRadius: 999, letterSpacing: '0.5px' }}>
                          STAFF
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Domains */}
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <Layers size={18} color="var(--color-text-muted)" />
                    Domains ({domains.length})
                  </h3>
                  {domains.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                      {domains.map((domain) => {
                        const domainTasks = tasks.filter((t) => t.domain_id === domain.id)
                        const domainHealth = health.domains.find((d) => d.id === domain.id)
                        return (
                          <div key={domain.id} style={{
                            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                            borderRadius: 10, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                          }}>
                            <div>
                              <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>{domain.name}</h4>
                              {domain.description && <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>{domain.description}</p>}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                              <span style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 500 }}>{domainTasks.length} tasks</span>
                              {domainHealth && <span style={{ fontSize: 12, fontWeight: 700, color: '#059669' }}>{domainHealth.rate}% complete</span>}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>No domains defined.</p>
                  )}
                </div>
              </div>

              {/* Current Weekly Plan */}
              {currentWeeklyPlan && (
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <Calendar size={18} color="var(--color-text-muted)" />
                    Current Weekly Plan
                  </h3>
                  <div style={{
                    background: 'rgba(2,132,199,0.03)', border: '1px solid rgba(2,132,199,0.15)',
                    borderRadius: 12, padding: 24, borderLeft: '4px solid #0284c7', position: 'relative'
                  }}>
                    <button
                      onClick={() => openNoteModal('WEEKLY_PLAN', currentWeeklyPlan.id, currentWeeklyPlan.title || 'Weekly Plan')}
                      style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', cursor: 'pointer', padding: 8, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600 }}
                      title="Flag Issue"
                    >
                      <MessageSquare size={14} /> Flag
                    </button>
                    {currentWeeklyPlan.title && (
                      <h4 style={{ margin: '0 0 8px 0', fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        {currentWeeklyPlan.title}
                      </h4>
                    )}
                    <p style={{ margin: '0 0 12px 0', fontSize: 13, color: '#0284c7', fontWeight: 600 }}>
                      {new Date(currentWeeklyPlan.week_start).toLocaleDateString()} — {new Date(currentWeeklyPlan.week_end).toLocaleDateString()}
                    </p>
                    {currentWeeklyPlan.goal && (
                      <p style={{ margin: 0, fontSize: 14, color: 'var(--color-text-primary)', fontStyle: 'italic', opacity: 0.8 }}>
                        {currentWeeklyPlan.goal}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              {['done', 'inProgress', 'todo'].map((status) => {
                const statusTasks = tasksByStatus[status as keyof typeof tasksByStatus]
                const statusLabels = { done: 'Done', inProgress: 'In Progress', todo: 'To Do' }

                return (
                  <div key={status}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                      {statusLabels[status as keyof typeof statusLabels]}
                      <span style={{ fontSize: 12, background: 'var(--color-surface-2)', padding: '2px 8px', borderRadius: 999, color: 'var(--color-text-muted)' }}>{statusTasks.length}</span>
                    </h3>
                    {statusTasks.length > 0 ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
                        {statusTasks.map((task) => (
                          <div key={task.id} style={{
                            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                            borderRadius: 10, padding: 16, display: 'flex', flexDirection: 'column', gap: 8, position: 'relative'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                              <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.4, flex: 1 }}>{task.title}</h4>
                              <button
                                onClick={() => openNoteModal('TASK', task.id, task.title)}
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}
                                title="Flag this task"
                              >
                                <MessageSquare size={14} />
                              </button>
                            </div>
                            {task.description && (
                              <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-muted)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                {task.description}
                              </p>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 'auto', paddingTop: 8 }}>
                              <span style={{
                                fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, letterSpacing: '0.5px',
                                color: task.priority === 'HIGH' ? '#ca2f2b' : task.priority === 'MEDIUM' ? '#d97706' : '#0284c7',
                                background: task.priority === 'HIGH' ? 'rgba(202,47,43,0.1)' : task.priority === 'MEDIUM' ? 'rgba(217,119,6,0.1)' : 'rgba(2,132,199,0.1)',
                              }}>
                                {task.priority}
                              </span>
                              {task.due_date && (
                                <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 500 }}>
                                  Due: {new Date(task.due_date).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: 14, color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No {statusLabels[status as keyof typeof statusLabels].toLowerCase()} tasks.</p>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Notes & Trends tabs — data streamed in by server */}
          {(activeTab === 'notes' || activeTab === 'trends') && children}
        </div>
      </div>

      {/* Note Modal */}
      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onSuccess={handleNoteSuccess}
        entityType={noteEntityType}
        entityId={noteEntityId}
        entityName={noteEntityName}
        existingNote={editingNote}
      />
    </>
  )
}
