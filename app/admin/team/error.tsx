'use client'

export default function TeamError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">⚠️</div>
      <h3>Something went wrong</h3>
      <p>{error.message || 'Failed to load the team list.'}</p>
      <button onClick={reset} className="btn btn-primary" style={{ marginTop: 16 }}>
        Try again
      </button>
    </div>
  )
}
