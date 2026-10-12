'use client'

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

interface LoadingContextType {
  isLoading: boolean
  startLoading: () => void
  finishLoading: (path?: string) => void
  /**
   * Pathname of the most recent finishLoading(path) call. The overlay loader
   * compares this to the incoming pathname: a match means the destination
   * already signalled "data loaded" during this same navigation commit (its
   * effect runs before the overlay's), so the overlay must not start — there
   * would be nothing left to hide it. A `null` (fallback finish) never matches.
   */
  lastFinishPathRef: React.MutableRefObject<string | null>
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

/**
 * LoadingProvider
 * 
 * Provides global loading state that can be controlled manually by pages.
 * Pages call finishLoading() when their data is ready.
 */
export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const lastFinishPathRef = useRef<string | null>(null)

  const startLoading = useCallback(() => {
    setIsLoading(true)
  }, [])

  const finishLoading = useCallback((path?: string) => {
    lastFinishPathRef.current = path ?? null
    setIsLoading(false)
  }, [])

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, finishLoading, lastFinishPathRef }}>
      {children}
    </LoadingContext.Provider>
  )
}

/**
 * useLoading
 * 
 * Hook to access loading state and control functions.
 */
export function useLoading() {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider')
  }
  return context
}

/**
 * useDataLoaded
 * 
 * Hook that pages call when their data is fully loaded.
 * Call this at the end of your component after data fetching.
 * 
 * @example
 * ```tsx
 * function MyPage() {
 *   const data = await fetchData()
 *   useDataLoaded() // ← Hides the loading overlay
 *   return <div>{data}</div>
 * }
 * ```
 */
export function useDataLoaded() {
  const { finishLoading } = useLoading()
  const pathname = usePathname()

  // Depends on `pathname`, not just mount: on a param-only navigation
  // (reports/[a] -> reports/[b], startups/[a] -> startups/[b]) React reuses the
  // same component instance, so a mount-only effect would never re-signal and
  // the overlay would hang on its 1.5s fallback. Keyed on pathname, the visible
  // page re-signals once it has actually committed with its data — which is also
  // why this stays safe: a page that suspends for the new params does not commit
  // (and so does not signal) until its data is ready.
  useEffect(() => {
    finishLoading(pathname)
  }, [finishLoading, pathname])
}
