'use client'

import { createPortal } from 'react-dom'
import { useEffect, type ReactNode } from 'react'
import { X, AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info' | 'success'
  icon?: ReactNode
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  icon,
}: ConfirmDialogProps) {
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

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen || typeof document === 'undefined') return null

  const variantColors = {
    danger: {
      icon: 'var(--color-danger)',
      bg: 'var(--color-danger-dim)',
      button: '#ca2f2b',
      buttonHover: '#b02825',
    },
    warning: {
      icon: 'var(--color-warning)',
      bg: 'var(--color-warning-dim)',
      button: '#d97706',
      buttonHover: '#b45309',
    },
    info: {
      icon: 'var(--color-info)',
      bg: 'var(--color-info-dim)',
      button: '#0284c7',
      buttonHover: '#0369a1',
    },
    success: {
      icon: 'var(--color-success)',
      bg: 'var(--color-success-dim)',
      button: '#059669',
      buttonHover: '#047857',
    },
  }

  const colors = variantColors[variant]

  const overlay = (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
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
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '16px',
          maxWidth: '420px',
          width: '100%',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          zIndex: 'var(--z-modal-content)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 20px 16px 20px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: colors.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: colors.icon,
              }}
            >
              {icon || <AlertTriangle size={20} />}
            </div>
            <div>
              <h2
                id="confirm-dialog-title"
                style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: 700,
                  color: 'var(--color-text-primary)',
                }}
              >
                {title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '4px',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '6px',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'var(--color-surface-2)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px' }}>
          <p
            style={{
              margin: 0,
              fontSize: '14px',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.6,
            }}
          >
            {message}
          </p>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 20px 20px 20px',
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: 600,
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              background: 'white',
              color: 'var(--color-text-primary)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'var(--color-surface-2)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'white'
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: 600,
              borderRadius: '8px',
              border: 'none',
              background: colors.button,
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = colors.buttonHover
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = colors.button
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(overlay, document.body)
}
