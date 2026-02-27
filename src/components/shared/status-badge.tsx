import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { RFQStatus } from '@/types'

const config: Record<RFQStatus, { label: string; className: string }> = {
  draft:     { label: 'Draft',     className: 'bg-muted text-muted-foreground border-border' },
  open:      { label: 'Open',      className: 'bg-blue-50 text-blue-700 border-blue-200' },
  comparing: { label: 'Comparing', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  decided:   { label: 'Decided',   className: 'bg-green-50 text-green-700 border-green-200' },
}

interface StatusBadgeProps {
  status: RFQStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { label, className: statusClass } = config[status]
  return (
    <Badge
      variant="outline"
      className={cn('text-xs font-medium', statusClass, className)}
    >
      {label}
    </Badge>
  )
}
