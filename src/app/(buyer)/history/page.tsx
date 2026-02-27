import Link from 'next/link'
import { format } from 'date-fns'
import { getDecidedRFQs } from '@/actions/decisions'
import { PageHeader } from '@/components/shared/page-header'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { HistoryList } from '@/components/rfq/history-list'

export default async function HistoryPage() {
  const items = await getDecidedRFQs()

  return (
    <div>
      <PageHeader
        title="History"
        description="All recorded procurement decisions."
      />
      <HistoryList items={items} />
    </div>
  )
}
