'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { Copy, Check, Clock, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/shared/status-badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { RFQDetail } from '@/types'

function CopyLinkButton({ token }: { token: string }) {
  const [copied, setCopied] = useState(false)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const url = `${appUrl}/quote/${token}`

  async function handleCopy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    toast.success('Link copied to clipboard.')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      title="Copy quote link"
    >
      {copied
        ? <Check className="h-3 w-3 text-green-600" />
        : <Copy className="h-3 w-3" />
      }
      {copied ? 'Copied' : 'Copy link'}
    </button>
  )
}

interface RFQDetailViewProps {
  rfq: RFQDetail
}

export function RFQDetailView({ rfq }: RFQDetailViewProps) {
  const deadline = format(new Date(rfq.deadline + 'T12:00:00'), 'MMM d, yyyy')
  const isDecided = rfq.status === 'decided'
  const canCompare = rfq.status === 'comparing' || rfq.status === 'decided'
  const isDraft = rfq.status === 'draft'
  const isPastDeadline = rfq.deadline < new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-8 max-w-3xl">

      {/* ── RFQ meta ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <StatusBadge status={rfq.status} />
            {isPastDeadline && !isDecided && (
              <Badge variant="outline" className="text-xs bg-red-50 text-red-600 border-red-200">
                Past deadline
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>Deadline: {deadline}</span>
          </div>
          {rfq.description && (
            <p className="text-sm text-muted-foreground">{rfq.description}</p>
          )}
        </div>

        {/* CTA */}
        {!isDraft && (
          <Button asChild size="sm" disabled={!canCompare} className="shrink-0">
            <Link href={`/rfq/${rfq.id}/compare`}>
              {isDecided ? 'View comparison' : 'Compare quotes'}
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </Button>
        )}
        {isDraft && (
          <Button asChild variant="outline" size="sm" className="shrink-0">
            <Link href={`/rfq/new`}>Edit draft</Link>
          </Button>
        )}
      </div>

      {/* ── Decision banner ───────────────────────────────────────────────── */}
      {isDecided && rfq.decision && (
        <div className="border border-green-200 bg-green-50 rounded-md px-4 py-3 space-y-1">
          <p className="text-sm font-medium text-green-800">
            Decision recorded — {format(new Date(rfq.decision.decided_at), 'MMM d, yyyy')}
          </p>
          <p className="text-sm text-green-700">
            Winner: <span className="font-semibold">{rfq.decision.winning_supplier.name}</span>
          </p>
          <p className="text-sm text-green-600 italic">"{rfq.decision.reason}"</p>
          <div className="pt-1">
            <Link
              href={`/rfq/${rfq.id}/compare`}
              className="text-xs text-green-700 hover:underline"
            >
              View full decision →
            </Link>
          </div>
        </div>
      )}

      <Separator />

      {/* ── Line items ───────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold">
          Line items <span className="text-muted-foreground font-normal">({rfq.rfq_items.length})</span>
        </h2>
        <div className="border border-border rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Description</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground hidden sm:table-cell">SKU</th>
                <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground">Unit</th>
                <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground">Qty</th>
              </tr>
            </thead>
            <tbody>
              {rfq.rfq_items.map(item => (
                <tr key={item.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-2.5 font-medium">{item.description}</td>
                  <td className="px-4 py-2.5 text-muted-foreground hidden sm:table-cell">{item.sku ?? '—'}</td>
                  <td className="px-4 py-2.5 text-right text-muted-foreground">{item.unit}</td>
                  <td className="px-4 py-2.5 text-right">{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Separator />

      {/* ── Suppliers ────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold">
          Suppliers{' '}
          <span className="text-muted-foreground font-normal">
            ({rfq.submitted_count}/{rfq.rfq_suppliers.length} responded)
          </span>
        </h2>

        {rfq.rfq_suppliers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No suppliers were added to this RFQ.</p>
        ) : (
          <div className="border border-border rounded-md divide-y divide-border">
            {rfq.rfq_suppliers.map(rs => (
              <div key={rs.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{rs.supplier.name}</p>
                  <p className="text-xs text-muted-foreground">{rs.supplier.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  {rfq.status === 'open' && rs.status === 'invited' && (
                    <CopyLinkButton token={rs.public_token} />
                  )}
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs',
                      rs.status === 'submitted'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {rs.status === 'submitted' ? 'Submitted' : 'Awaiting'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
