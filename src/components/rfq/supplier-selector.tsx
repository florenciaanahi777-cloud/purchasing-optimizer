'use client'

import { useState } from 'react'
import { Search, Plus, Check } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AddSupplierDialog } from '@/components/suppliers/add-supplier-dialog'
import { cn } from '@/lib/utils'
import type { Supplier } from '@/types'

interface SupplierSelectorProps {
  suppliers: Supplier[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
  onNewSupplier: (supplier: Supplier) => void
}

export function SupplierSelector({
  suppliers,
  selectedIds,
  onChange,
  onNewSupplier,
}: SupplierSelectorProps) {
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)

  const filtered = suppliers.filter(
    s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  )

  function toggle(id: string) {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter(x => x !== id)
        : [...selectedIds, id]
    )
  }

  function handleNewSupplier(supplier: Supplier) {
    onNewSupplier(supplier)
    onChange([...selectedIds, supplier.id])
  }

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search saved suppliers…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* List */}
      <div className="border border-border rounded-md divide-y divide-border max-h-56 overflow-y-auto">
        {suppliers.length === 0 && (
          <div className="px-4 py-6 text-sm text-center text-muted-foreground">
            No suppliers in directory yet.
          </div>
        )}

        {suppliers.length > 0 && filtered.length === 0 && (
          <div className="px-4 py-4 text-sm text-muted-foreground">
            No suppliers match &quot;{search}&quot;.
          </div>
        )}

        {filtered.map(supplier => {
          const selected = selectedIds.includes(supplier.id)
          return (
            <button
              key={supplier.id}
              type="button"
              onClick={() => toggle(supplier.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors',
                selected ? 'bg-primary/5' : 'hover:bg-muted/40'
              )}
            >
              {/* Checkbox indicator */}
              <span
                className={cn(
                  'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
                  selected
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'border-border bg-background'
                )}
              >
                {selected && <Check className="h-2.5 w-2.5" />}
              </span>

              <span className="flex-1 min-w-0">
                <span className="font-medium block truncate">{supplier.name}</span>
                <span className="text-muted-foreground text-xs truncate block">{supplier.email}</span>
              </span>
            </button>
          )
        })}
      </div>

      {/* Selected count + Add new */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {selectedIds.length === 0
            ? 'No suppliers selected'
            : `${selectedIds.length} supplier${selectedIds.length > 1 ? 's' : ''} selected`}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-xs h-7 gap-1"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="h-3 w-3" />
          Add new supplier
        </Button>
      </div>

      <AddSupplierDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={handleNewSupplier}
      />
    </div>
  )
}
