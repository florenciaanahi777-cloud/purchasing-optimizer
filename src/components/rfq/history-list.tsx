'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Search, ChevronRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import type { HistoryItem } from '@/actions/decisions'

interface HistoryListProps {
  items: HistoryItem[]
}

export function HistoryList({ items }: HistoryListProps) {
  const [search, setSearch] = useState('')

  const filtered = items.filter(item =>
    item.rfqTitle.toLowerCase().includes(search.toLowerCase()) ||
    item.winningSupplierName.toLowerCase().includes(search.toLowerCase())
  )

  if (items.length === 0) {
    return (
      <div className="text-center py-20 space-y-2">
        <p className="text-sm font-medium">No decisions recorded yet.</p>
        <p className="text-sm text-muted-foreground">
          Completed RFQs will appear here once a decision is recorded.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search history…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* No search results */}
      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">
            No results for &quot;{search}&quot;.
          </p>
        </div>
      )}

      {/* Table */}
      {filtered.length > 0 && (
        <div className="border border-border rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">RFQ</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Winner</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground hidden md:table-cell">Decided</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground hidden lg:table-cell">By</th>
                <th className="px-4 py-2.5 w-8" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr
                  key={item.rfqId}
                  className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/rfq/${item.rfqId}`}
                      className="font-medium hover:underline"
                    >
                      {item.rfqTitle}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.itemCount} item{item.itemCount !== 1 ? 's' : ''}
                    </p>
                  </td>
                  <td className="px-4 py-3 font-medium text-green-700">
                    {item.winningSupplierName}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                    {format(new Date(item.decidedAt), 'MMM d, yyyy')}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                    {item.decidedByName ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <Link href={`/rfq/${item.rfqId}`}>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
