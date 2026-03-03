'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { recordDecision } from '@/actions/decisions'
import { useT } from '@/lib/locale-context'
import { ComparisonTable } from './comparison-table'
import { AIRecommendationCard } from './ai-recommendation-card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import type { ComparisonData, RFQDetail } from '@/types'

function formatCurrency(val: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)
}

interface Props {
  data: ComparisonData
  detail: RFQDetail | null
  rfqId: string
}

export function CompareDecideLayout({ data, detail, rfqId }: Props) {
  const t = useT()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null)

  const isDecided = data.rfq.status === 'decided'
  const isComparing = data.rfq.status === 'comparing'
  const submittedCount = data.columns.filter(c => c.quote !== null).length

  const selectedColumn = selectedSupplierId
    ? data.columns.find(c => c.supplierId === selectedSupplierId) ?? null
    : null

  const canConfirm = !!selectedSupplierId && reason.trim().length > 0
  const validationMessage = !selectedSupplierId
    ? t.select_to_continue
    : !reason.trim()
    ? t.add_reason
    : null

  function handleSubmit() {
    if (!selectedSupplierId || !reason.trim() || !selectedColumn?.quote) return

    startTransition(async () => {
      const result = await recordDecision({
        rfqId: data.rfq.id,
        winningSupplierId: selectedSupplierId,
        winningQuoteId: selectedColumn.quote!.id,
        reason: reason.trim(),
        aiRecommendation: aiRecommendation ?? undefined,
      })

      if (result.error) {
        toast.error(result.error)
        // preserve all inputs — no state reset
        return
      }

      toast.success(t.decision_recorded)
      router.push(`/rfq/${data.rfq.id}`)
    })
  }

  const decision = detail?.decision ?? null
  const winningColumn = decision
    ? data.columns.find(c => c.supplierId === decision.winning_supplier_id)
    : null

  const showPanel = isComparing || isDecided

  return (
    <div className="flex gap-8 items-start">

      {/* ── Left: comparison table ─────────────────────────────────────── */}
      <div className="flex-1 min-w-0 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t.received_quotes}
        </p>
        <ComparisonTable
          data={data}
          selectedSupplierId={selectedSupplierId}
          onSelectSupplier={isComparing && submittedCount > 0 ? setSelectedSupplierId : undefined}
        />
      </div>

      {/* ── Right: sticky decision panel ──────────────────────────────── */}
      {showPanel && (
        <div className="w-80 shrink-0 sticky top-8 space-y-5 pl-6 border-l border-border">

          {/* Decided — read-only summary */}
          {isDecided && decision && (
            <div className="rounded-lg border border-[oklch(0.72_0.17_145)]/30 bg-[oklch(0.13_0.03_145)] p-4 space-y-1">
              <p className="text-xs font-medium text-[oklch(0.72_0.17_145)] uppercase tracking-wide">
                {t.decision_recorded_title} · {format(new Date(decision.decided_at), 'MMM d, yyyy')}
              </p>
              <p className="text-sm font-semibold text-foreground">{decision.winning_supplier.name}</p>
              {winningColumn?.quote && (
                <p className="text-sm text-[oklch(0.72_0.17_145)] tabular-nums">
                  {formatCurrency(winningColumn.quote.totalValue)} total
                </p>
              )}
              <p className="text-sm italic text-[oklch(0.72_0.17_145)]/80">"{decision.reason}"</p>
            </div>
          )}

          {/* Comparing — decision form */}
          {isComparing && submittedCount === 0 && (
            <p className="text-sm text-muted-foreground">{t.no_quotes_submitted}</p>
          )}

          {isComparing && submittedCount > 0 && (
            <>
              {/* 1. Selected supplier summary */}
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t.selected_supplier}
                </p>
                {selectedColumn ? (
                  <div className="border border-primary rounded-md px-3 py-2.5 bg-primary/5 space-y-1">
                    <p className="text-sm font-semibold">{selectedColumn.supplierName}</p>
                    {selectedColumn.quote ? (
                      <>
                        <p className="text-xs text-muted-foreground tabular-nums">
                          {t.total_label}{' '}
                          <span className="text-foreground font-medium">
                            {formatCurrency(selectedColumn.quote.totalValue)}
                          </span>
                        </p>
                        {(() => {
                          const days = Object.values(selectedColumn.quote!.itemPrices)
                            .map(p => p.deliveryDays)
                            .filter((d): d is number => d !== null)
                          if (days.length === 0) return null
                          const avg = Math.round(days.reduce((a, b) => a + b, 0) / days.length)
                          return (
                            <p className="text-xs text-muted-foreground">
                              {t.avg_delivery}{' '}
                              <span className="text-foreground font-medium">{avg}d</span>
                            </p>
                          )
                        })()}
                      </>
                    ) : (
                      <p className="text-xs text-muted-foreground">{t.no_quote_submitted}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">{t.none_selected}</p>
                )}
              </div>

              <Separator />

              {/* 2. AI recommendation — advisory */}
              <div className="space-y-1.5">
                <AIRecommendationCard rfqId={rfqId} onRecommendation={setAiRecommendation} />
                <p className="text-xs text-muted-foreground">
                  {t.ai_advisory}
                </p>
              </div>

              <Separator />

              {/* 3. Decision reason */}
              <div className="space-y-1.5">
                <Label htmlFor="reason" className="text-sm font-semibold">
                  {t.decision_reason_label} <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="e.g. Best overall value — lowest total price and acceptable delivery time."
                  rows={4}
                />
              </div>

              {/* 4. Confirm */}
              <div className="space-y-1.5">
                <Button
                  className="w-full"
                  disabled={!canConfirm || isPending}
                  onClick={handleSubmit}
                >
                  {isPending ? t.saving : t.confirm_decision}
                </Button>
                {validationMessage && (
                  <p className="text-xs text-muted-foreground text-center">
                    {validationMessage}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
