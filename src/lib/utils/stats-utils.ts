import type { LoginTimeMatrix, ExportFilterOptions, AttendanceStats } from '@/types'
import { getAllDatesInRange } from './date-helpers'

/**
 * Parse 12-hour time to { hours, minutes }
 */
function parseTime12Hour(time: string): { hours: number; minutes: number } | null {
  if (!time || time === '-') return null

  const match = time.match(/(\d+):(\d+)\s*(AM|PM)/i)
  if (!match) return null

  let hours = parseInt(match[1], 10)
  const minutes = parseInt(match[2], 10)
  const period = match[3].toUpperCase()

  if (period === 'PM' && hours !== 12) hours += 12
  if (period === 'AM' && hours === 12) hours = 0

  return { hours, minutes }
}

/**
 * Convert time string to minutes since midnight
 */
function timeToMinutes(time: string): number | null {
  const parsed = parseTime12Hour(time)
  if (!parsed) return null
  return parsed.hours * 60 + parsed.minutes
}

/**
 * Convert minutes since midnight to 12-hour time string
 */
function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = Math.floor(minutes % 60)

  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours

  return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`
}

/**
 * Apply filters to matrix (client-side version)
 */
function applyFilters(
  matrix: LoginTimeMatrix,
  filters?: ExportFilterOptions
): LoginTimeMatrix {
  if (!filters || (!filters.departmentFilters?.length && !filters.employeeFilters?.length)) {
    return matrix
  }

  let filteredEmployees = matrix.employees

  // Filter by department
  if (filters.departmentFilters && filters.departmentFilters.length > 0) {
    filteredEmployees = filteredEmployees.filter((emp) =>
      filters.departmentFilters!.includes(emp.department || '')
    )
  }

  // Filter by specific employees
  if (filters.employeeFilters && filters.employeeFilters.length > 0) {
    filteredEmployees = filteredEmployees.filter((emp) =>
      filters.employeeFilters!.includes(emp.id)
    )
  }

  // Filter data to only include filtered employees
  const filteredData: typeof matrix.data = {}
  Object.keys(matrix.data).forEach((date) => {
    filteredData[date] = {}
    filteredEmployees.forEach((emp) => {
      filteredData[date][emp.id] = matrix.data[date][emp.id] || null
    })
  })

  return {
    ...matrix,
    employees: filteredEmployees,
    data: filteredData,
  }
}

/**
 * Calculate attendance statistics from matrix data
 */
export function calculateStatsFromMatrix(
  matrix: LoginTimeMatrix,
  filters?: ExportFilterOptions
): AttendanceStats {
  const filtered = applyFilters(matrix, filters)
  
  // Handle empty case
  if (filtered.employees.length === 0) {
    return {
      averageLoginTime: null,
      attendanceRate: 0,
      earlyCount: 0,
      onTimeCount: 0,
      lateCount: 0,
      totalDays: 0,
      presentDays: 0,
      employeeStats: [],
    }
  }

  const dates = getAllDatesInRange(matrix.dateRange.start, matrix.dateRange.end)

  let totalLoginMinutes = 0
  let totalLogins = 0
  let earlyCount = 0
  let onTimeCount = 0
  let lateCount = 0

  const employeeStats = filtered.employees.map((emp) => {
    let presentDays = 0
    let empLoginMinutes = 0

    dates.forEach((date) => {
      const time = filtered.data[date]?.[emp.id]
      if (time) {
        presentDays++
        const minutes = timeToMinutes(time)
        if (minutes !== null) {
          empLoginMinutes += minutes
          totalLoginMinutes += minutes
          totalLogins++

          // Categorize time
          const time9AM = 9 * 60 // 540 minutes
          const time930AM = 9 * 60 + 30 // 570 minutes

          if (minutes < time9AM) earlyCount++
          else if (minutes <= time930AM) onTimeCount++
          else lateCount++
        }
      }
    })

    return {
      id: emp.id,
      name: emp.full_name,
      attendance: dates.length > 0 ? (presentDays / dates.length) * 100 : 0,
      averageTime: presentDays > 0 ? minutesToTime(empLoginMinutes / presentDays) : null,
    }
  })

  const totalDays = dates.length * filtered.employees.length
  const presentDays = employeeStats.reduce(
    (sum, emp) => sum + dates.filter((d) => filtered.data[d]?.[emp.id]).length,
    0
  )

  return {
    averageLoginTime: totalLogins > 0 ? minutesToTime(totalLoginMinutes / totalLogins) : null,
    attendanceRate: totalDays > 0 ? (presentDays / totalDays) * 100 : 0,
    earlyCount,
    onTimeCount,
    lateCount,
    totalDays: dates.length,
    presentDays,
    employeeStats,
  }
}
