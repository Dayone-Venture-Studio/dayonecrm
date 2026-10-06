export default function StartupDetailLoading() {
  return (
    <div style={{ padding: '24px 32px', maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ height: 20, width: 140, borderRadius: 6, background: 'var(--color-surface-2)' }} />
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 16, padding: '24px 32px',
        display: 'flex', alignItems: 'center', gap: 20,
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ width: 56, height: 56, borderRadius: 12, background: 'var(--color-surface-2)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
          <div style={{ height: 28, width: '40%', borderRadius: 8, background: 'var(--color-surface-2)' }} />
          <div style={{ height: 16, width: '25%', borderRadius: 6, background: 'var(--color-surface-2)' }} />
        </div>
      </div>
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 16, overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border-subtle)', padding: '0 8px', background: 'var(--color-surface-2)', gap: 8 }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{ height: 52, width: 120, borderRadius: 8, background: 'var(--color-surface-2)', margin: '8px 4px' }} />
          ))}
        </div>
        <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{ height: 72, borderRadius: 10, background: 'var(--color-surface-2)' }} />
          ))}
        </div>
      </div>
    </div>
  )
}
