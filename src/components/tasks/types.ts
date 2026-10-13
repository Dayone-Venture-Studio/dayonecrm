import type { Task, Domain, WeeklyPlan } from '@/types'

export interface StaffMemberEntry {
  user_id: string
  role?: string
  profile: { id: string; full_name: string; email?: string | null } | null
}

export interface TasksClientProps {
  startupId: string
  tasks: Task[]
  domains: Domain[]
  weeklyPlans: Pick<WeeklyPlan, 'id' | 'week_start' | 'week_end' | 'title' | 'goal'>[]
  staffMembers: StaffMemberEntry[]
  isFounder?: boolean
  isStaff?: boolean
  currentUserId?: string
  currentPlanId?: string
}

export interface TaskPermissions {
  canCreateTask: boolean
  canEditTask: (task: Task) => boolean
  canDeleteTask: boolean
}
