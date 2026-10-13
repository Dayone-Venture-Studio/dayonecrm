'use client'

import { useDataLoaded } from '@/lib/providers/LoadingContext'

/**
 * DataLoadedSignal
 *
 * Renders nothing. Place it inside the resolved (Suspense-resolved) async
 * content of a route so the global loading overlay clears exactly when the
 * page's data is ready, instead of relying on the provider's fallback timer.
 */
export function DataLoadedSignal() {
  useDataLoaded()
  return null
}
