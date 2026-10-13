/**
 * VentureManagerDashboardSkeleton
 * 
 * High-fidelity loading skeleton for venture manager portfolio overview.
 * Mirrors the layout: header, 4 KPI cards, needs attention section,
 * filters bar, 3-column startup cards grid, and trend charts.
 */

export function VentureManagerDashboardSkeleton() {
  return (
    <div style={{ padding: '32px 32px 48px', minHeight: '100vh' }} aria-busy="true" role="status" aria-label="Loading portfolio overview">
      
      {/* Header Skeleton */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            {/* Icon placeholder */}
            <div
              className="skeleton-pulse"
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'var(--color-surface-2)',
              }}
            />
            <div>
              {/* Title */}
              <div
                className="skeleton-pulse"
                style={{
                  height: 26,
                  width: 220,
                  borderRadius: 6,
                  background: 'var(--color-surface-2)',
                  marginBottom: 8,
                }}
              />
              {/* Subtitle */}
              <div
                className="skeleton-pulse"
                style={{
                  height: 13,
                  width: 280,
                  borderRadius: 4,
                  background: 'var(--color-surface-2)',
                }}
              />
            </div>
          </div>
        </div>
        {/* Date/time placeholder */}
        <div style={{ textAlign: 'right' }}>
          <div
            className="skeleton-pulse"
            style={{
              height: 13,
              width: 180,
              borderRadius: 4,
              background: 'var(--color-surface-2)',
              marginBottom: 6,
              marginLeft: 'auto',
            }}
          />
          <div
            className="skeleton-pulse"
            style={{
              height: 12,
              width: 120,
              borderRadius: 4,
              background: 'var(--color-surface-2)',
              marginLeft: 'auto',
            }}
          />
        </div>
      </div>

      {/* KPI Cards Skeleton - 4 columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 14,
              padding: '20px 22px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Accent bar */}
            <div
              className="skeleton-pulse"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: 'var(--color-surface-2)',
              }}
            />

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
              {/* Label */}
              <div
                className="skeleton-pulse"
                style={{
                  height: 12,
                  width: '60%',
                  borderRadius: 4,
                  background: 'var(--color-surface-2)',
                }}
              />
              {/* Icon */}
              <div
                className="skeleton-pulse"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'var(--color-surface-2)',
                  flexShrink: 0,
                }}
              />
            </div>

            {/* Value */}
            <div
              className="skeleton-pulse"
              style={{
                height: 32,
                width: '50%',
                borderRadius: 6,
                background: 'var(--color-surface-2)',
                marginBottom: 12,
              }}
            />

            {/* Sub info (pills/text) */}
            <div style={{ display: 'flex', gap: 8 }}>
              <div
                className="skeleton-pulse"
                style={{
                  height: 20,
                  width: 60,
                  borderRadius: 999,
                  background: 'var(--color-surface-2)',
                }}
              />
              <div
                className="skeleton-pulse"
                style={{
                  height: 20,
                  width: 70,
                  borderRadius: 999,
                  background: 'var(--color-surface-2)',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Needs Attention Section Skeleton */}
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 14,
          padding: 24,
          marginBottom: 20,
        }}
      >
        <div
          className="skeleton-pulse"
          style={{
            height: 20,
            width: 180,
            borderRadius: 6,
            background: 'var(--color-surface-2)',
            marginBottom: 16,
          }}
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {[1, 2].map((i) => (
            <div
              key={i}
              style={{
                padding: 16,
                border: '1px solid var(--color-border)',
                borderRadius: 10,
              }}
            >
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div
                  className="skeleton-pulse"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    background: 'var(--color-surface-2)',
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    className="skeleton-pulse"
                    style={{
                      height: 16,
                      width: '80%',
                      borderRadius: 4,
                      background: 'var(--color-surface-2)',
                      marginBottom: 8,
                    }}
                  />
                  <div
                    className="skeleton-pulse"
                    style={{
                      height: 14,
                      width: '60%',
                      borderRadius: 4,
                      background: 'var(--color-surface-2)',
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters Bar Skeleton */}
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 12,
          padding: '14px 18px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        {/* Search bar */}
        <div
          className="skeleton-pulse"
          style={{
            flex: 1,
            minWidth: 200,
            height: 36,
            borderRadius: 8,
            background: 'var(--color-surface-2)',
          }}
        />
        {/* Filter dropdowns */}
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="skeleton-pulse"
            style={{
              width: 140,
              height: 32,
              borderRadius: 8,
              background: 'var(--color-surface-2)',
            }}
          />
        ))}
        {/* Count text */}
        <div
          className="skeleton-pulse"
          style={{
            width: 100,
            height: 12,
            borderRadius: 4,
            background: 'var(--color-surface-2)',
            marginLeft: 'auto',
          }}
        />
      </div>

      {/* Startup Cards Grid Skeleton - 3 columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 14,
              padding: 20,
            }}
          >
            {/* Header with logo and name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div
                className="skeleton-pulse"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 10,
                  background: 'var(--color-surface-2)',
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  className="skeleton-pulse"
                  style={{
                    height: 16,
                    width: '80%',
                    borderRadius: 4,
                    background: 'var(--color-surface-2)',
                    marginBottom: 6,
                  }}
                />
                <div
                  className="skeleton-pulse"
                  style={{
                    height: 12,
                    width: '50%',
                    borderRadius: 4,
                    background: 'var(--color-surface-2)',
                  }}
                />
              </div>
            </div>

            {/* Health score circle */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <div
                className="skeleton-pulse"
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'var(--color-surface-2)',
                }}
              />
            </div>

            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 12 }}>
              {[1, 2, 3, 4].map((j) => (
                <div key={j}>
                  <div
                    className="skeleton-pulse"
                    style={{
                      height: 20,
                      width: '60%',
                      borderRadius: 4,
                      background: 'var(--color-surface-2)',
                      marginBottom: 4,
                    }}
                  />
                  <div
                    className="skeleton-pulse"
                    style={{
                      height: 12,
                      width: '80%',
                      borderRadius: 4,
                      background: 'var(--color-surface-2)',
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Button */}
            <div
              className="skeleton-pulse"
              style={{
                height: 36,
                width: '100%',
                borderRadius: 8,
                background: 'var(--color-surface-2)',
              }}
            />
          </div>
        ))}
      </div>

      {/* Trend Charts Skeleton */}
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 14,
          padding: 24,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div
            className="skeleton-pulse"
            style={{
              height: 20,
              width: 180,
              borderRadius: 6,
              background: 'var(--color-surface-2)',
            }}
          />
          <div
            className="skeleton-pulse"
            style={{
              height: 32,
              width: 140,
              borderRadius: 8,
              background: 'var(--color-surface-2)',
            }}
          />
        </div>
        {/* Chart placeholders */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
          {[1, 2].map((i) => (
            <div key={i}>
              <div
                className="skeleton-pulse"
                style={{
                  height: 16,
                  width: 120,
                  borderRadius: 4,
                  background: 'var(--color-surface-2)',
                  marginBottom: 12,
                }}
              />
              <div
                className="skeleton-pulse"
                style={{
                  height: 200,
                  width: '100%',
                  borderRadius: 8,
                  background: 'var(--color-surface-2)',
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Screen reader announcement */}
      <span className="sr-only">Loading portfolio overview data...</span>
    </div>
  )
}
