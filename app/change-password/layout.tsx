import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/getSession'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Change Password' }

export default async function ChangePasswordLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-background)',
        padding: 24,
      }}
    >
      {children}
    </div>
  )
}