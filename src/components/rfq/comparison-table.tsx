'use client'

import { cn } from '@/lib/utils'
import type { ComparisonData } from '@/types'

function formatCurrency(val: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)
}

interface ComparisonTableProps {
  data: ComparisonData
}

export function ComparisonTable({ data }: ComparisonTableProps) {
  const { items, columns } = data
  const submitted = columns.filter(c => c.quote !== null)

  // For each item, find the supplier id with the lowest total price
  function lowestSupplierForItem(rfqItemId: string): string | null {
    let minPrice = Infinity
    let winnerId: string | null = null

    for (const col of submitted) {
      const price = col.quote!.itemPrices[rfqItemId]
      if (price && price.totalPrice < minPrice) {
        minPrice = price.totalPrice
        winnerId = col.supplierId
      }
    }
    return winnerId
  }

  // Lowest total quote value
  const lowestTotalSupplierId = submitted.reduce<string | null>((acc, col) => {
    if (!acc) return col.supplierId
    const accCol = submitted.find(c => c.supplierId === acc)
    if (!accCol?.quote) return col.supplierId
    return col.quote!.totalValue < accCol.quote!.totalValue ? col.supplierId : acc
  }, null)

  if (columns.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        No suppliers were added to this RFQ.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border border-border rounded-md overflow-hidden">

        {/* Header row — supplier names */}
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground w-[220px]">
              Item
            </th>
            {columns.map(col => (
              <th
                key={col.rfqSupplierId}
                className="px-4 py-2.5 text-xs font-medium text-center min-w-[140px]"
              >
                <span className={cn(
                  'block font-semibold',
                  col.submissionStatus === 'submitted' ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {col.supplierName}
                </span>
                {col.submissionStatus === 'invited' && (
                  <span className="text-xs text-muted-foreground font-normal">Awaiting</span>
                )}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {/* Price rows — one per item */}
          {items.map(item => {
            const lowest = lowestSupplierForItem(item.id)
            return (
              <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/10">
                <td className="px-4 py-3">
                  <p className="font-medium">{item.description}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.unit} × {item.quantity}
                    {item.sku ? ` · ${item.sku}` : ''}
                  </p>
                </td>
                {columns.map(col => {
                  if (!col.quote) {
                    return (
                      <td key={col.rfqSupplierId} className="px-4 py-3 text-center text-muted-foreground text-xs">
                        —
                      </td>
                    )
                  }

                  const price = col.quote.itemPrices[item.id]
                  const isLowest = lowest === col.supplierId && submitted.length > 1

                  if (!price) {
                    return (
                      <td key={col.rfqSupplierId} className="px-4 py-3 text-center text-muted-foreground text-xs">
                        Not quoted
                      </td>
                    )
                  }

                  return (
                    <td
                      key={col.rfqSupplierId}
                      className={cn(
                        'px-4 py-3 text-center',
                        isLowest && 'bg-green-50'
                      )}
                    >
                      <p className={cn('font-medium tabular-nums', isLowest && 'text-green-700')}>
                        {formatCurrency(price.unitPrice)}
                        {isLowest && <span className="ml-1 text-xs">★</span>}
                      </p>
                      <p className="text-xs text-muted-foreground tabular-nums">
                        {formatCurrency(price.totalPrice)} total
                      </p>
                      {price.deliveryDays != null && (
                        <p className="text-xs text-muted-foreground">
                          {price.deliveryDays}d delivery
                        </p>
                      )}
                    </td>
                  )
                })}
              </tr>
            )
          })}

          {/* Total row */}
          <tr className="border-t-2 border-border bg-muted/20">
            <td className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Total
            </td>
            {columns.map(col => {
              const isLowest = lowestTotalSupplierId === col.supplierId && submitted.length > 1
              return (
                <td
                  key={col.rfqSupplierId}
                  className={cn('px-4 py-3 text-center', isLowest && 'bg-green-50')}
                >
                  {col.quote ? (
                    <p className={cn('font-semibold tabular-nums text-sm', isLowest && 'text-green-700')}>
                      {formatCurrency(col.quote.totalValue)}
                      {isLowest && <span className="ml-1 text-xs">★</span>}
                    </p>
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </td>
              )
            })}
          </tr>
        </tbody>
      </table>

      {/* Notes per supplier */}
      {submitted.some(c => c.quote?.notes) && (
        <div className="mt-4 space-y-2">
          {submitted
            .filter(c => c.quote?.notes)
            .map(col => (
              <p key={col.supplierId} className="text-xs text-muted-foreground">
                <span className="font-medium">{col.supplierName}:</span>{' '}
                {col.quote!.notes}
              </p>
            ))}
        </div>
      )}
    </div>
  )
}
