'use client'

import { createPortal } from 'react-dom'
import { useEffect, type ReactNode } from 'react'

interface ModalOverlayProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  className?: string
}

/**
 * ModalOverlay - Reusable modal backdrop component
 * 
 * Provides consistent backdrop styling, z-index layering, and click-outside-to-close behavior.
 * Uses CSS variables from globals.css for backdrop color, blur, and z-index hierarchy.
 * 
 * Usage:
 * ```tsx
 * <ModalOverlay isOpen={isOpen} onClose={() => setIsOpen(false)}>
 *   <div className="card" style={{ maxWidth: 500 }}>
 *     {/* Your modal content *\/}
 *   </div>
 * </ModalOverlay>
 * ```
 */
export function ModalOverlay({ isOpen, onClose, children, className = '' }: ModalOverlayProps) {
  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen || typeof document === 'undefined') return null

  return createPortal(
    <div
      className={`fixed inset-0 flex items-center justify-center p-6 ${className}`}
      style={{
        background: 'var(--modal-backdrop)',
        backdropFilter: 'var(--modal-backdrop-blur)',
        zIndex: 'var(--z-modal-overlay)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflowY: 'auto',
        boxSizing: 'border-box',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          zIndex: 'var(--z-modal-content)',
          position: 'relative',
          margin: 'auto',
          maxHeight: 'calc(100dvh - 48px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </div>
    </div>,
    document.body,
  )
}
