import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: ReactNode
  subtitle?: ReactNode
  /** Optional trailing control (badge, button, link) rendered on the right. */
  actions?: ReactNode
}

/** Replaces the `page-header` / `page-title` / `page-subtitle` block repeated across pages. */
export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
      </div>
      {actions}
    </div>
  )
}