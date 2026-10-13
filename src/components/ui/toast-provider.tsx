'use client'

import { Toaster } from 'react-hot-toast'

/**
 * ToastProvider
 * 
 * Global toast notification provider using react-hot-toast.
 * Mounted once in the root layout to provide consistent notifications
 * across all routes.
 * 
 * Design System Integration:
 * - Success: Green (#059669) with white text
 * - Error: Brand red (#ca2f2b) with white text
 * - Radius: 14px (--radius-lg)
 * - Shadow: Design system shadow-md
 * - Duration: 4000ms default
 */
export function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 4000,
        style: {
          borderRadius: '14px',
          boxShadow: '0 4px 16px rgba(45, 38, 25, 0.07), 0 2px 6px rgba(45, 38, 25, 0.03)',
          fontSize: '14px',
          fontWeight: '500',
          maxWidth: '500px',
        },
        success: {
          style: {
            background: '#059669',
            color: '#ffffff',
            border: '1px solid rgba(5, 150, 105, 0.2)',
          },
          iconTheme: {
            primary: '#ffffff',
            secondary: '#059669',
          },
        },
        error: {
          style: {
            background: '#ca2f2b',
            color: '#ffffff',
            border: '1px solid rgba(202, 47, 43, 0.25)',
          },
          iconTheme: {
            primary: '#ffffff',
            secondary: '#ca2f2b',
          },
        },
        loading: {
          style: {
            background: '#ffffff',
            color: '#1e1b18',
            border: '1px solid #e5dfcb',
          },
        },
      }}
    />
  )
}
