import Link from 'next/link'
import { CompanyLogo } from '@/components/brand/CompanyLogo'
import type { StartupOverviewRow } from '@/lib/startups/adminQueries'

export function ActiveStartupsCard({ startups }: { startups: StartupOverviewRow[] }) {
  return (
    <div className="card">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}
      >
        <h2 style={{ fontSize: 16, fontWeight: 700 }}>Active Startups</h2>
        <Link
          href="/admin/startups"
          style={{ fontSize: 13, color: 'var(--color-brand)', textDecoration: 'none' }}
        >
          View all →
        </Link>
      </div>

      {startups.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🚀</div>
          <h3>No active startups yet</h3>
          <p>Approved startups will appear here</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {startups.map((startup) => (
            <Link
              key={startup.id}
              href={`/admin/startups/${startup.id}`}
              style={{ textDecoration: 'none' }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  transition: 'border-color 0.15s',
                  cursor: 'pointer',
                }}
              >
                <CompanyLogo logoUrl={startup.logo_url} name={startup.name} size={36} />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {startup.name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                    Active since {new Date(startup.created_at).toLocaleDateString()}
                  </div>
                </div>
                <span className="badge badge-success">ACTIVE</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
