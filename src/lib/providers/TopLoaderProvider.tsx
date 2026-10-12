'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useLoading } from './LoadingContext'

/**
 * TopLoaderProvider
 *
 * Full-page overlay loading animation for page navigation.
 * Shows circular spinner with dark blur backdrop during route transitions.
 *
 * Integrated with LoadingContext - stays visible until pages call useDataLoaded().
 *
 * Excluded Routes:
 * - /login
 * - /register
 * - /unauthorized
 * - /tv
 * - /performance
 *
 * Usage:
 * Import and add to your root layout as the first child in <body>
 */
// How long the overlay may stay up without a page signalling `useDataLoaded()`.
// Guards against a stuck loader on routes that never call the hook.
const FALLBACK_FINISH_MS = 1500
// Delay before showing, so an instant (cached) navigation never flashes it.
const SHOW_DELAY_MS = 50

export function TopLoaderProvider() {
  const pathname = usePathname()
  const { isLoading, startLoading, finishLoading, lastFinishPathRef } = useLoading()
  const [shouldShow, setShouldShow] = useState(false)

  // Live copy of isLoading for timer callbacks (timers capture a stale value).
  const isLoadingRef = useRef(isLoading)
  useEffect(() => {
    isLoadingRef.current = isLoading
  }, [isLoading])

  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimers = useCallback(() => {
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current)
      showTimerRef.current = null
    }
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current)
      fallbackTimerRef.current = null
    }
  }, [])

  // Routes where the loader should NOT appear (public / unauthenticated surfaces)
  const excludedRoutes = ['/login', '/register', '/unauthorized', '/tv', '/performance']

  // Check if current path matches excluded routes
  const isExcluded = excludedRoutes.some(route => pathname.startsWith(route))

  useEffect(() => {
    if (isExcluded) return

    // Case: navigation that finished in the same commit (persisted / cached
    // route — no network, no Suspense, data already present). React runs the
    // destination's useDataLoaded() effect before this one, and it recorded the
    // pathname it finished for. A match means this navigation is already
    // "loaded", so starting the overlay would leave it with nothing to hide it.
    if (lastFinishPathRef.current === pathname) {
      return
    }

    // Start loading on route change
    startLoading()

    // Delay before showing; skip if we finished before the delay elapsed.
    showTimerRef.current = setTimeout(() => {
      if (isLoadingRef.current) setShouldShow(true)
    }, SHOW_DELAY_MS)

    // Safety net: pages that never call useDataLoaded() still clear the overlay
    fallbackTimerRef.current = setTimeout(() => {
      finishLoading()
    }, FALLBACK_FINISH_MS)

    return clearTimers
  }, [pathname, isExcluded, startLoading, finishLoading, lastFinishPathRef, clearTimers])

  // Hide overlay when loading finishes, and cancel any pending show/fallback so
  // a completed navigation can't later re-stamp state or re-show the overlay.
  useEffect(() => {
    if (!isLoading) {
      setShouldShow(false)
      clearTimers()
    }
  }, [isLoading, clearTimers])

  // Don't render on excluded routes or when not loading
  if (isExcluded || (!isLoading && !shouldShow)) {
    return null
  }

  return (
    <div
      className={`loading-overlay ${shouldShow ? 'loading-overlay--visible' : ''}`}
      aria-live="polite"
      aria-busy="true"
      role="status"
    >
      <div className="loading-overlay__backdrop" />
      <div className="loading-overlay__content">
        <div className="loading-spinner" />
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  )
}
