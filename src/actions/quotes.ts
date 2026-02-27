'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import type { RFQItem } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

export type QuotePageData = {
  rfq: {
    id: string
    title: string
    description: string | null
    deadline: string
  }
  items: RFQItem[]
  supplier: {
    id: string
    name: string
    email: string
  }
  rfqSupplierId: string
  isExpired: boolean
  alreadySubmitted: boolean
  existingQuote: {
    notes: string | null
    submittedAt: string
    items: Array<{
      rfqItemId: string
      unitPrice: number
      totalPrice: number
      deliveryDays: number | null
      notes: string | null
    }>
  } | null
}

export type QuoteItemInput = {
  rfqItemId: string
  unitPrice: number
  totalPrice: number
  deliveryDays: number | null
  notes?: string
}

// ─── Get RFQ by public token ──────────────────────────────────────────────────

export async function getRFQByToken(token: string): Promise<QuotePageData | null> {
  const supabase = createAdminClient()

  // Look up the rfq_supplier record by token
  const { data: rfqSupplier } = await supabase
    .from('rfq_suppliers')
    .select(`
      id,
      status,
      rfq:rfqs (
        id, title, description, deadline, status
      ),
      supplier:suppliers (
        id, name, email
      )
    `)
    .eq('public_token', token)
    .single()

  if (!rfqSupplier) return null

  const rfq = rfqSupplier.rfq as unknown as {
    id: string; title: string; description: string | null
    deadline: string; status: string
  }
  const supplier = rfqSupplier.supplier as unknown as {
    id: string; name: string; email: string
  }

  if (!rfq || !supplier) return null

  // Fetch line items
  const { data: items } = await supabase
    .from('rfq_items')
    .select('*')
    .eq('rfq_id', rfq.id)
    .order('sort_order')

  // Check if already submitted
  const alreadySubmitted = rfqSupplier.status === 'submitted'

  // If submitted, fetch existing quote data for read-only display
  let existingQuote: QuotePageData['existingQuote'] = null
  if (alreadySubmitted) {
    const { data: quote } = await supabase
      .from('quotes')
      .select('id, notes, submitted_at')
      .eq('rfq_supplier_id', rfqSupplier.id)
      .single()

    if (quote) {
      const { data: quoteItems } = await supabase
        .from('quote_items')
        .select('*')
        .eq('quote_id', quote.id)

      existingQuote = {
        notes: quote.notes,
        submittedAt: quote.submitted_at,
        items: (quoteItems ?? []).map(qi => ({
          rfqItemId: qi.rfq_item_id,
          unitPrice: Number(qi.unit_price),
          totalPrice: Number(qi.total_price),
          deliveryDays: qi.delivery_days,
          notes: qi.notes,
        })),
      }
    }
  }

  // Deadline: date string YYYY-MM-DD; expired if today is past it
  const today = new Date().toISOString().split('T')[0]
  const isExpired = rfq.deadline < today

  return {
    rfq: {
      id: rfq.id,
      title: rfq.title,
      description: rfq.description,
      deadline: rfq.deadline,
    },
    items: items ?? [],
    supplier,
    rfqSupplierId: rfqSupplier.id,
    isExpired,
    alreadySubmitted,
    existingQuote,
  }
}

// ─── Submit quote ─────────────────────────────────────────────────────────────

export async function submitQuote(
  token: string,
  quoteItems: QuoteItemInput[],
  generalNotes: string
): Promise<{ error?: string }> {
  try {
    const supabase = createAdminClient()

    // Re-validate token
    const { data: rfqSupplier } = await supabase
      .from('rfq_suppliers')
      .select('id, rfq_id, supplier_id, status, rfq:rfqs(deadline, status)')
      .eq('public_token', token)
      .single()

    if (!rfqSupplier) return { error: 'Invalid or expired link.' }
    if (rfqSupplier.status === 'submitted') return { error: 'You have already submitted a quote.' }

    const rfq = rfqSupplier.rfq as unknown as { deadline: string; status: string }
    const today = new Date().toISOString().split('T')[0]
    if (rfq.deadline < today) return { error: 'This RFQ has closed. Submissions are no longer accepted.' }

    // Insert quote
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .insert({
        rfq_id: rfqSupplier.rfq_id,
        supplier_id: rfqSupplier.supplier_id,
        rfq_supplier_id: rfqSupplier.id,
        notes: generalNotes.trim() || null,
      })
      .select('id')
      .single()

    if (quoteError || !quote) return { error: 'Could not save your quote. Please try again.' }

    // Insert quote items
    const { error: itemsError } = await supabase
      .from('quote_items')
      .insert(
        quoteItems.map(qi => ({
          quote_id: quote.id,
          rfq_item_id: qi.rfqItemId,
          unit_price: qi.unitPrice,
          total_price: qi.totalPrice,
          delivery_days: qi.deliveryDays,
          notes: qi.notes?.trim() || null,
        }))
      )

    if (itemsError) {
      await supabase.from('quotes').delete().eq('id', quote.id)
      return { error: 'Could not save line item prices. Please try again.' }
    }

    // Mark supplier as submitted
    await supabase
      .from('rfq_suppliers')
      .update({ status: 'submitted' })
      .eq('id', rfqSupplier.id)

    // Advance RFQ to 'comparing' if it was 'open'
    if (rfq.status === 'open') {
      await supabase
        .from('rfqs')
        .update({ status: 'comparing' })
        .eq('id', rfqSupplier.rfq_id)
    }

    revalidatePath(`/rfq/${rfqSupplier.rfq_id}`)
    return {}
  } catch {
    return { error: 'Something went wrong. Please try again.' }
  }
}
