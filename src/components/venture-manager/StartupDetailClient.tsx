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

const SECTION_TITLE = 'flex items-center gap-2 mb-4 text-base font-bold text-text-primary'

const PRIORITY_BADGE: Record<string, string> = {
  LOW: 'badge-info',
  MEDIUM: 'badge-warning',
  HIGH: 'badge-danger',
}

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
      <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-sm">
        {/* Tabs */}
        <div className="flex border-b border-border-subtle px-2 bg-surface-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <Link
                key={tab.id}
                href={tabHref(tab.id)}
                scroll={false}
                className={`flex items-center gap-2 px-5 py-4 text-sm no-underline border-b-2 -mb-px transition-all duration-200 ${
                  isActive
                    ? 'border-brand font-bold text-brand'
                    : 'border-transparent font-semibold text-text-muted'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </Link>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-8">
              {/* Key Metrics */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Completion Rate', value: `${health.completionRate}%`, cls: 'border-[rgba(5,150,105,0.2)] bg-[rgba(5,150,105,0.06)] text-[#059669]' },
                  { label: 'Total Tasks', value: health.totalTasks, cls: 'border-[rgba(2,132,199,0.2)] bg-[rgba(2,132,199,0.06)] text-[#0284c7]' },
                  { label: 'Overdue Tasks', value: health.overdueTasks, cls: 'border-[rgba(217,119,6,0.2)] bg-[rgba(217,119,6,0.06)] text-[#d97706]' },
                  { label: 'Active Blockers', value: health.blockers.length, cls: 'border-[rgba(202,47,43,0.2)] bg-[rgba(202,47,43,0.06)] text-[#ca2f2b]' },
                ].map((m, i) => (
                  <div key={i} className={`flex flex-col items-center justify-center rounded-[12px] border p-5 ${m.cls}`}>
                    <span className="text-[32px] font-extrabold leading-none">{m.value}</span>
                    <span className="mt-2 text-xs font-bold uppercase tracking-[0.5px] opacity-80">{m.label}</span>
                  </div>
                ))}
              </div>

                            {/* Current Weekly Plan */}
              {currentWeeklyPlan && (
                <div>
                  <h3 className={SECTION_TITLE}>
                    <Calendar size={18} className="text-text-muted" />
                    Current Weekly Plan
                  </h3>
                  <div className="relative rounded-[12px] border border-[rgba(2,132,199,0.15)] border-l-4 border-l-[#0284c7] bg-[rgba(2,132,199,0.03)] p-6">
                    <button
                      onClick={() => openNoteModal('WEEKLY_PLAN', currentWeeklyPlan.id, currentWeeklyPlan.title || 'Weekly Plan')}
                      className="absolute right-4 top-4 flex cursor-pointer items-center gap-1.5 border-none bg-transparent p-2 text-xs font-semibold text-text-muted"
                      title="Flag Issue"
                    >
                      <MessageSquare size={14} /> Flag
                    </button>
                    {currentWeeklyPlan.title && (
                      <h4 className="m-0 mb-2 text-base font-bold text-text-primary">
                        {currentWeeklyPlan.title}
                      </h4>
                    )}
                    <p className="m-0 mb-3 text-[13px] font-semibold text-info">
                      {new Date(currentWeeklyPlan.week_start).toLocaleDateString()} — {new Date(currentWeeklyPlan.week_end).toLocaleDateString()}
                    </p>
                    {currentWeeklyPlan.goal && (
                      <p className="m-0 text-sm italic text-text-primary opacity-80">
                        {currentWeeklyPlan.goal}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-8">
                {/* Team */}
                <div>
                  <h3 className={SECTION_TITLE}>
                    <Users size={18} className="text-text-muted" />
                    Team ({staff.length + (founder ? 1 : 0)})
                  </h3>
                  <div className="flex flex-col gap-3">
                    {founder && (
                      <div className="flex items-center justify-between rounded-[10px] border border-[rgba(2,132,199,0.15)] bg-[rgba(2,132,199,0.03)] p-4">
                        <div>
                          <p className="m-0 text-sm font-bold text-text-primary">{founder.full_name}</p>
                          <p className="m-0 mt-0.5 text-[13px] text-text-muted">{founder.email}</p>
                        </div>
                        <span className="rounded-full bg-info-dim px-2.5 py-1 text-[10px] font-extrabold tracking-[0.5px] text-info">
                          FOUNDER
                        </span>
                      </div>
                    )}
                    {staff.map((member) => (
                      <div key={member.id} className="flex items-center justify-between rounded-[10px] border border-border bg-surface p-4">
                        <div>
                          <p className="m-0 text-sm font-semibold text-text-primary">{member.full_name}</p>
                          <p className="m-0 mt-0.5 text-[13px] text-text-muted">{member.email}</p>
                        </div>
                        <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[10px] font-bold tracking-[0.5px] text-text-muted">
                          STAFF
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Domains */}
                <div>
                  <h3 className={SECTION_TITLE}>
                    <Layers size={18} className="text-text-muted" />
                    Domains ({domains.length})
                  </h3>
                  {domains.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                      {domains.map((domain) => {
                        const domainTasks = tasks.filter((t) => t.domain_id === domain.id)
                        const domainHealth = health.domains.find((d) => d.id === domain.id)
                        return (
                          <div key={domain.id} className="flex items-center justify-between rounded-[10px] border border-border bg-surface p-4">
                            <div>
                              <h4 className="m-0 text-sm font-semibold text-text-primary">{domain.name}</h4>
                              {domain.description && <p className="m-0 mt-1 text-[13px] text-text-muted">{domain.description}</p>}
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-xs font-medium text-text-muted">{domainTasks.length} tasks</span>
                              {domainHealth && <span className="text-xs font-bold text-success">{domainHealth.rate}% complete</span>}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-text-muted">No domains defined.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-3">
              {['todo', 'inProgress', 'done'].map((status) => {
                const statusTasks = tasksByStatus[status as keyof typeof tasksByStatus]
                const statusLabels = { done: 'Done', inProgress: 'In Progress', todo: 'To Do' }

                return (
                  <div key={status} className="flex flex-col">
                    <h3 className={SECTION_TITLE}>
                      {statusLabels[status as keyof typeof statusLabels]}
                      <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs text-text-muted">{statusTasks.length}</span>
                    </h3>
                    {statusTasks.length > 0 ? (
                      <div className="flex max-h-[70vh] flex-col gap-3 overflow-y-auto pr-1">
                        {statusTasks.map((task) => (
                          <div key={task.id} className="relative flex flex-col gap-2 rounded-[10px] border border-border bg-surface p-4">
                            <div className="flex items-start justify-between gap-3">
                              <h4 className="m-0 flex-1 text-sm font-semibold leading-[1.4] text-text-primary">{task.title}</h4>
                              <button
                                onClick={() => openNoteModal('TASK', task.id, task.title)}
                                className="flex cursor-pointer items-center border-none bg-transparent p-1 text-text-muted"
                                title="Flag this task"
                              >
                                <MessageSquare size={14} />
                              </button>
                            </div>
                            {task.description && (
                              <p className="m-0 text-[13px] text-text-muted line-clamp-2">
                                {task.description}
                              </p>
                            )}
                            <div className="mt-auto flex items-center gap-2 pt-2">
                              <span className={`badge ${PRIORITY_BADGE[task.priority] || 'badge-neutral'}`}>
                                {task.priority}
                              </span>
                              {task.due_date && (
                                <span className="text-[11px] font-medium text-text-muted">
                                  Due: {new Date(task.due_date).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm italic text-text-muted">No {statusLabels[status as keyof typeof statusLabels].toLowerCase()} tasks.</p>
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
