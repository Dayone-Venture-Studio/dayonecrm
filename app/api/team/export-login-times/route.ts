import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/auth/getSession'
import { getLoginTimeReports } from '@/lib/team/export-queries'
import { generateCSVBuffer, generateExcelBuffer } from '@/lib/team/export-utils'
import { formatDateRange } from '@/lib/utils/date-helpers'
import type { ExportFilterOptions } from '@/types'

const ExportRequestSchema = z.object({
  format: z.enum(['csv', 'xlsx']),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  period: z.enum(['week', 'month']).optional(),
  departmentFilters: z.array(z.string()).optional(),
  employeeFilters: z.array(z.string().uuid()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user role
    if (!['PROJECT_MANAGER', 'ADMIN'].includes(session.role)) {
      return NextResponse.json(
        { error: 'Forbidden: Only PROJECT_MANAGER and ADMIN can export reports' },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = ExportRequestSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: validation.error.format() },
        { status: 400 }
      )
    }

    const { format, startDate, endDate, period, departmentFilters, employeeFilters } =
      validation.data

    // Validate date range
    if (startDate > endDate) {
      return NextResponse.json(
        { error: 'Invalid date range: start date must be before end date' },
        { status: 400 }
      )
    }

    // Fetch login time data
    const matrix = await getLoginTimeReports(startDate, endDate)

    // Prepare filters
    const filters: ExportFilterOptions = {
      departmentFilters,
      employeeFilters,
    }

    // Generate file
    let buffer: Buffer
    let contentType: string
    let extension: string

    if (format === 'csv') {
      buffer = generateCSVBuffer(matrix, filters)
      contentType = 'text/csv'
      extension = 'csv'
    } else {
      buffer = await generateExcelBuffer(matrix, filters)
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      extension = 'xlsx'
    }

    // Generate filename
    const dateLabel = formatDateRange(startDate, endDate, period || 'week')
      .replace(/\s+/g, '-')
      .replace(/,/g, '')
    const filename = `login-times-${dateLabel}.${extension}`

    // Return file (convert Buffer to Uint8Array for NextResponse)
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
