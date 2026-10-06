import Link from 'next/link'
import { CalendarPlus, MonitorPlay, Plus } from 'lucide-react'
import { CompanyLogo } from '@/components/brand/CompanyLogo'
import { FounderLogoManager } from '@/components/brand/FounderLogoManager'

interface Props {
  startupId: string | null
  startupName: string
  startupLogoUrl: string | null
}

export function FounderHeader({ startupId, startupName, startupLogoUrl }: Props) {
  return (
    <div className="page-header" style={{ marginBottom: 28, alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {startupId ? (
          <FounderLogoManager
            startupId={startupId}
            startupName={startupName}
            currentLogoUrl={startupLogoUrl}
            size={54}
            variant="avatar"
          />
        ) : (
          <CompanyLogo logoUrl={startupLogoUrl} name={startupName} size={54} />
        )}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span className="badge badge-neutral" style={{ fontSize: 11, letterSpacing: '0.3px' }}>
              Day One Studio
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '2px 8px',
                borderRadius: 100,
                fontSize: 10,
                fontWeight: 600,
                background: '#ecfdf5',
                color: '#065f46',
                border: '1px solid #a7f3d0',
                marginLeft: 4,
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: '#059669',
                }}
              />
              Active Portfolio Venture
            </span>
          </div>

          <h1 className="page-title" style={{ fontSize: 28, letterSpacing: '-0.6px' }}>
            {startupName} Command Center
          </h1>
          <p className="page-subtitle" style={{ fontSize: 13.5 }}>
            Real-time execution tracking, domain alignment, and weekly sprint metrics.
          </p>
        </div>
      </div>

      {/* Header Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {startupId && (
          <>
            <FounderLogoManager
              startupId={startupId}
              startupName={startupName}
              currentLogoUrl={startupLogoUrl}
              variant="button"
            />
            <Link
              href={`/tv/${startupId}`}
              target="_blank"
              className="btn btn-secondary btn-sm"
              title="Launch dedicated TV mission control screen for wall display"
            >
              <MonitorPlay className="w-3.5 h-3.5 text-purple-600" />
              <span>TV Display</span>
            </Link>
          </>
        )}
        <Link href="/founder/tasks" className="btn btn-secondary btn-sm">
          <Plus className="w-3.5 h-3.5" />
          <span>New Task</span>
        </Link>
        <Link href="/founder/weekly-plan" className="btn btn-primary btn-sm">
          <CalendarPlus className="w-3.5 h-3.5" />
          <span>+ New Weekly Plan</span>
        </Link>
      </div>
    </div>
  )
}