'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Search, Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AddSupplierDialog } from './add-supplier-dialog'
import { deleteSupplier } from '@/actions/suppliers'
import { useT } from '@/lib/locale-context'
import type { Supplier } from '@/types'

interface SupplierListProps {
  suppliers: Supplier[]
}

export function SupplierList({ suppliers }: SupplierListProps) {
  const t = useT()
  const [search, setSearch] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  )

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteSupplier(id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(t.supplier_deleted)
        setConfirmDeleteId(null)
      }
    })
  }

  // ─── Empty state ───────────────────────────────────────────────────────────
  if (suppliers.length === 0) {
    return (
      <>
        <div className="text-center py-20 space-y-3">
          <p className="text-sm font-medium">{t.suppliers_empty_title}</p>
          <p className="text-sm text-muted-foreground">{t.suppliers_empty_desc}</p>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            {t.add_supplier}
          </Button>
        </div>
        <AddSupplierDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      </>
    )
  }

  // ─── Default state ─────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder={t.search_suppliers}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          {t.add_supplier}
        </Button>
      </div>

      <AddSupplierDialog open={dialogOpen} onOpenChange={setDialogOpen} />

      {/* No search results */}
      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-sm text-muted-foreground">
            {t.suppliers_no_results} &quot;{search}&quot;.
          </p>
        </div>
      )}

      {/* Table */}
      {filtered.length > 0 && (
        <div className="border border-border rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">
                  {t.col_company}
                </th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">
                  {t.col_email}
                </th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground hidden md:table-cell">
                  {t.col_contact}
                </th>
                <th className="px-4 py-2.5 w-[140px]" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(supplier => (
                <tr
                  key={supplier.id}
                  className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 py-3 font-medium">{supplier.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{supplier.email}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                    {supplier.contact_name ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    {confirmDeleteId === supplier.id ? (
                      <div className="flex items-center gap-2 text-xs justify-end">
                        <span className="text-muted-foreground">{t.delete_q}</span>
                        <button
                          onClick={() => handleDelete(supplier.id)}
                          disabled={isPending}
                          className="text-destructive font-medium hover:underline disabled:opacity-50"
                        >
                          {t.confirm}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {t.cancel}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 justify-end">
                        <Button variant="ghost" size="sm" asChild className="h-7 w-7 p-0">
                          <Link href={`/suppliers/${supplier.id}`} title="Edit supplier">
                            <Pencil className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => setConfirmDeleteId(supplier.id)}
                          title="Delete supplier"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
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
