import { notFound } from 'next/navigation'
import { getComparisonData } from '@/actions/rfqs'
import { PageHeader } from '@/components/shared/page-header'
import { ComparisonTable } from '@/components/rfq/comparison-table'
import { AIRecommendationCard } from '@/components/rfq/ai-recommendation-card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { format } from 'date-fns'
import { Clock } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ComparePage({ params }: Props) {
  const { id } = await params
  const data = await getComparisonData(id)

  if (!data) notFound()

  const isDecided = data.rfq.status === 'decided'
  const submittedCount = data.columns.filter(c => c.quote !== null).length
  const deadline = format(new Date(data.rfq.deadline + 'T12:00:00'), 'MMM d, yyyy')

  return (
    <div>
      <PageHeader
        title={data.rfq.title}
        backHref={`/rfq/${id}`}
        backLabel="RFQ"
      />

      {/* Sub-header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            Deadline: {deadline}
          </span>
          <span>·</span>
          <span>{submittedCount} of {data.columns.length} quotes received</span>
        </div>
        {!isDecided && submittedCount > 0 && (
          <Button asChild size="sm">
            <Link href={`/rfq/${id}/decision`}>Record decision →</Link>
          </Button>
        )}
        {isDecided && (
          <Button asChild size="sm" variant="outline">
            <Link href={`/rfq/${id}/decision`}>View decision</Link>
          </Button>
        )}
      </div>

      {/* Comparison table */}
      <ComparisonTable data={data} />

      {/* AI recommendation — only shown if not decided and there are quotes */}
      {!isDecided && submittedCount > 0 && (
        <>
          <Separator className="my-8" />
          <AIRecommendationCard rfqId={id} />
        </>
      )}

    </div>
  )
}
