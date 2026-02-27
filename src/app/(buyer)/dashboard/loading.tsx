import { PageHeader } from '@/components/shared/page-header'

function CardSkeleton() {
  return (
    <div className="border border-border rounded-md px-4 py-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="h-4 w-56 bg-muted rounded animate-pulse" />
        <div className="h-5 w-16 bg-muted rounded animate-pulse" />
      </div>
      <div className="flex gap-4">
        <div className="h-3 w-28 bg-muted rounded animate-pulse" />
        <div className="h-3 w-20 bg-muted rounded animate-pulse" />
      </div>
    </div>
  )
}

export default function DashboardLoading() {
  return (
    <div>
      <PageHeader title="Dashboard" />
      <div className="space-y-8">
        <div className="space-y-2">
          <div className="h-3 w-12 bg-muted rounded animate-pulse" />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-10 bg-muted rounded animate-pulse" />
          <CardSkeleton />
        </div>
      </div>
    </div>
  )
}
