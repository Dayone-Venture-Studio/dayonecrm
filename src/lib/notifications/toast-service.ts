import { createElement } from 'react'
import toast from 'react-hot-toast'

/**
 * Centralized Toast Notification Service
 *
 * Provides a consistent API for displaying toast notifications across the application.
 * Always import this service instead of importing toast directly.
 *
 * Every toast renders a bold title and a short description line.
 *
 * Usage Examples:
 *
 * ```tsx
 * import { toastService } from '@/lib/notifications/toast-service'
 *
 * // Success notification
 * toastService.success('Task created', 'The task was added to the board.')
 *
 * // Error notification
 * toastService.error('Could not save', 'Check your connection and try again.')
 *
 * // Loading notification (resolves to an id for later dismissal)
 * const toastId = toastService.loading('Saving', 'Please wait…')
 * // ... later
 * toastService.dismiss(toastId)
 *
 * // Promise-based notification
 * toastService.promise(apiCall(), {
 *   loading: { title: 'Saving', description: 'Please wait…' },
 *   success: { title: 'Saved', description: 'Your changes are live.' },
 *   error: { title: 'Save failed', description: 'Try again in a moment.' },
 * })
 * ```
 *
 * Guidelines:
 * - Titles are short labels; descriptions are one short sentence
 * - Never expose stack traces, credentials, or internal details
 * - Use success toasts for user-initiated actions that succeed
 * - Use error toasts for failures that users need to know about
 * - Avoid toasts for background operations or silent failures (TV dashboard)
 */

export interface ToastContent {
  title: string
  description?: string
}

function ToastMessage({ title, description }: ToastContent) {
  return createElement(
    'div',
    { style: { display: 'flex', flexDirection: 'column', gap: 2 } },
    createElement(
      'span',
      { style: { fontWeight: 600, fontSize: 14, lineHeight: 1.3 } },
      title
    ),
    description
      ? createElement(
          'span',
          {
            style: {
              fontWeight: 400,
              fontSize: 12.5,
              lineHeight: 1.35,
              opacity: 0.85,
            },
          },
          description
        )
      : null
  )
}

function render(title: string, description?: string) {
  return createElement(ToastMessage, { title, description })
}

export const toastService = {
  /**
   * Display a success notification (green background)
   * @param title - Short success label
   * @param description - Short supporting sentence
   */
  success(title: string, description?: string) {
    toast.success(render(title, description))
  },

  /**
   * Display an error notification (red background)
   * @param title - Short error label
   * @param description - Short supporting sentence
   */
  error(title: string, description?: string) {
    toast.error(render(title, description))
  },

  /**
   * Display a loading notification
   * @param title - Short loading label
   * @param description - Short supporting sentence
   * @returns Toast ID for later dismissal
   */
  loading(title: string, description?: string): string {
    return toast.loading(render(title, description))
  },

  /**
   * Dismiss a specific toast or all toasts
   * @param toastId - Optional toast ID to dismiss specific toast
   */
  dismiss(toastId?: string) {
    toast.dismiss(toastId)
  },

  /**
   * Display a promise-based notification that automatically updates
   * @param promise - Promise to track
   * @param messages - Title/description for loading, success, and error states
   */
  promise<T>(
    promise: Promise<T>,
    messages: {
      loading: ToastContent
      success: ToastContent | ((data: T) => ToastContent)
      error: ToastContent | ((error: unknown) => ToastContent)
    }
  ): Promise<T> {
    const toRenderable = (value: ToastContent | string) =>
      typeof value === 'string' ? value : render(value.title, value.description)

    return toast.promise(promise, {
      loading: toRenderable(messages.loading),
      success: (data: T) =>
        typeof messages.success === 'function'
          ? toRenderable(messages.success(data))
          : toRenderable(messages.success),
      error: (error: unknown) =>
        typeof messages.error === 'function'
          ? toRenderable(messages.error(error))
          : toRenderable(messages.error),
    })
  },
}
