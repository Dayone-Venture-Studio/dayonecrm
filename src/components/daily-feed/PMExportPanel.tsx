'use client'

import { useState, useEffect, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Download, FileSpreadsheet, ChevronDown, ChevronUp, Clock, Users, TrendingUp } from 'lucide-react'
import type { Role, LoginTimeEmployee, ExportPeriod, ExportFilterOptions, AttendanceStats } from '@/types'
import {
  getCurrentWeekRange,
  getCurrentMonthRange,
  getPreviousWeekRange,
  getPreviousMonthRange,
  getNextWeekRange,
  getNextMonthRange,
  formatDateRange,
  hasFutureDates,
} from '@/lib/utils/date-helpers'

interface Props {
  userRole: Role
  teamMembers: LoginTimeEmployee[]
}

export function PMExportPanel({ userRole, teamMembers }: Props) {
  // Don't render for non-PROJECT_MANAGER users
  if (userRole !== 'PROJECT_MANAGER') return null

  const [period, setPeriod] = useState<ExportPeriod>('week')
  const [dateRange, setDateRange] = useState(getCurrentWeekRange())
  const [departmentFilters, setDepartmentFilters] = useState<string[]>([])
  const [employeeFilters, setEmployeeFilters] = useState<string[]>([])
  const [employeeSearch, setEmployeeSearch] = useState('')
  const [isExportingCSV, setIsExportingCSV] = useState(false)
  const [isExportingExcel, setIsExportingExcel] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [filtersExpanded, setFiltersExpanded] = useState(false)

  // Get unique departments
  const departments = useMemo(() => {
    const depts = new Set(teamMembers.map((m) => m.department).filter((d): d is string => !!d))
    return Array.from(depts).sort()
  }, [teamMembers])

  // Filtered employees based on search and department filters
  const filteredEmployees = useMemo(() => {
    let employees = teamMembers

    // Filter by department
    if (departmentFilters.length > 0) {
      employees = employees.filter((emp) =>
        departmentFilters.includes(emp.department || '')
      )
    }

    // Filter by search
    if (employeeSearch.trim()) {
      const search = employeeSearch.toLowerCase()
      employees = employees.filter((emp) =>
        emp.full_name.toLowerCase().includes(search)
      )
    }

    return employees
  }, [teamMembers, departmentFilters, employeeSearch])

  // Check if next navigation is disabled
  const canGoNext = !hasFutureDates(dateRange.end)

  // Handle period change
  const handlePeriodChange = (newPeriod: ExportPeriod) => {
    setPeriod(newPeriod)
    if (newPeriod === 'week') {
      setDateRange(getCurrentWeekRange())
    } else {
      setDateRange(getCurrentMonthRange())
    }
  }

  // Handle navigation
  const handleNavigate = (direction: 'prev' | 'next') => {
    if (direction === 'next' && !canGoNext) return

    if (period === 'week') {
      setDateRange(
        direction === 'prev'
          ? getPreviousWeekRange(dateRange.start)
          : getNextWeekRange(dateRange.start)
      )
    } else {
      setDateRange(
        direction === 'prev'
          ? getPreviousMonthRange(dateRange.start)
          : getNextMonthRange(dateRange.start)
      )
    }
  }

  // Handle export
  const handleExport = async (format: 'csv' | 'xlsx') => {
    setExportError(null)
    const setLoading = format === 'csv' ? setIsExportingCSV : setIsExportingExcel

    try {
      setLoading(true)

      const filters: ExportFilterOptions = {}
      if (departmentFilters.length > 0) filters.departmentFilters = departmentFilters
      if (employeeFilters.length > 0) filters.employeeFilters = employeeFilters

      const response = await fetch('/api/team/export-login-times', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format,
          startDate: dateRange.start,
          endDate: dateRange.end,
          period,
          ...filters,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Export failed')
      }

      // Trigger download
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      
      const dateLabel = formatDateRange(dateRange.start, dateRange.end, period)
        .replace(/\s+/g, '-')
        .replace(/,/g, '')
      anchor.download = `login-times-${dateLabel}.${format}`
      
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export error:', error)
      setExportError(error instanceof Error ? error.message : 'Export failed')
    } finally {
      setLoading(false)
    }
  }

  // Toggle department filter
  const toggleDepartmentFilter = (dept: string) => {
    setDepartmentFilters((prev) =>
      prev.includes(dept) ? prev.filter((d) => d !== dept) : [...prev, dept]
    )
  }

  // Toggle employee filter
  const toggleEmployeeFilter = (empId: string) => {
    setEmployeeFilters((prev) =>
      prev.includes(empId) ? prev.filter((id) => id !== empId) : [...prev, empId]
    )
  }

  // Clear all filters
  const clearFilters = () => {
    setDepartmentFilters([])
    setEmployeeFilters([])
    setEmployeeSearch('')
  }

  const hasFilters = departmentFilters.length > 0 || employeeFilters.length > 0

  return (
    <div className={`pm-export-panel ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Mobile collapse button */}
      <button
        type="button"
        className="pm-export-collapse-btn"
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-label={isCollapsed ? 'Expand export panel' : 'Collapse export panel'}
      >
        <span style={{ fontWeight: 700, fontSize: 14 }}>Reports & Export</span>
        {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
      </button>

      {!isCollapsed && (
        <div className="pm-export-panel-content">
          {/* Period Toggle */}
          <div className="period-toggle">
            <button
              type="button"
              className={`period-toggle-btn ${period === 'week' ? 'active' : ''}`}
              onClick={() => handlePeriodChange('week')}
            >
              Week
            </button>
            <button
              type="button"
              className={`period-toggle-btn ${period === 'month' ? 'active' : ''}`}
              onClick={() => handlePeriodChange('month')}
            >
              Month
            </button>
          </div>

          {/* Date Navigator */}
          <div className="date-navigator">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => handleNavigate('prev')}
              aria-label="Previous period"
            >
              <ChevronLeft size={16} />
            </button>
            <div style={{ flex: 1, textAlign: 'center', fontSize: 13, fontWeight: 600 }}>
              {formatDateRange(dateRange.start, dateRange.end, period)}
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => handleNavigate('next')}
              disabled={!canGoNext}
              aria-label="Next period"
              style={{ opacity: canGoNext ? 1 : 0.4 }}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Quick Stats Summary */}
          <div style={{ 
            background: 'var(--color-surface-2)', 
            padding: '12px', 
            borderRadius: 'var(--radius-sm)',
            fontSize: 12
          }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '8px',
              marginBottom: 8
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 2 }}>
                  <Clock size={12} style={{ display: 'inline', marginRight: 4 }} />
                  Team Members
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {filteredEmployees.length}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 2 }}>
                  <TrendingUp size={12} style={{ display: 'inline', marginRight: 4 }} />
                  Date Range
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {period === 'week' ? '7 days' : '~30 days'}
                </div>
              </div>
            </div>
            <div style={{ 
              fontSize: 11, 
              color: 'var(--color-text-muted)', 
              textAlign: 'center',
              paddingTop: 8,
              borderTop: '1px solid var(--color-border)'
            }}>
              Export will include login times for selected period
            </div>
          </div>

          {/* Filters Section */}
          <div className="filters-section">
            <button
              type="button"
              className="filters-toggle"
              onClick={() => setFiltersExpanded(!filtersExpanded)}
            >
              <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Filters {hasFilters && `(${departmentFilters.length + employeeFilters.length})`}
              </span>
              {filtersExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {filtersExpanded && (
              <div className="filters-content">
                {/* Department Filters */}
                {departments.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 8 }}>
                      Department
                    </div>
                    {departments.map((dept) => (
                      <label key={dept} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={departmentFilters.includes(dept)}
                          onChange={() => toggleDepartmentFilter(dept)}
                        />
                        <span style={{ fontSize: 13 }}>{dept}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Employee Search */}
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 8 }}>
                    Employees ({employeeFilters.length} of {filteredEmployees.length} selected)
                  </div>
                  <input
                    type="text"
                    className="input"
                    placeholder="Search employees..."
                    value={employeeSearch}
                    onChange={(e) => setEmployeeSearch(e.target.value)}
                    style={{ marginBottom: 8, minHeight: 36 }}
                  />
                </div>

                {/* Employee List */}
                <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 8 }}>
                  {filteredEmployees.map((emp) => (
                    <label key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={employeeFilters.includes(emp.id)}
                        onChange={() => toggleEmployeeFilter(emp.id)}
                      />
                      <span style={{ fontSize: 13 }}>{emp.full_name}</span>
                    </label>
                  ))}
                </div>

                {/* Clear Filters */}
                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    style={{ fontSize: 12, color: 'var(--color-brand)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Error Message */}
          {exportError && (
            <div style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--color-danger-dim)', color: 'var(--color-danger)', fontSize: 13, marginBottom: 12 }}>
              {exportError}
            </div>
          )}

          {/* Export Buttons */}
          <div className="export-buttons">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => handleExport('csv')}
              disabled={isExportingCSV || isExportingExcel}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <Download size={16} />
              {isExportingCSV ? 'Exporting...' : 'CSV'}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleExport('xlsx')}
              disabled={isExportingCSV || isExportingExcel}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <FileSpreadsheet size={16} />
              {isExportingExcel ? 'Exporting...' : 'Excel'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
