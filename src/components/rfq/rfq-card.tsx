import Link from 'next/link'
import { format } from 'date-fns'
import { Clock, Users, FileCheck } from 'lucide-react'
import { StatusBadge } from '@/components/shared/status-badge'
import { cn } from '@/lib/utils'
import type { RFQSummary } from '@/types'

interface RFQCardProps {
  rfq: RFQSummary
}

export function RFQCard({ rfq }: RFQCardProps) {
  const deadline = format(new Date(rfq.deadline + 'T12:00:00'), 'MMM d, yyyy')
  const isPastDeadline = rfq.deadline < new Date().toISOString().split('T')[0]
  const isDecided = rfq.status === 'decided'

  return (
    <Link
      href={`/rfq/${rfq.id}`}
      className={cn(
        'block border border-border rounded-md px-4 py-4 hover:bg-muted/20 transition-colors space-y-3',
        isDecided && 'opacity-75'
      )}
    >
      {/* Title row */}
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold leading-snug">{rfq.title}</p>
        <StatusBadge status={rfq.status} className="shrink-0" />
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
        <span className={cn(
          'flex items-center gap-1',
          isPastDeadline && !isDecided && 'text-red-500'
        )}>
          <Clock className="h-3 w-3" />
          {isPastDeadline && !isDecided ? `Closed ${deadline}` : `Deadline ${deadline}`}
        </span>

        <span className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          {rfq.total_suppliers} supplier{rfq.total_suppliers !== 1 ? 's' : ''}
        </span>

        {rfq.total_suppliers > 0 && (
          <span className="flex items-center gap-1">
            <FileCheck className="h-3 w-3" />
            {rfq.submitted_count}/{rfq.total_suppliers} responded
          </span>
        )}

        {isDecided && rfq.winning_supplier_name && (
          <span className="text-green-600 font-medium">
            → {rfq.winning_supplier_name}
          </span>
        )}
      </div>
    </Link>
  )
}
