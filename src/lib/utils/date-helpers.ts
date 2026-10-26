import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addWeeks,
  addMonths,
  format,
  eachDayOfInterval,
} from 'date-fns'

/**
 * Convert Date to ISO date string (YYYY-MM-DD)
 */
function toISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

/**
 * Get current week range (Monday to Sunday)
 */
export function getCurrentWeekRange(): { start: string; end: string } {
  const now = new Date()
  const start = startOfWeek(now, { weekStartsOn: 1 }) // 1 = Monday
  const end = endOfWeek(now, { weekStartsOn: 1 })
  
  return {
    start: toISODate(start),
    end: toISODate(end),
  }
}

/**
 * Get previous week range from a given start date
 */
export function getPreviousWeekRange(currentStart: string): { start: string; end: string } {
  const current = new Date(currentStart + 'T00:00:00')
  const previous = addWeeks(current, -1)
  const start = startOfWeek(previous, { weekStartsOn: 1 })
  const end = endOfWeek(previous, { weekStartsOn: 1 })
  
  return {
    start: toISODate(start),
    end: toISODate(end),
  }
}

/**
 * Get next week range from a given start date
 */
export function getNextWeekRange(currentStart: string): { start: string; end: string } {
  const current = new Date(currentStart + 'T00:00:00')
  const next = addWeeks(current, 1)
  const start = startOfWeek(next, { weekStartsOn: 1 })
  const end = endOfWeek(next, { weekStartsOn: 1 })
  
  return {
    start: toISODate(start),
    end: toISODate(end),
  }
}

/**
 * Get current month range
 */
export function getCurrentMonthRange(): { start: string; end: string } {
  const now = new Date()
  const start = startOfMonth(now)
  const end = endOfMonth(now)
  
  return {
    start: toISODate(start),
    end: toISODate(end),
  }
}

/**
 * Get previous month range from a given start date
 */
export function getPreviousMonthRange(currentStart: string): { start: string; end: string } {
  const current = new Date(currentStart + 'T00:00:00')
  const previous = addMonths(current, -1)
  const start = startOfMonth(previous)
  const end = endOfMonth(previous)
  
  return {
    start: toISODate(start),
    end: toISODate(end),
  }
}

/**
 * Get next month range from a given start date
 */
export function getNextMonthRange(currentStart: string): { start: string; end: string } {
  const current = new Date(currentStart + 'T00:00:00')
  const next = addMonths(current, 1)
  const start = startOfMonth(next)
  const end = endOfMonth(next)
  
  return {
    start: toISODate(start),
    end: toISODate(end),
  }
}

/**
 * Format date range for display
 * @example "Oct 21 - Oct 27, 2026" or "October 2026"
 */
export function formatDateRange(start: string, end: string, period: 'week' | 'month' = 'week'): string {
  const startDate = new Date(start + 'T00:00:00')
  const endDate = new Date(end + 'T00:00:00')
  
  if (period === 'month') {
    return format(startDate, 'MMMM yyyy')
  }
  
  // Week format
  const startMonth = format(startDate, 'MMM')
  const endMonth = format(endDate, 'MMM')
  const year = format(endDate, 'yyyy')
  
  if (startMonth === endMonth) {
    return `${startMonth} ${format(startDate, 'd')} - ${format(endDate, 'd')}, ${year}`
  } else {
    return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d')}, ${year}`
  }
}

/**
 * Get all dates in a range as ISO strings
 */
export function getAllDatesInRange(start: string, end: string): string[] {
  const startDate = new Date(start + 'T00:00:00')
  const endDate = new Date(end + 'T00:00:00')
  
  const dates = eachDayOfInterval({ start: startDate, end: endDate })
  return dates.map(toISODate)
}

/**
 * Check if a date range includes any future dates
 */
export function hasFutureDates(endDate: string): boolean {
  const end = new Date(endDate + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  return end > today
}
