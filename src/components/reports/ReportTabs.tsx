'use client'

import { CalendarDays, CalendarRange } from 'lucide-react'

export type ReportTab = 'weekly' | 'monthly'

interface Props {
  tab: ReportTab
  onChange: (tab: ReportTab) => void
}

export function ReportTabs({ tab, onChange }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 4,
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 10,
        padding: 4,
      }}
      role="tablist"
      aria-label="Report period"
    >
      <TabButton
        active={tab === 'weekly'}
        onClick={() => onChange('weekly')}
        icon={<CalendarDays size={14} />}
        label="Weekly"
      />
      <TabButton
        active={tab === 'monthly'}
        onClick={() => onChange('monthly')}
        icon={<CalendarRange size={14} />}
        label="Monthly"
      />
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      onClick={onClick}
      role="tab"
      aria-selected={active}
      className="btn btn-sm"
      style={{
        background: active ? 'var(--color-brand)' : 'transparent',
        color: active ? '#fff' : 'var(--color-text-secondary)',
        border: 'none',
        boxShadow: active ? '0 2px 8px rgba(202, 47, 43, 0.28)' : 'none',
      }}
    >
      {icon}
      {label}
    </button>
  )
}