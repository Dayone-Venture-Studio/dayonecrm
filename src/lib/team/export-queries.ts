import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { LoginTimeEmployee, LoginTimeMatrix, LoginTimeData } from '@/types'

/**
 * Parse login time from daily report content JSONB
 */
function parseLoginTime(content: Record<string, unknown>): string | null {
  if (!content || typeof content !== 'object') return null
  const loginTime = content.login_time
  if (typeof loginTime === 'string' && loginTime.trim() !== '') {
    return loginTime
  }
  return null
}

/**
 * Format 24-hour time to 12-hour format with AM/PM
 */
export function formatTime12Hour(time24: string): string {
  if (!time24 || !time24.includes(':')) return time24
  
  const [hours, minutes] = time24.split(':')
  const h = parseInt(hours, 10)
  const m = minutes || '00'
  
  if (isNaN(h)) return time24
  
  if (h === 0) return `12:${m} AM`
  if (h < 12) return `${h}:${m} AM`
  if (h === 12) return `12:${m} PM`
  return `${h - 12}:${m} PM`
}

/**
 * Get all team members (EMPLOYEE + PROJECT_MANAGER roles)
 */
export async function getTeamMembers(): Promise<LoginTimeEmployee[]> {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, email, department')
    .in('role', ['EMPLOYEE', 'PROJECT_MANAGER'])
    .order('department', { ascending: true, nullsFirst: false })
    .order('full_name', { ascending: true })
  
  return (data || []) as LoginTimeEmployee[]
}

/**
 * Get login time reports for a date range in matrix format
 */
export async function getLoginTimeReports(
  startDate: string,
  endDate: string
): Promise<LoginTimeMatrix> {
  const supabase = await createClient()
  
  // Fetch all team members
  const employees = await getTeamMembers()
  
  // Fetch daily reports in the date range
  const { data: reports } = await supabase
    .from('daily_reports')
    .select('user_id, report_date, content')
    .gte('report_date', startDate)
    .lte('report_date', endDate)
    .order('report_date', { ascending: true })
  
  // Build the data matrix
  const data: LoginTimeData = {}
  
  // Initialize data structure for all dates
  const currentDate = new Date(startDate + 'T00:00:00')
  const end = new Date(endDate + 'T00:00:00')
  
  while (currentDate <= end) {
    const dateStr = currentDate.toISOString().split('T')[0]
    data[dateStr] = {}
    
    // Initialize all employees with null
    employees.forEach((emp) => {
      data[dateStr][emp.id] = null
    })
    
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  // Fill in actual login times from reports
  if (reports) {
    reports.forEach((report) => {
      const loginTime = parseLoginTime(report.content as Record<string, unknown>)
      if (loginTime && data[report.report_date]) {
        const formatted = formatTime12Hour(loginTime)
        data[report.report_date][report.user_id] = formatted
      }
    })
  }
  
  return {
    dateRange: { start: startDate, end: endDate },
    employees,
    data,
  }
}
