/**
 * FounderDashboardSkeleton
 * 
 * High-fidelity loading skeleton that mirrors the exact layout of FounderDashboardClient.
 * Shows during Suspense while Server Component fetches data.
 * Provides better perceived performance than generic skeleton.
 * 
 * Layout structure:
 * - Header with logo and title
 * - Stats row (6 stat cards)
 * - Health & Blockers grid (2 columns)
 * - Sprint & Velocity cards (2 columns)
 * - Team table
 */

export function FounderDashboardSkeleton() {
  return (
    <div aria-busy="true" role="status" aria-label="Loading dashboard">
      {/* Header Skeleton */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
          {/* Logo skeleton */}
          <div
            className="skeleton-pulse"
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: 'var(--color-surface-2)',
            }}
          />
          {/* Title skeleton */}
          <div style={{ flex: 1 }}>
            <div
              className="skeleton-pulse"
              style={{
                height: 28,
                width: 240,
                borderRadius: 8,
                background: 'var(--color-surface-2)',
                marginBottom: 8,
              }}
            />
            <div
              className="skeleton-pulse"
              style={{
                height: 16,
                width: 180,
                borderRadius: 6,
                background: 'var(--color-surface-2)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Stats Row Skeleton - 6 cards */}
      <div className="grid-stats" style={{ marginBottom: 28 }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              {/* Icon placeholder */}
              <div
                className="skeleton-pulse"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'var(--color-surface-2)',
                }}
              />
              {/* Subtext placeholder */}
              <div
                className="skeleton-pulse"
                style={{
                  width: 40,
                  height: 12,
                  borderRadius: 4,
                  background: 'var(--color-surface-2)',
                }}
              />
            </div>
            {/* Value placeholder */}
            <div
              className="skeleton-pulse"
              style={{
                height: 26,
                width: '60%',
                borderRadius: 6,
                background: 'var(--color-surface-2)',
                marginBottom: 6,
              }}
            />
            {/* Label placeholder */}
            <div
              className="skeleton-pulse"
              style={{
                height: 14,
                width: '80%',
                borderRadius: 4,
                background: 'var(--color-surface-2)',
              }}
            />
          </div>
        ))}
      </div>

      {/* Health & Blockers Grid Skeleton */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: 20,
          marginBottom: 28,
        }}
      >
        {/* Health Card Skeleton */}
        <div className="card">
          <div
            className="skeleton-pulse"
            style={{
              height: 20,
              width: 160,
              borderRadius: 6,
              background: 'var(--color-surface-2)',
              marginBottom: 20,
            }}
          />
          {/* Circular health indicator */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
            <div
              className="skeleton-pulse"
              style={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: 'var(--color-surface-2)',
              }}
            />
          </div>
          {/* Status text */}
          <div
            className="skeleton-pulse"
            style={{
              height: 16,
              width: '70%',
              borderRadius: 6,
              background: 'var(--color-surface-2)',
              margin: '0 auto',
            }}
          />
        </div>

        {/* Blockers Card Skeleton */}
        <div className="card">
          <div
            className="skeleton-pulse"
            style={{
              height: 20,
              width: 180,
              borderRadius: 6,
              background: 'var(--color-surface-2)',
              marginBottom: 20,
            }}
          />
          {/* Blocker items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div
                  className="skeleton-pulse"
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    background: 'var(--color-surface-2)',
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    className="skeleton-pulse"
                    style={{
                      height: 14,
                      width: '90%',
                      borderRadius: 4,
                      background: 'var(--color-surface-2)',
                      marginBottom: 6,
                    }}
                  />
                  <div
                    className="skeleton-pulse"
                    style={{
                      height: 12,
                      width: '60%',
                      borderRadius: 4,
                      background: 'var(--color-surface-2)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sprint & Velocity Grid Skeleton */}
      <div className="grid-2" style={{ marginBottom: 28 }}>
        {/* Sprint Card Skeleton */}
        <div className="card">
          <div
            className="skeleton-pulse"
            style={{
              height: 20,
              width: 140,
              borderRadius: 6,
              background: 'var(--color-surface-2)',
              marginBottom: 16,
            }}
          />
          {/* Week info */}
          <div
            className="skeleton-pulse"
            style={{
              height: 16,
              width: 200,
              borderRadius: 6,
              background: 'var(--color-surface-2)',
              marginBottom: 12,
            }}
          />
          {/* Progress bar */}
          <div
            className="skeleton-pulse"
            style={{
              height: 8,
              width: '100%',
              borderRadius: 4,
              background: 'var(--color-surface-2)',
              marginBottom: 20,
            }}
          />
          {/* Stats */}
          <div style={{ display: 'flex', gap: 12 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ flex: 1 }}>
                <div
                  className="skeleton-pulse"
                  style={{
                    height: 24,
                    width: '80%',
                    borderRadius: 6,
                    background: 'var(--color-surface-2)',
                    marginBottom: 6,
                  }}
                />
                <div
                  className="skeleton-pulse"
                  style={{
                    height: 12,
                    width: '60%',
                    borderRadius: 4,
                    background: 'var(--color-surface-2)',
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Velocity Card Skeleton */}
        <div className="card">
          <div
            className="skeleton-pulse"
            style={{
              height: 20,
              width: 160,
              borderRadius: 6,
              background: 'var(--color-surface-2)',
              marginBottom: 16,
            }}
          />
          {/* Chart placeholder */}
          <div
            className="skeleton-pulse"
            style={{
              height: 180,
              width: '100%',
              borderRadius: 8,
              background: 'var(--color-surface-2)',
            }}
          />
        </div>
      </div>

      {/* Team Table Skeleton */}
      <div className="card">
        <div
          className="skeleton-pulse"
          style={{
            height: 20,
            width: 180,
            borderRadius: 6,
            background: 'var(--color-surface-2)',
            marginBottom: 20,
          }}
        />
        {/* Table header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr',
            gap: 16,
            paddingBottom: 12,
            marginBottom: 12,
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="skeleton-pulse"
              style={{
                height: 14,
                width: '60%',
                borderRadius: 4,
                background: 'var(--color-surface-2)',
              }}
            />
          ))}
        </div>
        {/* Table rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr',
                gap: 16,
                alignItems: 'center',
              }}
            >
              {/* Name with avatar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  className="skeleton-pulse"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'var(--color-surface-2)',
                    flexShrink: 0,
                  }}
                />
                <div
                  className="skeleton-pulse"
                  style={{
                    height: 14,
                    width: 140,
                    borderRadius: 4,
                    background: 'var(--color-surface-2)',
                  }}
                />
              </div>
              {/* Stats */}
              {[1, 2, 3].map((j) => (
                <div
                  key={j}
                  className="skeleton-pulse"
                  style={{
                    height: 14,
                    width: '50%',
                    borderRadius: 4,
                    background: 'var(--color-surface-2)',
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Screen reader announcement */}
      <span className="sr-only">Loading founder dashboard data...</span>
    </div>
  )
}
