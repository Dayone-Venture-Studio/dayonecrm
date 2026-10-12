/**
 * StaffDashboardSkeleton
 * 
 * High-fidelity loading skeleton for staff member dashboard (/staff page).
 * Mirrors the layout: header, 6 stat cards, deliverables card, sprint/performance cards.
 * 
 * Note: This is different from StaffManagementPageSkeleton (which is for /founder/staff).
 */

export function StaffDashboardSkeleton() {
  return (
    <div aria-busy="true" role="status" aria-label="Loading staff dashboard">
      {/* Stats Row Skeleton - 6 cards */}
      <div className="grid-stats" style={{ marginBottom: 32 }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="stat-card">
            {/* Icon placeholder */}
            <div
              className="skeleton-pulse"
              style={{
                width: 24,
                height: 24,
                borderRadius: 4,
                background: 'var(--color-surface-2)',
                marginBottom: 10,
              }}
            />
            {/* Value placeholder */}
            <div
              className="skeleton-pulse"
              style={{
                height: 28,
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
                height: 13,
                width: '80%',
                borderRadius: 4,
                background: 'var(--color-surface-2)',
              }}
            />
          </div>
        ))}
      </div>

      {/* 2-Column Grid: Deliverables + Sprint/Performance */}
      <div className="grid-2">
        {/* Deliverables Card Skeleton */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div
              className="skeleton-pulse"
              style={{
                height: 16,
                width: 200,
                borderRadius: 4,
                background: 'var(--color-surface-2)',
              }}
            />
            <div
              className="skeleton-pulse"
              style={{
                height: 12,
                width: 70,
                borderRadius: 4,
                background: 'var(--color-surface-2)',
              }}
            />
          </div>

          {/* Task list items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                style={{
                  padding: '10px 12px',
                  borderRadius: 8,
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 6 }}>
                  <div
                    className="skeleton-pulse"
                    style={{
                      height: 14,
                      width: '70%',
                      borderRadius: 4,
                      background: 'var(--color-surface-2)',
                    }}
                  />
                  <div
                    className="skeleton-pulse"
                    style={{
                      height: 18,
                      width: 60,
                      borderRadius: 999,
                      background: 'var(--color-surface-2)',
                      flexShrink: 0,
                    }}
                  />
                </div>
                {/* Badges and metadata */}
                <div style={{ display: 'flex', gap: 6 }}>
                  <div
                    className="skeleton-pulse"
                    style={{
                      height: 16,
                      width: 50,
                      borderRadius: 999,
                      background: 'var(--color-surface-2)',
                    }}
                  />
                  <div
                    className="skeleton-pulse"
                    style={{
                      height: 16,
                      width: 70,
                      borderRadius: 999,
                      background: 'var(--color-surface-2)',
                    }}
                  />
                  <div
                    className="skeleton-pulse"
                    style={{
                      height: 16,
                      width: 80,
                      borderRadius: 4,
                      background: 'var(--color-surface-2)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Recently Completed section */}
          <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--color-border-subtle)' }}>
            <div
              className="skeleton-pulse"
              style={{
                height: 12,
                width: 150,
                borderRadius: 4,
                background: 'var(--color-surface-2)',
                marginBottom: 8,
              }}
            />
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 0',
                }}
              >
                <div
                  className="skeleton-pulse"
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 4,
                    background: 'var(--color-surface-2)',
                    flexShrink: 0,
                  }}
                />
                <div
                  className="skeleton-pulse"
                  style={{
                    height: 13,
                    flex: 1,
                    borderRadius: 4,
                    background: 'var(--color-surface-2)',
                  }}
                />
                <div
                  className="skeleton-pulse"
                  style={{
                    width: 50,
                    height: 16,
                    borderRadius: 999,
                    background: 'var(--color-surface-2)',
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Sprint & Performance Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Sprint Focus Card Skeleton */}
          <div className="card">
            <div
              className="skeleton-pulse"
              style={{
                height: 16,
                width: 100,
                borderRadius: 4,
                background: 'var(--color-surface-2)',
                marginBottom: 16,
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div
                className="skeleton-pulse"
                style={{
                  height: 14,
                  width: 150,
                  borderRadius: 4,
                  background: 'var(--color-surface-2)',
                }}
              />
              <div
                className="skeleton-pulse"
                style={{
                  height: 18,
                  width: 60,
                  borderRadius: 999,
                  background: 'var(--color-surface-2)',
                }}
              />
            </div>
            <div
              className="skeleton-pulse"
              style={{
                height: 12,
                width: 200,
                borderRadius: 4,
                background: 'var(--color-surface-2)',
                marginBottom: 12,
              }}
            />
            {/* Goal quote box */}
            <div
              className="skeleton-pulse"
              style={{
                height: 60,
                width: '100%',
                borderRadius: 8,
                background: 'var(--color-surface-2)',
              }}
            />
          </div>

          {/* Performance Card Skeleton */}
          <div className="card">
            <div
              className="skeleton-pulse"
              style={{
                height: 16,
                width: 130,
                borderRadius: 4,
                background: 'var(--color-surface-2)',
                marginBottom: 20,
              }}
            />
            {/* Progress bar section */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <div
                  className="skeleton-pulse"
                  style={{
                    height: 13,
                    width: 120,
                    borderRadius: 4,
                    background: 'var(--color-surface-2)',
                  }}
                />
                <div
                  className="skeleton-pulse"
                  style={{
                    height: 13,
                    width: 40,
                    borderRadius: 4,
                    background: 'var(--color-surface-2)',
                  }}
                />
              </div>
              <div
                className="skeleton-pulse"
                style={{
                  height: 8,
                  width: '100%',
                  borderRadius: 4,
                  background: 'var(--color-surface-2)',
                }}
              />
            </div>

            {/* Stats rows */}
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: '1px solid var(--color-border-subtle)',
                }}
              >
                <div
                  className="skeleton-pulse"
                  style={{
                    height: 13,
                    width: 100,
                    borderRadius: 4,
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
            ))}

            {/* Button */}
            <div style={{ marginTop: 20 }}>
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
          </div>
        </div>
      </div>

      {/* Screen reader announcement */}
      <span className="sr-only">Loading your dashboard data...</span>
    </div>
  )
}
