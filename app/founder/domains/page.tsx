import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth/getSession'
import { getMembershipForUser } from '@/lib/startups/queries'
import { DomainsClient } from '@/components/domains/DomainsClient'
import { PageHeader } from '@/components/layout/PageHeader'
import { CardsSkeleton } from '@/components/layout/LoadingStates'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Domains' }

export default function DomainsPage() {
  return (
    <div>
      <PageHeader title="Domains" subtitle="Organize your team by functional area" />

      <Suspense fallback={<CardsSkeleton count={6} />}>
        <DomainsContent />
      </Suspense>
    </div>
  )
}

async function DomainsContent() {
  const session = await getSession()
  const supabase = await createClient()

  const membership = await getMembershipForUser(session!.id, 'FOUNDER')
  const startupId = membership?.startup_id
  if (!startupId) return <div>Startup not found</div>

  const { data: domains } = await supabase
    .from('domains')
    .select('*')
    .eq('startup_id', startupId)
    .order('created_at', { ascending: true })

  return <DomainsClient startupId={startupId} domains={domains || []} />
}
