export function DashboardSkeleton() {
  return (
    <div
      style={{
        padding: '24px 32px',
        maxWidth: 1200,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ height: 26, width: 220, borderRadius: 8, background: 'var(--color-surface-2)' }} />
        <div style={{ height: 16, width: 340, borderRadius: 6, background: 'var(--color-surface-2)' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ height: 96, borderRadius: 12, background: 'var(--color-surface-2)' }} />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ height: 260, borderRadius: 16, background: 'var(--color-surface-2)' }} />
        <div style={{ height: 260, borderRadius: 16, background: 'var(--color-surface-2)' }} />
      </div>
    </div>
  )
}
