import type { Metadata } from 'next'
import { PageHeader } from '@/components/layout/PageHeader'
import { TaskBoard } from '@/components/team/TaskBoard'
import { requireTeamMember } from '@/lib/auth/requireRole'
import { getAllTeamTasks, getMyTeamTasks, getTeamTaskStats } from '@/lib/team/task-queries'
import { getAllTeamMembers } from '@/lib/team/member-queries'

export const metadata: Metadata = { title: 'Daily Sprint' }

export default async function DailySprintPage() {
  const session = await requireTeamMember()
  const isProjectManager = session.role === 'PROJECT_MANAGER'

  const [tasks, members, stats] = await Promise.all([
    isProjectManager ? getAllTeamTasks() : getMyTeamTasks(session.id),
    isProjectManager ? getAllTeamMembers() : Promise.resolve([]),
    getTeamTaskStats(isProjectManager ? undefined : session.id),
  ])

  return (
    <div>
      <PageHeader
        title={isProjectManager ? 'Team Sprint Board' : 'My Sprint Board'}
        subtitle={
          isProjectManager
            ? 'All internal tasks across the team'
            : 'Your assigned tasks'
        }
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <span className="badge badge-info">{stats.inProgress} In Progress</span>
            <span className="badge badge-success">{stats.completed} Done</span>
            {stats.overdue > 0 && <span className="badge badge-danger">{stats.overdue} Overdue</span>}
          </div>
        }
      />

      <TaskBoard
        tasks={tasks}
        members={members}
        isProjectManager={isProjectManager}
      />
    </div>
  )
}
