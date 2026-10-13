/**
 * AdminDashboardSkeleton
 * 
 * High-fidelity loading skeleton for admin Control Tower dashboard.
 * Mirrors the layout: header, 6 stat cards, portfolio health section,
 * 2-column grid (active startups + recent activity).
 */

export function AdminDashboardSkeleton() {
  return (
    <div aria-busy="true" role="status" aria-label="Loading admin dashboard">
      {/* Header Skeleton */}
      <div style={{ marginBottom: 32 }}>
        <div
          className="skeleton-pulse"
          style={{
            height: 32,
            width: 200,
            borderRadius: 8,
            background: 'var(--color-surface-2)',
            marginBottom: 8,
          }}
        />
        <div
          className="skeleton-pulse"
          style={{
            height: 16,
            width: 320,
            borderRadius: 6,
            background: 'var(--color-surface-2)',
          }}
        />
      </div>

      {/* Optional Pending Reviews Banner Skeleton */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <div
          className="skeleton-pulse"
          style={{
            height: 40,
            width: 220,
            borderRadius: 8,
            background: 'var(--color-surface-2)',
          }}
        />
      </div>

      {/* Stat Cards Skeleton - 6 cards in responsive grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 16,
          marginBottom: 28,
        }}
      >
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="stat-card"
          >
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
              {/* Emoji placeholder */}
              <div
                className="skeleton-pulse"
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 4,
                  background: 'var(--color-surface-2)',
                }}
              />
            </div>
            {/* Value */}
            <div
              className="skeleton-pulse"
              style={{
                height: 26,
                width: '50%',
                borderRadius: 6,
                background: 'var(--color-surface-2)',
                marginBottom: 6,
              }}
            />
            {/* Label */}
            <div
              className="skeleton-pulse"
              style={{
                height: 14,
                width: '70%',
                borderRadius: 4,
                background: 'var(--color-surface-2)',
              }}
            />
          </div>
        ))}
      </div>

      {/* Portfolio Health Section Skeleton */}
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 16,
          padding: 24,
          marginBottom: 28,
        }}
      >
        {/* Section header */}
        <div style={{ marginBottom: 20 }}>
          <div
            className="skeleton-pulse"
            style={{
              height: 20,
              width: 180,
              borderRadius: 6,
              background: 'var(--color-surface-2)',
              marginBottom: 8,
            }}
          />
          <div
            className="skeleton-pulse"
            style={{
              height: 14,
              width: 280,
              borderRadius: 4,
              background: 'var(--color-surface-2)',
            }}
          />
        </div>

        {/* Summary stats */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ flex: 1 }}>
              <div
                className="skeleton-pulse"
                style={{
                  height: 32,
                  width: '60%',
                  borderRadius: 6,
                  background: 'var(--color-surface-2)',
                  marginBottom: 6,
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

        {/* Health cards grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 16,
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                padding: 16,
                border: '1px solid var(--color-border)',
                borderRadius: 12,
                background: 'var(--color-background)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div
                  className="skeleton-pulse"
                  style={{
                    height: 14,
                    width: 100,
                    borderRadius: 4,
                    background: 'var(--color-surface-2)',
                  }}
                />
                <div
                  className="skeleton-pulse"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'var(--color-surface-2)',
                  }}
                />
              </div>
              <div
                className="skeleton-pulse"
                style={{
                  height: 24,
                  width: '50%',
                  borderRadius: 6,
                  background: 'var(--color-surface-2)',
                  marginBottom: 8,
                }}
              />
              <div
                className="skeleton-pulse"
                style={{
                  height: 6,
                  width: '100%',
                  borderRadius: 3,
                  background: 'var(--color-surface-2)',
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 2-Column Grid: Active Startups + Recent Activity */}
      <div className="grid-2">
        {/* Active Startups Card */}
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
          {/* Startup rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: 12,
                  border: '1px solid var(--color-border)',
                  borderRadius: 10,
                }}
              >
                {/* Logo */}
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
                  {/* Name */}
                  <div
                    className="skeleton-pulse"
                    style={{
                      height: 14,
                      width: '70%',
                      borderRadius: 4,
                      background: 'var(--color-surface-2)',
                      marginBottom: 6,
                    }}
                  />
                  {/* Stats */}
                  <div
                    className="skeleton-pulse"
                    style={{
                      height: 12,
                      width: '90%',
                      borderRadius: 4,
                      background: 'var(--color-surface-2)',
                    }}
                  />
                </div>
                {/* Badge */}
                <div
                  className="skeleton-pulse"
                  style={{
                    width: 60,
                    height: 20,
                    borderRadius: 999,
                    background: 'var(--color-surface-2)',
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Card */}
        <div className="card">
          <div
            className="skeleton-pulse"
            style={{
              height: 20,
              width: 140,
              borderRadius: 6,
              background: 'var(--color-surface-2)',
              marginBottom: 20,
            }}
          />
          {/* Activity items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: 12,
                  paddingBottom: 16,
                  borderBottom: i < 5 ? '1px solid var(--color-border)' : 'none',
                }}
              >
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
                <div style={{ flex: 1 }}>
                  {/* Activity text */}
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
                  {/* Timestamp */}
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
            ))}
          </div>
        </div>
      </div>

      {/* Screen reader announcement */}
      <span className="sr-only">Loading admin dashboard data...</span>
    </div>
  )
}
