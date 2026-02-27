'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { recordDecision } from '@/actions/decisions'
import type { ComparisonData } from '@/types'

function formatCurrency(val: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)
}

interface DecisionFormProps {
  data: ComparisonData
  savedAiRecommendation?: string | null
}

export function DecisionForm({ data, savedAiRecommendation }: DecisionFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null)
  const [reason, setReason] = useState('')

  const submittedColumns = data.columns.filter(c => c.quote !== null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!selectedSupplierId) {
      toast.error('Please select a supplier.')
      return
    }
    if (!reason.trim()) {
      toast.error('Please write a reason for your decision.')
      return
    }

    const selectedColumn = data.columns.find(c => c.supplierId === selectedSupplierId)
    if (!selectedColumn?.quote) {
      toast.error('Selected supplier has not submitted a quote.')
      return
    }

    startTransition(async () => {
      const result = await recordDecision({
        rfqId: data.rfq.id,
        winningSupplierId: selectedSupplierId,
        winningQuoteId: selectedColumn.quote!.id,
        reason: reason.trim(),
        aiRecommendation: savedAiRecommendation ?? undefined,
      })

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success('Decision recorded.')
      router.push(`/rfq/${data.rfq.id}`)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">

      {/* ── Supplier selection ────────────────────────────────────────── */}
      <div className="space-y-3">
        <div>
          <Label className="text-sm font-semibold">
            Select winning supplier <span className="text-destructive">*</span>
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Only suppliers who have submitted a quote can be selected.
          </p>
        </div>

        {submittedColumns.length === 0 ? (
          <p className="text-sm text-muted-foreground">No quotes have been submitted yet.</p>
        ) : (
          <div className="space-y-2">
            {submittedColumns.map(col => {
              const isSelected = selectedSupplierId === col.supplierId
              return (
                <button
                  key={col.supplierId}
                  type="button"
                  onClick={() => setSelectedSupplierId(col.supplierId)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-md border text-left text-sm transition-colors',
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/40'
                  )}
                >
                  {/* Radio indicator */}
                  <span className={cn(
                    'h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center',
                    isSelected ? 'border-primary' : 'border-muted-foreground/40'
                  )}>
                    {isSelected && <span className="h-2 w-2 rounded-full bg-primary block" />}
                  </span>

                  <span className="flex-1">
                    <span className={cn('font-medium', isSelected && 'text-primary')}>
                      {col.supplierName}
                    </span>
                    {col.quote && (
                      <span className="text-muted-foreground ml-2 text-xs tabular-nums">
                        {formatCurrency(col.quote.totalValue)} total
                      </span>
                    )}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Reason ───────────────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <Label htmlFor="reason" className="text-sm font-semibold">
          Decision reason <span className="text-destructive">*</span>
        </Label>
        <p className="text-xs text-muted-foreground">
          This will be saved with the decision record. Be specific enough to justify the choice later.
        </p>
        <Textarea
          id="reason"
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="e.g. Best overall value — lowest total price and acceptable delivery time. Cardinal was cheaper on gloves M but the marginal saving wasn't worth splitting the order."
          rows={4}
          required
        />
      </div>

      {/* ── Actions ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 pt-2 border-t border-border">
        <Button
          type="submit"
          disabled={isPending || !selectedSupplierId || !reason.trim()}
        >
          {isPending ? 'Saving…' : 'Confirm decision'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>

    </form>
  )
}
