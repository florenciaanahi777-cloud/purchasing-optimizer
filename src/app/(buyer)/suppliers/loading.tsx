import { PageHeader } from '@/components/shared/page-header'

function SkeletonRow() {
  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-3"><div className="h-3.5 w-36 bg-muted rounded animate-pulse" /></td>
      <td className="px-4 py-3"><div className="h-3.5 w-48 bg-muted rounded animate-pulse" /></td>
      <td className="px-4 py-3 hidden md:table-cell"><div className="h-3.5 w-28 bg-muted rounded animate-pulse" /></td>
      <td className="px-4 py-3" />
    </tr>
  )
}

export default function SuppliersLoading() {
  return (
    <div>
      <PageHeader title="Suppliers" description="Your organization's reusable supplier directory." />
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-64 bg-muted rounded-md animate-pulse" />
          <div className="h-9 w-28 bg-muted rounded-md animate-pulse" />
        </div>
        <div className="border border-border rounded-md overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-2.5" /><th className="px-4 py-2.5" /><th className="px-4 py-2.5" /><th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              <SkeletonRow /><SkeletonRow /><SkeletonRow /><SkeletonRow />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
