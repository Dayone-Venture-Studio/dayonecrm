const bar = (w: number | string, h: number, radius = 6) => ({
  width: typeof w === 'number' ? w : w,
  height: h,
  borderRadius: radius,
  background: 'var(--color-surface-2)',
})

export function TextSkeleton({ width = 120 }: { width?: number }) {
  return <span style={{ ...bar(width, 14), display: 'inline-block', verticalAlign: 'middle' }} />
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '14px 18px',
          borderBottom: '1px solid var(--color-border-subtle)',
          background: 'var(--color-surface-2)',
        }}
      >
        {[120, 90, 90, 70].map((w, i) => (
          <div key={i} style={bar(w, 12)} />
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '16px 18px',
              borderBottom: i < rows - 1 ? '1px solid var(--color-border-subtle)' : 'none',
            }}
          >
            <div style={{ ...bar(32, 32, 8), flexShrink: 0 }} />
            <div style={{ ...bar('40%', 12) }} />
            <div style={{ ...bar(80, 12), marginLeft: 'auto' }} />
            <div style={bar(64, 12)} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function CardsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ ...bar('100%', 150, 16) }} />
      ))}
    </div>
  )
}

export function DetailSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ ...bar(56, 56, 12), flexShrink: 0 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
          <div style={bar('40%', 24, 8)} />
          <div style={bar('25%', 14)} />
        </div>
      </div>
      <div className="grid-2">
        <div style={bar('100%', 220, 16)} />
        <div style={bar('100%', 220, 16)} />
      </div>
    </div>
  )
}
