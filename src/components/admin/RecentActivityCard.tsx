import Link from 'next/link'

interface ActivityFeedItem {
  id: string
  action: string
  created_at: string
}

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  const hrs = Math.floor(mins / 60)
  const days = Math.floor(hrs / 24)
  if (mins < 60) return `${mins}m ago`
  if (hrs < 24) return `${hrs}h ago`
  return `${days}d ago`
}

export function RecentActivityCard({ activity }: { activity: ActivityFeedItem[] }) {
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
        <h2 style={{ fontSize: 16, fontWeight: 700 }}>Recent Activity</h2>
        <Link
          href="/admin/activity"
          style={{ fontSize: 13, color: 'var(--color-brand)', textDecoration: 'none' }}
        >
          View all →
        </Link>
      </div>

      {activity.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">⚡</div>
          <h3>No activity yet</h3>
          <p>Actions across all startups will appear here</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {activity.map((log) => (
            <div key={log.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'var(--color-brand)',
                  marginTop: 6,
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                  {log.action.replace(/_/g, ' ').toLowerCase()}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                  {timeAgo(log.created_at)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
