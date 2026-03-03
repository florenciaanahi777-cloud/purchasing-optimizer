'use client'

import { cn } from '@/lib/utils'
import type { ComparisonData } from '@/types'

function formatCurrency(val: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)
}

interface ComparisonTableProps {
  data: ComparisonData
  selectedSupplierId?: string | null
  onSelectSupplier?: (id: string) => void
}

export function ComparisonTable({ data, selectedSupplierId, onSelectSupplier }: ComparisonTableProps) {
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
            {columns.map(col => {
              const isSelected = selectedSupplierId === col.supplierId
              const isSelectable = !!onSelectSupplier && col.quote !== null
              return (
                <th
                  key={col.rfqSupplierId}
                  onClick={() => isSelectable && onSelectSupplier!(col.supplierId)}
                  className={cn(
                    'px-4 py-2.5 text-xs font-medium text-center min-w-[140px] transition-colors',
                    isSelected ? 'bg-primary/8' : isSelectable && 'hover:bg-muted/40',
                    isSelectable && 'cursor-pointer',
                  )}
                >
                  {/* Radio indicator */}
                  {isSelectable && (
                    <span className={cn(
                      'inline-flex items-center justify-center h-3.5 w-3.5 rounded-full border mb-1.5',
                      isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/40'
                    )}>
                      {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white block" />}
                    </span>
                  )}
                  <span className={cn(
                    'block font-semibold',
                    isSelected
                      ? 'text-primary'
                      : col.submissionStatus === 'submitted'
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                  )}>
                    {col.supplierName}
                  </span>
                  {isSelected && (
                    <span className="text-xs text-primary font-medium">Selected</span>
                  )}
                  {!isSelected && isSelectable && (
                    <span className="text-xs text-muted-foreground/60 font-normal">Click to select</span>
                  )}
                  {!isSelected && col.submissionStatus === 'invited' && (
                    <span className="text-xs text-muted-foreground font-normal">Awaiting</span>
                  )}
                </th>
              )
            })}
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
                  const isSelected = selectedSupplierId === col.supplierId

                  if (!col.quote) {
                    return (
                      <td key={col.rfqSupplierId} className={cn(
                        'px-4 py-3 text-center text-muted-foreground text-xs',
                        isSelected && 'bg-primary/5'
                      )}>
                        —
                      </td>
                    )
                  }

                  const price = col.quote.itemPrices[item.id]
                  const isLowest = lowest === col.supplierId && submitted.length > 1

                  if (!price) {
                    return (
                      <td key={col.rfqSupplierId} className={cn(
                        'px-4 py-3 text-center text-muted-foreground text-xs',
                        isSelected && 'bg-primary/5'
                      )}>
                        Not quoted
                      </td>
                    )
                  }

                  return (
                    <td
                      key={col.rfqSupplierId}
                      className={cn(
                        'px-4 py-3 text-center',
                        isLowest && 'bg-[oklch(0.15_0.03_145)]',
                        isSelected && !isLowest && 'bg-primary/5'
                      )}
                    >
                      <p className={cn('font-medium tabular-nums', isLowest && 'text-[oklch(0.72_0.17_145)] font-semibold')}>
                        {formatCurrency(price.unitPrice)}
                        {isLowest && <span className="ml-1 text-xs text-[oklch(0.72_0.17_145)]">★</span>}
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
              const isSelected = selectedSupplierId === col.supplierId
              return (
                <td
                  key={col.rfqSupplierId}
                  className={cn(
                    'px-4 py-3 text-center',
                    isLowest && 'bg-[oklch(0.15_0.03_145)]',
                    isSelected && !isLowest && 'bg-primary/5'
                  )}
                >
                  {col.quote ? (
                    <p className={cn('font-semibold tabular-nums text-sm', isLowest && 'text-[oklch(0.72_0.17_145)]')}>
                      {formatCurrency(col.quote.totalValue)}
                      {isLowest && <span className="ml-1 text-xs text-[oklch(0.72_0.17_145)]">★</span>}
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
