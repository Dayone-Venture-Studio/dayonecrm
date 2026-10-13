import { useTransition } from 'react'
import { toastService, type ToastContent } from '@/lib/notifications/toast-service'
import type { ActionState } from '@/types'

/**
 * Per-execution toast content. Either a fixed title/description pair or a
 * builder that derives it from the action result / error.
 */
export interface ActionToastMessages<T = unknown> {
  success?: ToastContent | ((data: T) => ToastContent)
  error?: ToastContent | ((error: string) => ToastContent)
}

/**
 * Options for useServerAction hook
 */
interface UseServerActionOptions<T = unknown> {
  /**
   * Suppress toast notifications (for background operations or TV dashboard)
   * @default false
   */
  silent?: boolean

  /**
   * Callback fired on successful action
   * @param data - Data returned from the server action
   */
  onSuccess?: (data: T) => void

  /**
   * Callback fired on error
   * @param error - Error message from the server action
   */
  onError?: (error: string) => void
}

/**
 * Custom hook for executing server actions with automatic toast notifications
 * 
 * Wraps useTransition and automatically displays toast notifications based on
 * ActionState responses from server actions. Replaces the manual pattern of:
 * - useTransition + manual toast calls
 * - Manual error state management
 * - Manual success callbacks
 * 
 * @param options - Configuration options
 * @returns Tuple of [executeAction, isPending]
 * 
 * @example
 * ```tsx
 * const [executeCreate, isPending] = useServerAction({
 *   onSuccess: () => {
 *     setShowModal(false)
 *     form.reset()
 *   }
 * })
 * 
 * function handleSubmit(formData: FormData) {
 *   executeCreate(() => createTask({}, formData))
 * }
 * ```
 * 
 * @example Silent mode (no toasts)
 * ```tsx
 * const [executeSync, isPending] = useServerAction({ silent: true })
 * 
 * function syncData() {
 *   executeSync(() => syncTelemetry())
 * }
 * ```
 */
export function useServerAction<T = unknown>(
  options: UseServerActionOptions<T> = {}
) {
  const { silent = false, onSuccess, onError } = options
  const [isPending, startTransition] = useTransition()

  /**
   * Execute a server action with automatic toast handling
   * @param actionFn - Function that returns a Promise of ActionState
   * @param options - Optional per-call overrides:
   *   - onStart: side effect run inside the transition before the action fires
   *     (e.g. an optimistic update from useOptimistic, which React only honors
   *     when called within a transition/action scope)
   *   - success / error: toast title + description for this call
   */
  const executeAction = async (
    actionFn: () => Promise<ActionState>,
    {
      onStart,
      success,
      error: errorMessage,
    }: ActionToastMessages<T> & { onStart?: () => void } = {}
  ) => {
    startTransition(async () => {
      onStart?.()
      try {
        const result = await actionFn()

        // Handle error state
        if (result.error) {
          if (!silent) {
            const content =
              typeof errorMessage === 'function'
                ? errorMessage(result.error)
                : errorMessage
            if (content) {
              toastService.error(content.title, content.description)
            } else {
              toastService.error('Something went wrong', result.error)
            }
          }
          onError?.(result.error)
          return
        }

        // Handle success state
        if (result.success) {
          if (!silent) {
            const content =
              typeof success === 'function'
                ? success(result.data as T)
                : success
            if (content) {
              toastService.success(content.title, content.description)
            } else {
              toastService.success(result.success)
            }
          }
          onSuccess?.(result.data as T)
          return
        }

        // No explicit success or error (should be rare)
        // Just call onSuccess if data exists
        if (result.data !== undefined) {
          onSuccess?.(result.data as T)
        }
      } catch (error) {
        // Unexpected error (network failure, etc.)
        const message = error instanceof Error ? error.message : 'An unexpected error occurred'

        if (!silent) {
          toastService.error('Something went wrong', message)
        }
        onError?.(message)

        // Keep console.error for debugging
        console.error('useServerAction error:', error)
      }
    })
  }

  return [executeAction, isPending] as const
}
