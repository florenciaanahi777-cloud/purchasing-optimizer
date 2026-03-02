'use client'

import { useState, useTransition, useEffect } from 'react'
import { toast } from 'sonner'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createSupplier } from '@/actions/suppliers'
import { useT } from '@/lib/locale-context'
import type { Supplier } from '@/types'

const EMPTY = { name: '', email: '', contact_name: '', notes: '' }

interface AddSupplierDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: (supplier: Supplier) => void
}

export function AddSupplierDialog({ open, onOpenChange, onCreated }: AddSupplierDialogProps) {
  const t = useT()
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState(EMPTY)

  useEffect(() => {
    if (!open) setForm(EMPTY)
  }, [open])

  function set(field: keyof typeof EMPTY, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    startTransition(async () => {
      const result = await createSupplier({
        name: form.name,
        email: form.email,
        contact_name: form.contact_name || undefined,
        notes: form.notes || undefined,
      })

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success(`${form.name} ${t.supplier_added_suffix}`)
      if (result.data && onCreated) onCreated(result.data)
      onOpenChange(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.add_supplier}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="s-name">
              {t.company_name} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="s-name"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="Medline Supply Co."
              required
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="s-email">
              {t.email} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="s-email"
              type="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder="contact@supplier.com"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="s-contact">
              {t.contact_name}{' '}
              <span className="text-muted-foreground font-normal">({t.optional})</span>
            </Label>
            <Input
              id="s-contact"
              value={form.contact_name}
              onChange={e => set('contact_name', e.target.value)}
              placeholder="John Smith"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="s-notes">
              {t.notes}{' '}
              <span className="text-muted-foreground font-normal">({t.optional})</span>
            </Label>
            <Textarea
              id="s-notes"
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="e.g. Best for surgical supplies, prefers email contact"
              rows={3}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              {t.cancel}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? t.saving : t.add_supplier}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
