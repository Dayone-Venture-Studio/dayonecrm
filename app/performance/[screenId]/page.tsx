import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PERFORMANCE_SCREENS } from '@/components/performance/registry'
import { PerformanceScreenFrame } from '@/components/performance/PerformanceScreenFrame'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Performance Wall',
  description: 'Full-screen studio performance wall.',
}

interface Props {
  params: Promise<{ screenId: string }>
}

export default async function PerformanceScreenPage({ params }: Props) {
  const { screenId } = await params

  const index = PERFORMANCE_SCREENS.findIndex((screen) => screen.id === screenId)
  if (index === -1) notFound()

  const total = PERFORMANCE_SCREENS.length
  const screen = PERFORMANCE_SCREENS[index]
  const prev = PERFORMANCE_SCREENS[(index - 1 + total) % total]
  const next = PERFORMANCE_SCREENS[(index + 1) % total]
  const { Component } = screen

  return (
    <PerformanceScreenFrame
      name={screen.name}
      index={index}
      total={total}
      prevId={prev.id}
      nextId={next.id}
    >
      <Component />
    </PerformanceScreenFrame>
  )
}
