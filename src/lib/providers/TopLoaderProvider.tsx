'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useLoading } from './LoadingContext'

/**
 * TopLoaderProvider
 * 
 * Full-page overlay loading animation for page navigation.
 * Shows circular spinner with dark blur backdrop during route transitions.
 * 
 * Now integrated with LoadingContext - stays visible until pages call useDataLoaded().
 * 
 * Features:
 * - Full-screen overlay with dark blur backdrop
 * - Rotating circular spinner in center
 * - Manual control via LoadingContext
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

export function TopLoaderProvider() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { isLoading, startLoading, finishLoading } = useLoading()
  const [shouldShow, setShouldShow] = useState(false)

  // Routes where the loader should NOT appear (public / unauthenticated surfaces)
  const excludedRoutes = ['/login', '/register', '/unauthorized', '/tv', '/performance']

  // Check if current path matches excluded routes
  const isExcluded = excludedRoutes.some(route => pathname.startsWith(route))

  useEffect(() => {
    if (isExcluded) return

    // Start loading on route change
    startLoading()

    // Small delay before showing to avoid flash on fast loads
    const timeoutId = setTimeout(() => {
      setShouldShow(true)
    }, 50)

    // Safety net: pages that never call useDataLoaded() still clear the overlay
    const fallbackId = setTimeout(() => {
      finishLoading()
    }, FALLBACK_FINISH_MS)

    return () => {
      clearTimeout(timeoutId)
      clearTimeout(fallbackId)
    }
  }, [pathname, searchParams, isExcluded, startLoading, finishLoading])

  // Hide overlay when loading finishes
  useEffect(() => {
    if (!isLoading) {
      // Fade out animation
      setShouldShow(false)
    }
  }, [isLoading])

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
