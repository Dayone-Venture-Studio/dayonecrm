import 'server-only'
import * as XLSX from 'xlsx'
import type { LoginTimeMatrix, ExportFilterOptions, AttendanceStats } from '@/types'
import { getAllDatesInRange } from '@/lib/utils/date-helpers'

/**
 * Apply filters to login time matrix
 */
export function applyFilters(
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
 * Parse 12-hour time to minutes since midnight
 */
function parseTime12ToMinutes(time: string): number | null {
  if (!time || time === '-') return null

  const match = time.match(/(\d+):(\d+)\s*(AM|PM)/i)
  if (!match) return null

  let hours = parseInt(match[1], 10)
  const minutes = parseInt(match[2], 10)
  const period = match[3].toUpperCase()

  if (period === 'PM' && hours !== 12) hours += 12
  if (period === 'AM' && hours === 12) hours = 0

  return hours * 60 + minutes
}

/**
 * Convert minutes since midnight to 12-hour time string
 */
function minutesToTime12(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = Math.floor(minutes % 60)

  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours

  return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`
}

/**
 * Calculate attendance statistics from matrix
 */
export function calculateAttendanceStats(
  matrix: LoginTimeMatrix,
  filters?: ExportFilterOptions
): AttendanceStats {
  const filtered = applyFilters(matrix, filters)
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
        const minutes = parseTime12ToMinutes(time)
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
      averageTime: presentDays > 0 ? minutesToTime12(empLoginMinutes / presentDays) : null,
    }
  })

  const totalDays = dates.length * filtered.employees.length
  const presentDays = employeeStats.reduce(
    (sum, emp) => sum + dates.filter((d) => filtered.data[d]?.[emp.id]).length,
    0
  )

  return {
    averageLoginTime: totalLogins > 0 ? minutesToTime12(totalLoginMinutes / totalLogins) : null,
    attendanceRate: totalDays > 0 ? (presentDays / totalDays) * 100 : 0,
    earlyCount,
    onTimeCount,
    lateCount,
    totalDays: dates.length,
    presentDays,
    employeeStats,
  }
}

/**
 * Generate CSV buffer from login time matrix
 */
export function generateCSVBuffer(
  matrix: LoginTimeMatrix,
  filters?: ExportFilterOptions
): Buffer {
  const filtered = applyFilters(matrix, filters)
  const dates = getAllDatesInRange(matrix.dateRange.start, matrix.dateRange.end)

  // Build CSV rows
  const rows: string[][] = []

  // Header row
  const header = ['Date', ...filtered.employees.map((emp) => emp.full_name)]
  rows.push(header)

  // Data rows
  dates.forEach((date) => {
    const row = [
      date,
      ...filtered.employees.map((emp) => {
        const time = filtered.data[date]?.[emp.id]
        return time || '-'
      }),
    ]
    rows.push(row)
  })

  // Convert to CSV string
  const csvContent = rows
    .map((row) =>
      row.map((cell) => {
        // Escape cells containing commas or quotes
        if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
          return `"${cell.replace(/"/g, '""')}"`
        }
        return cell
      }).join(',')
    )
    .join('\n')

  return Buffer.from(csvContent, 'utf-8')
}

/**
 * Generate Excel buffer from login time matrix
 */
export async function generateExcelBuffer(
  matrix: LoginTimeMatrix,
  filters?: ExportFilterOptions
): Promise<Buffer> {
  const filtered = applyFilters(matrix, filters)
  const dates = getAllDatesInRange(matrix.dateRange.start, matrix.dateRange.end)

  // Build data array
  const data: (string | number)[][] = []

  // Header row
  const header = ['Date', ...filtered.employees.map((emp) => emp.full_name)]
  data.push(header)

  // Data rows
  dates.forEach((date) => {
    const row: (string | number)[] = [
      date,
      ...filtered.employees.map((emp) => {
        const time = filtered.data[date]?.[emp.id]
        return time || '-'
      }),
    ]
    data.push(row)
  })

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet(data)

  // Set column widths
  const colWidths = [{ wch: 12 }, ...filtered.employees.map(() => ({ wch: 15 }))]
  ws['!cols'] = colWidths

  // Apply basic styling (bold header)
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1')
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col })
    if (!ws[cellAddress]) continue
    ws[cellAddress].s = {
      font: { bold: true },
      alignment: { horizontal: 'center' },
    }
  }

  XLSX.utils.book_append_sheet(wb, ws, 'Login Times')

  // Generate buffer
  const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
  return Buffer.from(excelBuffer)
}
