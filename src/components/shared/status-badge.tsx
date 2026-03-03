import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { RFQStatus } from '@/types'

const config: Record<RFQStatus, { label: string; className: string }> = {
  draft:     { label: 'Draft',     className: 'bg-[oklch(0.20_0_0)] text-[oklch(0.65_0_0)] border-[oklch(0.28_0_0)]' },
  open:      { label: 'Open',      className: 'bg-[oklch(0.18_0.05_240)] text-[oklch(0.75_0.15_240)] border-[oklch(0.75_0.15_240)]/30' },
  comparing: { label: 'Comparing', className: 'bg-[oklch(0.20_0.05_75)] text-[oklch(0.82_0.15_75)] border-[oklch(0.82_0.15_75)]/30' },
  decided:   { label: 'Decided',   className: 'bg-[oklch(0.18_0.05_145)] text-[oklch(0.72_0.17_145)] border-[oklch(0.72_0.17_145)]/30' },
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
