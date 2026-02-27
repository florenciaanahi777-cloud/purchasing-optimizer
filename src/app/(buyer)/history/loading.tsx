import { PageHeader } from '@/components/shared/page-header'

function RowSkeleton() {
  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-3"><div className="h-3.5 w-48 bg-muted rounded animate-pulse" /></td>
      <td className="px-4 py-3"><div className="h-3.5 w-32 bg-muted rounded animate-pulse" /></td>
      <td className="px-4 py-3 hidden md:table-cell"><div className="h-3.5 w-24 bg-muted rounded animate-pulse" /></td>
      <td className="px-4 py-3 hidden lg:table-cell"><div className="h-3.5 w-20 bg-muted rounded animate-pulse" /></td>
      <td className="px-4 py-3" />
    </tr>
  )
}

export default function HistoryLoading() {
  return (
    <div>
      <PageHeader title="History" description="All recorded procurement decisions." />
      <div className="space-y-4">
        <div className="h-9 w-48 bg-muted rounded-md animate-pulse" />
        <div className="border border-border rounded-md overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-2.5" /><th /><th /><th /><th />
              </tr>
            </thead>
            <tbody>
              <RowSkeleton /><RowSkeleton /><RowSkeleton /><RowSkeleton />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
