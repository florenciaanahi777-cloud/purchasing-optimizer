'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, Trash2, Send, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { SupplierSelector } from './supplier-selector'
import { createRFQ } from '@/actions/rfqs'
import { useT } from '@/lib/locale-context'
import type { Supplier } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

type ItemRow = {
  localId: string
  sku: string
  description: string
  unit: string
  quantity: string
}

function newItem(): ItemRow {
  return { localId: crypto.randomUUID(), sku: '', description: '', unit: '', quantity: '' }
}

function validate(
  title: string,
  deadline: string,
  items: ItemRow[],
  selectedIds: string[],
  isDraft: boolean
): string | null {
  if (!title.trim()) return 'RFQ title is required.'
  if (!deadline) return 'Deadline is required.'
  if (items.length === 0) return 'Add at least one line item.'
  for (const item of items) {
    if (!item.description.trim()) return 'All items need a description.'
    if (!item.unit.trim()) return 'All items need a unit.'
    const qty = Number(item.quantity)
    if (!item.quantity || isNaN(qty) || qty <= 0) return 'All items need a valid quantity.'
  }
  if (!isDraft && selectedIds.length === 0) return 'Select at least one supplier to send the RFQ.'
  return null
}

// ─── Component ────────────────────────────────────────────────────────────────

interface RFQFormProps {
  initialSuppliers: Supplier[]
}

export function RFQForm({ initialSuppliers }: RFQFormProps) {
  const t = useT()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const draftRef = useRef(false)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('')
  const [items, setItems] = useState<ItemRow[]>([newItem()])
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // ─── Item helpers ───────────────────────────────────────────────────────────

  function updateItem(localId: string, field: keyof Omit<ItemRow, 'localId'>, value: string) {
    setItems(prev => prev.map(r => r.localId === localId ? { ...r, [field]: value } : r))
  }

  function removeItem(localId: string) {
    setItems(prev => prev.filter(r => r.localId !== localId))
  }

  function addItem() {
    setItems(prev => [...prev, newItem()])
  }

  // ─── Submit ─────────────────────────────────────────────────────────────────

  function handleSubmit(isDraft: boolean) {
    const error = validate(title, deadline, items, selectedIds, isDraft)
    if (error) {
      toast.error(error)
      return
    }

    draftRef.current = isDraft

    startTransition(async () => {
      const result = await createRFQ(
        {
          title: title.trim(),
          description: description.trim() || undefined,
          deadline,
          items: items.map((item, i) => ({
            sku: item.sku.trim() || undefined,
            description: item.description.trim(),
            unit: item.unit.trim(),
            quantity: Number(item.quantity),
            sort_order: i,
          })),
          supplierIds: selectedIds,
        },
        isDraft
      )

      if (result.error) {
        toast.error(result.error)
        return
      }

      if (isDraft) {
        toast.success(t.rfq_draft_saved)
      } else {
        const n = selectedIds.length
        const failed = result.data?.emailsFailed ?? []
        if (failed.length > 0) {
          toast.warning(
            `RFQ sent. Email delivery failed for: ${failed.join(', ')}. Copy their links from the RFQ page.`
          )
        } else {
          toast.success(`${t.rfq_sent_to} ${n} ${n > 1 ? t.rfq_sent_suppliers : t.rfq_sent_supplier}.`)
        }
      }

      router.push(`/rfq/${result.data!.id}`)
    })
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  // Get today's date in YYYY-MM-DD for min date
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="max-w-3xl space-y-8">

      {/* ── Header fields ────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="rfq-title">
            {t.rfq_title_label} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="rfq-title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Surgical Gloves — Q2 2026"
            className="text-base"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="rfq-deadline">
              {t.rfq_deadline} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="rfq-deadline"
              type="date"
              value={deadline}
              min={today}
              onChange={e => setDeadline(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rfq-notes">
              {t.rfq_notes} <span className="text-muted-foreground font-normal">({t.optional})</span>
            </Label>
            <Input
              id="rfq-notes"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Internal context for this purchase"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* ── Line items ───────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold">{t.line_items}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{t.line_items_desc}</p>
        </div>

        {/* Items table */}
        <div className="border border-border rounded-md overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[100px_1fr_100px_90px_36px] gap-2 px-3 py-2 bg-muted/30 border-b border-border">
            <span className="text-xs font-medium text-muted-foreground">{t.sku}</span>
            <span className="text-xs font-medium text-muted-foreground">{t.description} *</span>
            <span className="text-xs font-medium text-muted-foreground">{t.unit} *</span>
            <span className="text-xs font-medium text-muted-foreground">{t.qty} *</span>
            <span />
          </div>

          {/* Rows */}
          {items.map((item, idx) => (
            <div
              key={item.localId}
              className="grid grid-cols-[100px_1fr_100px_90px_36px] gap-2 px-3 py-2 border-b border-border last:border-0 items-center"
            >
              <Input
                value={item.sku}
                onChange={e => updateItem(item.localId, 'sku', e.target.value)}
                placeholder="Optional"
                className="h-8 text-sm"
              />
              <Input
                value={item.description}
                onChange={e => updateItem(item.localId, 'description', e.target.value)}
                placeholder="Product description"
                className="h-8 text-sm"
                required
              />
              <Input
                value={item.unit}
                onChange={e => updateItem(item.localId, 'unit', e.target.value)}
                placeholder="box, unit…"
                className="h-8 text-sm"
                required
              />
              <Input
                value={item.quantity}
                onChange={e => updateItem(item.localId, 'quantity', e.target.value)}
                placeholder="0"
                type="number"
                min="0"
                step="1"
                className="h-8 text-sm"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                onClick={() => removeItem(item.localId)}
                disabled={items.length === 1}
                title={items.length === 1 ? 'At least one item is required' : 'Remove item'}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-xs gap-1.5 h-7 text-muted-foreground hover:text-foreground"
          onClick={addItem}
        >
          <Plus className="h-3 w-3" />
          {t.add_item}
        </Button>
      </div>

      <Separator />

      {/* ── Suppliers ────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold">{t.rfq_suppliers_label}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{t.rfq_suppliers_desc}</p>
        </div>

        <SupplierSelector
          suppliers={suppliers}
          selectedIds={selectedIds}
          onChange={setSelectedIds}
          onNewSupplier={s => setSuppliers(prev => [...prev, s])}
        />
      </div>

      {/* ── Actions ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => handleSubmit(true)}
        >
          <Save className="h-3.5 w-3.5 mr-1.5" />
          {isPending && draftRef.current ? t.saving : t.save_as_draft}
        </Button>

        <Button
          type="button"
          size="sm"
          disabled={isPending}
          onClick={() => handleSubmit(false)}
        >
          <Send className="h-3.5 w-3.5 mr-1.5" />
          {isPending && !draftRef.current ? t.sending : t.send_to_suppliers}
        </Button>
      </div>

    </div>
  )
}
