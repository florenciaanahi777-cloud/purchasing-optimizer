import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

interface PageHeaderProps {
  title: string
  description?: string
  backHref?: string
  backLabel?: string
  action?: React.ReactNode
}

export function PageHeader({ title, description, backHref, backLabel, action }: PageHeaderProps) {
  return (
    <div className="mb-8 flex items-start justify-between gap-4">
      <div className="space-y-1">
        {backHref && (
          <Link
            href={backHref}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-1 transition-colors"
          >
            <ChevronLeft className="h-3 w-3" />
            {backLabel ?? 'Back'}
          </Link>
        )}
        <h1 className="text-xl font-semibold">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
