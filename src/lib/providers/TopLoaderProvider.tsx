'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useLoading } from './LoadingContext'

/**
 * TopLoaderProvider
 *
 * Shows the initial-load overlay during hydration and starts navigation
 * feedback from user-initiated same-origin links.
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
const NAVIGATION_FALLBACK_MS = 10_000
const SHOW_DELAY_MS = 100

const EXCLUDED_ROUTES = ['/login', '/register', '/unauthorized', '/tv', '/performance']

function isExcludedPath(pathname: string) {
  return EXCLUDED_ROUTES.some(route => pathname === route || pathname.startsWith(`${route}/`))
}

export function TopLoaderProvider() {
  const pathname = usePathname()
  const { isLoading, startLoading, finishLoading } = useLoading()
  const [isInitialRender, setIsInitialRender] = useState(true)
  const [shouldShow, setShouldShow] = useState(false)
  const previousPathRef = useRef(pathname)
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

  const isExcluded = isExcludedPath(pathname)

  const beginNavigation = useCallback(() => {
    clearTimers()
    setShouldShow(false)
    startLoading()

    showTimerRef.current = setTimeout(() => {
      setShouldShow(true)
    }, SHOW_DELAY_MS)

    fallbackTimerRef.current = setTimeout(() => {
      finishLoading()
    }, NAVIGATION_FALLBACK_MS)
  }, [clearTimers, finishLoading, startLoading])

  useEffect(() => {
    const timer = setTimeout(() => setIsInitialRender(false), 0)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (previousPathRef.current === pathname) return

    previousPathRef.current = pathname
    finishLoading()
  }, [pathname, finishLoading])

  useEffect(() => {
    if (isExcluded) {
      finishLoading()
      clearTimers()
    }
  }, [isExcluded, finishLoading, clearTimers])

  useEffect(() => {
    if (isExcluded) return

    const handleClick = (event: MouseEvent) => {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return
      }

      if (!(event.target instanceof Element)) return
      const link = event.target.closest<HTMLAnchorElement>('a[href]')
      if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return

      const destination = new URL(link.href, window.location.href)
      if (
        destination.origin !== window.location.origin ||
        destination.pathname === pathname ||
        isExcludedPath(destination.pathname)
      ) {
        return
      }

      beginNavigation()
    }

    const handlePopState = () => {
      const destination = window.location.pathname
      if (destination !== pathname && !isExcludedPath(destination)) {
        beginNavigation()
      }
    }

    document.addEventListener('click', handleClick, true)
    window.addEventListener('popstate', handlePopState)

    return () => {
      document.removeEventListener('click', handleClick, true)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [beginNavigation, isExcluded, pathname])

  // A page data signal or committed route change ends the active transition.
  useEffect(() => {
    if (!isLoading) {
      clearTimers()
    }
  }, [isLoading, clearTimers])

  if (isExcluded) return null

  const isVisible = isInitialRender || (isLoading && shouldShow)

  return (
    <div
      className={`loading-overlay ${isVisible ? 'loading-overlay--visible' : ''}`}
      aria-live="polite"
      aria-busy={isInitialRender || isLoading}
      aria-hidden={!isVisible}
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
