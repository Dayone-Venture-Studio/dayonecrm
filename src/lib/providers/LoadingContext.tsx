'use client'

import { createContext, useContext, useState, useCallback, useEffect } from 'react'

interface LoadingContextType {
  isLoading: boolean
  startLoading: () => void
  finishLoading: () => void
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

  const startLoading = useCallback(() => {
    setIsLoading(true)
  }, [])

  const finishLoading = useCallback(() => {
    setIsLoading(false)
  }, [])

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, finishLoading }}>
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

  useEffect(() => {
    // Signal that data is ready
    finishLoading()
  }, [finishLoading])
}
