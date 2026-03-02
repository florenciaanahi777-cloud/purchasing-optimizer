import { notFound } from 'next/navigation'
import { getComparisonData, getRFQDetail } from '@/actions/rfqs'
import { PageHeader } from '@/components/shared/page-header'
import { CompareDecideLayout } from '@/components/rfq/compare-decide-layout'
import { format } from 'date-fns'
import { Clock } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ComparePage({ params }: Props) {
  const { id } = await params
  const [data, detail] = await Promise.all([
    getComparisonData(id),
    getRFQDetail(id),
  ])

  if (!data) notFound()

  const submittedCount = data.columns.filter(c => c.quote !== null).length
  const deadline = format(new Date(data.rfq.deadline + 'T12:00:00'), 'MMM d, yyyy')

  return (
    <div>
      <PageHeader
        title={data.rfq.title}
        backHref={`/rfq/${id}`}
        backLabel="RFQ"
      />

      <div className="flex items-center gap-3 text-sm text-muted-foreground mb-6">
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          Deadline: {deadline}
        </span>
        <span>·</span>
        <span>{submittedCount} of {data.columns.length} quotes received</span>
      </div>

      <CompareDecideLayout data={data} detail={detail} rfqId={id} />
    </div>
  )
}
