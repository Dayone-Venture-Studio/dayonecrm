/**
 * LoadingFallback
 * 
 * Loading fallback component for React Suspense boundaries.
 * Shows the same dark overlay with spinner while page data loads.
 * 
 * This component is used as the fallback for Suspense boundaries,
 * ensuring the loader stays visible until all async data is ready.
 * 
 * Usage:
 * ```tsx
 * <Suspense fallback={<LoadingFallback />}>
 *   {children}
 * </Suspense>
 * ```
 */
export function LoadingFallback() {
  return (
    <div 
      className="loading-overlay loading-overlay--visible"
      aria-live="polite"
      aria-busy="true"
      role="status"
    >
      <div className="loading-overlay__backdrop" />
      <div className="loading-overlay__content">
        <div className="loading-spinner" />
        <span className="sr-only">Loading page data...</span>
      </div>
    </div>
  )
}
