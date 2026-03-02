'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { updateSupplier } from '@/actions/suppliers'
import { useT } from '@/lib/locale-context'
import type { Supplier } from '@/types'

interface SupplierEditFormProps {
  supplier: Supplier
}

export function SupplierEditForm({ supplier }: SupplierEditFormProps) {
  const t = useT()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({
    name: supplier.name,
    email: supplier.email,
    contact_name: supplier.contact_name ?? '',
    notes: supplier.notes ?? '',
  })

  function set(field: keyof typeof form, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    startTransition(async () => {
      const result = await updateSupplier(supplier.id, {
        name: form.name,
        email: form.email,
        contact_name: form.contact_name || undefined,
        notes: form.notes || undefined,
      })

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success(t.supplier_updated)
      router.push('/suppliers')
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
      <div className="space-y-1.5">
        <Label htmlFor="name">
          {t.company_name} <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          value={form.name}
          onChange={e => set('name', e.target.value)}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">
          {t.email} <span className="text-destructive">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          value={form.email}
          onChange={e => set('email', e.target.value)}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contact_name">
          {t.contact_name}{' '}
          <span className="text-muted-foreground font-normal">({t.optional})</span>
        </Label>
        <Input
          id="contact_name"
          value={form.contact_name}
          onChange={e => set('contact_name', e.target.value)}
          placeholder="John Smith"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">
          {t.notes}{' '}
          <span className="text-muted-foreground font-normal">({t.optional})</span>
        </Label>
        <Textarea
          id="notes"
          value={form.notes}
          onChange={e => set('notes', e.target.value)}
          placeholder="e.g. Best for surgical supplies, prefers email contact"
          rows={4}
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? t.saving : t.save_changes}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/suppliers')}
          disabled={isPending}
        >
          {t.cancel}
        </Button>
      </div>
    </form>
  )
}
