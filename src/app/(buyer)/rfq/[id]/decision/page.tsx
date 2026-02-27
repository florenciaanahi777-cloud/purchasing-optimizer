import { notFound, redirect } from 'next/navigation'
import { getComparisonData } from '@/actions/rfqs'
import { PageHeader } from '@/components/shared/page-header'
import { DecisionForm } from '@/components/rfq/decision-form'
import { Separator } from '@/components/ui/separator'
import { format } from 'date-fns'

interface Props {
  params: Promise<{ id: string }>
}

export default async function DecisionPage({ params }: Props) {
  const { id } = await params
  const data = await getComparisonData(id)

  if (!data) notFound()

  // If already decided, show read-only decision summary via the RFQ detail page
  if (data.rfq.status === 'decided') {
    redirect(`/rfq/${id}`)
  }

  const submittedCount = data.columns.filter(c => c.quote !== null).length
  const deadline = format(new Date(data.rfq.deadline + 'T12:00:00'), 'MMM d, yyyy')

  return (
    <div>
      <PageHeader
        title="Record decision"
        description={`${data.rfq.title} · Deadline: ${deadline} · ${submittedCount} quote${submittedCount !== 1 ? 's' : ''} received`}
        backHref={`/rfq/${id}/compare`}
        backLabel="Comparison"
      />
      <Separator className="mb-8" />
      <DecisionForm data={data} />
    </div>
  )
}
