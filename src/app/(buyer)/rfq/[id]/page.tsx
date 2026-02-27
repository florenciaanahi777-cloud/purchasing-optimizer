import { notFound } from 'next/navigation'
import { getRFQDetail } from '@/actions/rfqs'
import { PageHeader } from '@/components/shared/page-header'
import { RFQDetailView } from '@/components/rfq/rfq-detail'

interface Props {
  params: Promise<{ id: string }>
}

export default async function RFQDetailPage({ params }: Props) {
  const { id } = await params
  const rfq = await getRFQDetail(id)

  if (!rfq) notFound()

  return (
    <div>
      <PageHeader
        title={rfq.title}
        backHref="/dashboard"
        backLabel="Dashboard"
      />
      <RFQDetailView rfq={rfq} />
    </div>
  )
}
