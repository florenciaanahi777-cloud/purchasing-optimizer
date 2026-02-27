'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { AlertCircle, Clock, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { submitQuote } from '@/actions/quotes'
import type { QuotePageData } from '@/actions/quotes'
import type { RFQItem } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

type ItemState = {
  rfqItemId: string
  unitPrice: string
  totalPrice: string
  totalAutoMode: boolean  // auto-compute total from unit × qty
  deliveryDays: string
  notes: string
}

function initItems(
  items: RFQItem[],
  existing: QuotePageData['existingQuote']
): ItemState[] {
  return items.map(item => {
    const ex = existing?.items.find(e => e.rfqItemId === item.id)
    return {
      rfqItemId: item.id,
      unitPrice: ex ? String(ex.unitPrice) : '',
      totalPrice: ex ? String(ex.totalPrice) : '',
      totalAutoMode: !ex,
      deliveryDays: ex?.deliveryDays != null ? String(ex.deliveryDays) : '',
      notes: ex?.notes ?? '',
    }
  })
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDeadline(dateStr: string) {
  try {
    return format(new Date(dateStr + 'T12:00:00'), 'MMMM d, yyyy')
  } catch {
    return dateStr
  }
}

function formatCurrency(val: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)
}

// ─── Read-only item row (already submitted or expired) ────────────────────────

function ReadOnlyItemCard({
  item,
  state,
  readonly,
}: {
  item: RFQItem
  state: ItemState
  readonly: boolean
}) {
  return (
    <div className="border border-border rounded-md overflow-hidden">
      <div className="px-4 py-2.5 bg-muted/30 border-b border-border">
        <p className="text-sm font-medium">{item.description}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {item.sku ? `${item.sku} · ` : ''}
          {item.unit} × {item.quantity}
        </p>
      </div>
      {readonly && state.unitPrice ? (
        <div className="px-4 py-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-xs text-muted-foreground block mb-0.5">Unit price</span>
            <span>{formatCurrency(Number(state.unitPrice))}</span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block mb-0.5">Total</span>
            <span>{formatCurrency(Number(state.totalPrice))}</span>
          </div>
          {state.deliveryDays && (
            <div>
              <span className="text-xs text-muted-foreground block mb-0.5">Delivery</span>
              <span>{state.deliveryDays} days</span>
            </div>
          )}
          {state.notes && (
            <div className="col-span-2">
              <span className="text-xs text-muted-foreground block mb-0.5">Notes</span>
              <span>{state.notes}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="px-4 py-3 text-sm text-muted-foreground italic">No data submitted</div>
      )}
    </div>
  )
}

// ─── Editable item card ───────────────────────────────────────────────────────

function EditableItemCard({
  item,
  state,
  onChange,
}: {
  item: RFQItem
  state: ItemState
  onChange: (updated: Partial<ItemState>) => void
}) {
  function handleUnitPriceChange(value: string) {
    const updates: Partial<ItemState> = { unitPrice: value }
    if (state.totalAutoMode) {
      const computed = !isNaN(Number(value)) && Number(value) > 0
        ? (Number(value) * Number(item.quantity)).toFixed(2)
        : ''
      updates.totalPrice = computed
    }
    onChange(updates)
  }

  function handleTotalPriceChange(value: string) {
    onChange({ totalPrice: value, totalAutoMode: false })
  }

  return (
    <div className="border border-border rounded-md overflow-hidden">
      {/* Item header */}
      <div className="px-4 py-2.5 bg-muted/30 border-b border-border">
        <p className="text-sm font-medium">{item.description}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {item.sku ? `${item.sku} · ` : ''}
          {item.unit} × {item.quantity}
        </p>
      </div>

      {/* Inputs */}
      <div className="px-4 py-3 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">
              Unit price <span className="text-destructive">*</span>
            </Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={state.unitPrice}
              onChange={e => handleUnitPriceChange(e.target.value)}
              className="h-8 text-sm"
              required
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">
              Total price <span className="text-destructive">*</span>
              {state.totalAutoMode && (
                <span className="text-muted-foreground ml-1">(auto)</span>
              )}
            </Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={state.totalPrice}
              onChange={e => handleTotalPriceChange(e.target.value)}
              className="h-8 text-sm"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">
            Delivery time{' '}
            <span className="text-muted-foreground font-normal">(days, optional)</span>
          </Label>
          <Input
            type="number"
            min="0"
            step="1"
            placeholder="e.g. 5"
            value={state.deliveryDays}
            onChange={e => onChange({ deliveryDays: e.target.value })}
            className="h-8 text-sm max-w-[120px]"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs">
            Notes <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Input
            placeholder="e.g. Price valid for 30 days"
            value={state.notes}
            onChange={e => onChange({ notes: e.target.value })}
            className="h-8 text-sm"
          />
        </div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface QuoteFormProps {
  token: string
  data: QuotePageData
}

export function QuoteForm({ token, data }: QuoteFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [itemStates, setItemStates] = useState<ItemState[]>(() =>
    initItems(data.items, data.existingQuote)
  )
  const [generalNotes, setGeneralNotes] = useState(data.existingQuote?.notes ?? '')

  const isLocked = data.isExpired || data.alreadySubmitted

  function updateItem(rfqItemId: string, updates: Partial<ItemState>) {
    setItemStates(prev =>
      prev.map(s => s.rfqItemId === rfqItemId ? { ...s, ...updates } : s)
    )
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    // Validate all items have required fields
    for (const state of itemStates) {
      if (!state.unitPrice || !state.totalPrice) {
        toast.error('Please fill in unit price and total price for all items.')
        return
      }
    }

    startTransition(async () => {
      const result = await submitQuote(
        token,
        itemStates.map(s => ({
          rfqItemId: s.rfqItemId,
          unitPrice: Number(s.unitPrice),
          totalPrice: Number(s.totalPrice),
          deliveryDays: s.deliveryDays ? Number(s.deliveryDays) : null,
          notes: s.notes || undefined,
        })),
        generalNotes
      )

      if (result.error) {
        toast.error(result.error)
        return
      }

      router.push(
        `/quote/${token}/submitted?title=${encodeURIComponent(data.rfq.title)}`
      )
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">

        {/* ── RFQ header ──────────────────────────────────────────────── */}
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Quote request
          </p>
          <h1 className="text-xl font-semibold">{data.rfq.title}</h1>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>Deadline: {formatDeadline(data.rfq.deadline)}</span>
          </div>
          {data.rfq.description && (
            <p className="text-sm text-muted-foreground pt-1">{data.rfq.description}</p>
          )}
          <p className="text-sm pt-1">
            Submitted to: <span className="font-medium">{data.supplier.name}</span>
          </p>
        </div>

        {/* ── Status banners ───────────────────────────────────────────── */}
        {data.alreadySubmitted && data.existingQuote && (
          <Alert className="border-green-200 bg-green-50 text-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription>
              You already submitted a quote on{' '}
              {formatDeadline(data.existingQuote.submittedAt)}.
              This form is now locked.
            </AlertDescription>
          </Alert>
        )}

        {data.isExpired && !data.alreadySubmitted && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This RFQ closed on {formatDeadline(data.rfq.deadline)}.
              Submissions are no longer accepted.
            </AlertDescription>
          </Alert>
        )}

        {/* ── Form ─────────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Items */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold">
              Items <span className="text-muted-foreground font-normal">({data.items.length})</span>
            </h2>

            {data.items.map((item, idx) => {
              const state = itemStates[idx]
              if (!state) return null

              return isLocked ? (
                <ReadOnlyItemCard
                  key={item.id}
                  item={item}
                  state={state}
                  readonly={data.alreadySubmitted}
                />
              ) : (
                <EditableItemCard
                  key={item.id}
                  item={item}
                  state={state}
                  onChange={updates => updateItem(item.id, updates)}
                />
              )
            })}
          </div>

          {/* General notes */}
          {isLocked ? (
            generalNotes && (
              <div className="space-y-1">
                <p className="text-sm font-semibold">General notes</p>
                <p className="text-sm text-muted-foreground">{generalNotes}</p>
              </div>
            )
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="general-notes">
                General notes{' '}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Textarea
                id="general-notes"
                value={generalNotes}
                onChange={e => setGeneralNotes(e.target.value)}
                placeholder="e.g. All prices are valid for 30 days. Minimum order applies."
                rows={3}
              />
            </div>
          )}

          {/* Submit */}
          {!isLocked && (
            <div className="pt-2">
              <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
                {isPending ? 'Submitting…' : 'Submit quote'}
              </Button>
            </div>
          )}
        </form>

      </div>
    </div>
  )
}
