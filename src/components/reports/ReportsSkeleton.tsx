const block = {
  background: 'var(--color-surface-2)',
  borderRadius: 8,
} as const

export function ReportsSkeleton() {
  return (
    <div style={{ display: 'flex', alignItems: 'stretch', minHeight: 'calc(100vh - 1px)' }}>
      {/* Main content */}
      <main style={{ flex: 1, minWidth: 0, padding: '32px 32px 48px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ ...block, width: 40, height: 40, borderRadius: 20 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ ...block, height: 20, width: 160 }} />
              <div style={{ ...block, height: 10, width: 220 }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ ...block, height: 28, width: 84, borderRadius: 14 }} />
            <div style={{ ...block, height: 28, width: 84, borderRadius: 14 }} />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: 16,
            }}
          >
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ ...block, height: 96, borderRadius: 12 }} />
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div style={{ ...block, height: 260, borderRadius: 16 }} />
            <div style={{ ...block, height: 260, borderRadius: 16 }} />
          </div>

          <div style={{ ...block, height: 24, width: 180, borderRadius: 6 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{ ...block, height: 22, borderRadius: 6 }} />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}