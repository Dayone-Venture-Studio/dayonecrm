// ─── Enums ─────────────────────────────────────────────────────────────────

export type Role =
  | 'ADMIN'
  | 'FOUNDER'
  | 'STAFF'
  | 'VENTURE_MANAGER'
  | 'EMPLOYEE'
  | 'PROJECT_MANAGER'
export type TeamRole = 'EMPLOYEE' | 'PROJECT_MANAGER'
export type StartupStatus = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'INACTIVE'
export type MemberRole = 'FOUNDER' | 'STAFF'
export type RegistrationStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE'
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH'
export type CompletionStatus = 'EARLY' | 'ON_TIME' | 'LATE'
export type PerformanceStatus = 'AHEAD' | 'ON_TRACK' | 'BEHIND' | 'AT_RISK'
export type WeeklyCompletionStatus =
  | 'COMPLETED_EARLY'
  | 'COMPLETED_ON_TIME'
  | 'COMPLETED_LATE'
  | 'INCOMPLETE'
export type NoteEntityType = 'STARTUP' | 'TASK' | 'WEEKLY_PLAN'
export type NoteUrgency = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type NoteVisibility = 'ADMIN_ONLY' | 'SHARED_WITH_STARTUP'

// ─── DB Row Types ───────────────────────────────────────────────────────────

export interface Profile {
  id: string
  full_name: string
  email?: string | null
  phone: string | null
  role: Role
  department?: string | null
  must_change_password?: boolean
  created_at: string
  updated_at: string
}

export interface Startup {
  id: string
  name: string
  email: string
  phone: string | null
  status: StartupStatus
  logo_url?: string | null
  monthly_revenue?: number | null
  monthly_target?: number | null
  cash_runaway_months?: number | null
  monthly_burn_rate?: number | null
  customer_acquisition_cost?: number | null
  created_at: string
  updated_at: string
}

export interface StartupMember {
  id: string
  startup_id: string
  user_id: string
  role: MemberRole
  created_at: string
}

export interface RegistrationRequest {
  id: string
  startup_id: string
  status: RegistrationStatus
  reviewed_by: string | null
  reviewed_at: string | null
  rejection_reason: string | null
  created_at: string
}

export interface Domain {
  id: string
  startup_id: string
  name: string
  description: string | null
  created_at: string
}

export interface WeeklyPlan {
  id: string
  startup_id: string
  title?: string | null
  week_start: string
  week_end: string
  goal: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  startup_id: string
  weekly_plan_id: string | null
  domain_id: string | null
  assigned_to: string | null
  created_by: string
  title: string
  description: string | null
  priority: TaskPriority
  status: TaskStatus
  due_date: string | null
  created_at: string
  updated_at: string
  started_at?: string | null
  completed_at: string | null
  completion_status: CompletionStatus | null
}

export interface TaskUpdate {
  id: string
  task_id: string
  user_id: string
  comment: string
  created_at: string
}

export interface WeeklyPerformance {
  id: string
  startup_id: string
  weekly_plan_id: string
  total_tasks: number
  completed_tasks: number
  pending_tasks: number
  in_progress_tasks: number
  early_tasks: number
  on_time_tasks: number
  late_tasks: number
  overdue_tasks: number
  completion_rate: number
  early_rate: number
  on_time_rate: number
  late_rate: number
  performance_status: PerformanceStatus
  planned_end_date: string | null
  actual_completion_date: string | null
  days_early: number | null
  weekly_completion_status: WeeklyCompletionStatus
  created_at: string
  updated_at: string
}

export interface ActivityLog {
  id: string
  startup_id: string | null
  user_id: string
  action: string
  entity_type: string | null
  entity_id: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface VentureManagerNote {
  id: string
  created_by: string
  entity_type: NoteEntityType
  entity_id: string
  note_text: string
  urgency: NoteUrgency
  visibility: NoteVisibility
  resolved: boolean
  resolved_by: string | null
  resolved_at: string | null
  acknowledged: boolean
  acknowledged_by: string | null
  acknowledged_at: string | null
  created_at: string
  updated_at: string
}

// ─── Joined / Enriched Types ────────────────────────────────────────────────

export interface StartupWithFounder extends Startup {
  founder: Profile | null
  latest_performance: WeeklyPerformance | null
}

export interface TaskWithDetails extends Task {
  assigned_profile: Profile | null
  created_by_profile: Profile | null
  domain: Domain | null
}

export interface RegistrationRequestWithStartup extends RegistrationRequest {
  startup: Startup
  founder: Profile | null
}

export interface ActivityLogWithProfile extends ActivityLog {
  profile: Profile | null
}

export interface StartupMemberWithProfile extends StartupMember {
  profile: Profile
}

export interface VentureManagerNoteWithProfile extends VentureManagerNote {
  creator: Profile | null
  resolver: Profile | null
  acknowledger: Profile | null
}

export interface VentureManagerNoteWithEntity extends VentureManagerNote {
  creator: Profile | null
  startup?: Startup | null
  task?: Task | null
  weekly_plan?: WeeklyPlan | null
}

export interface VentureManagerNoteWithContext extends VentureManagerNoteWithProfile {
  startup_id: string | null
  startup_name: string | null
  entity_label: string | null
}

// ─── Internal Team Tasks ────────────────────────────────────────────────────

export interface TeamTask {
  id: string
  title: string
  description: string | null
  assigned_to: string | null
  created_by: string | null
  status: TaskStatus
  priority: TaskPriority
  due_date: string | null
  department: string | null
  created_at: string
  updated_at: string
}

export interface TeamTaskComment {
  id: string
  task_id: string
  user_id: string
  comment: string
  created_at: string
}

export interface TeamTaskActivity {
  id: string
  task_id: string
  user_id: string | null
  from_status: TaskStatus | null
  to_status: TaskStatus
  created_at: string
}

export type TeamMemberSummary = Pick<Profile, 'id' | 'full_name' | 'email' | 'department'>

// ─── Leave Requests ──────────────────────────────────────────

export type LeaveDurationType = 'FULL_DAY' | 'HALF_DAY'
export type HalfDaySlot = 'FIRST_HALF' | 'SECOND_HALF'
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'

export interface LeaveRequest {
  id: string
  user_id: string
  duration_type: LeaveDurationType
  half_day_slot: HalfDaySlot | null
  start_date: string
  end_date: string
  reason: string
  status: LeaveStatus
  reviewed_by: string | null
  reviewed_at: string | null
  review_note: string | null
  created_at: string
  updated_at: string
}

export interface LeaveRequestWithProfile extends LeaveRequest {
  requester: Pick<Profile, 'id' | 'full_name' | 'email' | 'department' | 'role'> | null
  reviewer: Pick<Profile, 'id' | 'full_name'> | null
}

/** Team task row with the profiles it is rendered with. */
export interface TeamTaskWithDetails extends TeamTask {
  assigned_profile: TeamMemberSummary | null
  created_by_profile: Pick<Profile, 'id' | 'full_name'> | null
}

/** A comment joined to the profile of its author. */
export interface TeamTaskCommentWithProfile extends TeamTaskComment {
  author: Pick<Profile, 'id' | 'full_name'> | null
}

/** A status-change activity joined to the profile that made the change. */
export interface TeamTaskActivityWithProfile extends TeamTaskActivity {
  actor: Pick<Profile, 'id' | 'full_name'> | null
}

/** Everything the task detail modal needs, in one payload. */
export interface TeamTaskDetail {
  task: TeamTaskWithDetails
  comments: TeamTaskCommentWithProfile[]
  activities: TeamTaskActivityWithProfile[]
}

export interface TeamTaskStats {
  total: number
  inProgress: number
  completed: number
  overdue: number
}

// ─── Form / Action State Types ──────────────────────────────────────────────

export type ActionState = {
  error?: string
  success?: string
  data?: unknown
}

// ─── Session / Auth ─────────────────────────────────────────────────────────

export interface SessionUser {
  id: string
  email: string
  role: Role
  full_name: string
  must_change_password?: boolean
}

// ─── Login Time Export Types ────────────────────────────────────────────────

/** Employee information for login time export */
export interface LoginTimeEmployee {
  id: string
  full_name: string
  department: string | null
  email: string | null
}

/** Login time data structure: date -> userId -> time */
export interface LoginTimeData {
  [date: string]: {
    [userId: string]: string | null
  }
}

/** Complete login time matrix for export */
export interface LoginTimeMatrix {
  dateRange: {
    start: string
    end: string
  }
  employees: LoginTimeEmployee[]
  data: LoginTimeData
}

/** Export format options */
export type ExportFormat = 'csv' | 'xlsx'

/** Export period options */
export type ExportPeriod = 'week' | 'month'

/** Attendance statistics */
export interface AttendanceStats {
  averageLoginTime: string | null
  attendanceRate: number
  earlyCount: number
  onTimeCount: number
  lateCount: number
  totalDays: number
  presentDays: number
  employeeStats: {
    id: string
    name: string
    attendance: number
    averageTime: string | null
  }[]
}

/** Filter options for export */
export interface ExportFilterOptions {
  departmentFilters?: string[]
  employeeFilters?: string[]
}
