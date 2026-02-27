import Link from 'next/link'
import { Plus } from 'lucide-react'
import { getRFQsWithCounts } from '@/actions/rfqs'
import { PageHeader } from '@/components/shared/page-header'
import { RFQCard } from '@/components/rfq/rfq-card'
import { Button } from '@/components/ui/button'
import type { RFQSummary } from '@/types'

function EmptyState() {
  return (
    <div className="text-center py-20 space-y-3">
      <p className="text-sm font-medium">No RFQs yet.</p>
      <p className="text-sm text-muted-foreground">
        Start by creating your first request for quotation.
      </p>
      <Button size="sm" asChild>
        <Link href="/rfq/new">
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          New RFQ
        </Link>
      </Button>
    </div>
  )
}

function RFQGroup({ title, rfqs }: { title: string; rfqs: RFQSummary[] }) {
  if (rfqs.length === 0) return null
  return (
    <div className="space-y-2">
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {title}
      </h2>
      <div className="space-y-2">
        {rfqs.map(rfq => <RFQCard key={rfq.id} rfq={rfq} />)}
      </div>
    </div>
  )
}

export default async function DashboardPage() {
  const rfqs = await getRFQsWithCounts()

  const active  = rfqs.filter(r => r.status === 'open' || r.status === 'comparing')
  const drafts  = rfqs.filter(r => r.status === 'draft')
  const decided = rfqs.filter(r => r.status === 'decided')

  return (
    <div>
      <PageHeader
        title="Dashboard"
        action={
          <Button size="sm" asChild>
            <Link href="/rfq/new">
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              New RFQ
            </Link>
          </Button>
        }
      />

      {rfqs.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-8">
          <RFQGroup title="Active" rfqs={active} />
          <RFQGroup title="Drafts" rfqs={drafts} />
          <RFQGroup title="Decided" rfqs={decided} />
        </div>
      )}
    </div>
  )
}
