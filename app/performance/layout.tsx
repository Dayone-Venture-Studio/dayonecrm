import type { ReactNode } from 'react'

export default function PerformanceLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="fixed inset-0 overflow-hidden font-sans text-black selection:bg-transparent"
      style={{ width: '100dvw', height: '100dvh', background: '#f2ede3' }}
    >
      {children}
    </div>
  )
}
