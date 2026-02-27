'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { sendQuoteInvitation } from '@/lib/email'
import type { RFQDetail, RFQSummary, ComparisonData, SupplierColumn } from '@/types'

// ─── Context helper ───────────────────────────────────────────────────────────

async function getContext() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('users')
    .select('organization_id, full_name')
    .eq('id', user.id)
    .single()

  if (!profile) throw new Error('User profile not found.')

  const { data: org } = await supabase
    .from('organizations')
    .select('name')
    .eq('id', profile.organization_id)
    .single()

  return {
    supabase,
    userId: user.id,
    orgId: profile.organization_id as string,
    buyerName: profile.full_name ?? user.email ?? 'The buyer',
    orgName: org?.name ?? 'Hospital',
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CreateRFQInput {
  title: string
  description?: string
  deadline: string
  items: Array<{
    sku?: string
    description: string
    unit: string
    quantity: number
    sort_order: number
  }>
  supplierIds: string[]
}

export interface CreateRFQResult {
  data?: { id: string; emailsFailed: string[] }
  error?: string
}

// ─── Create RFQ ───────────────────────────────────────────────────────────────

export async function createRFQ(
  input: CreateRFQInput,
  asDraft = false
): Promise<CreateRFQResult> {
  try {
    const { supabase, userId, orgId, buyerName, orgName } = await getContext()
    const status = asDraft ? 'draft' : 'open'

    const { data: rfq, error: rfqError } = await supabase
      .from('rfqs')
      .insert({
        organization_id: orgId,
        created_by: userId,
        title: input.title,
        description: input.description ?? null,
        deadline: input.deadline,
        status,
      })
      .select('id')
      .single()

    if (rfqError || !rfq) return { error: 'Could not create RFQ. Try again.' }

    const { error: itemsError } = await supabase
      .from('rfq_items')
      .insert(
        input.items.map(item => ({
          rfq_id: rfq.id,
          sku: item.sku ?? null,
          description: item.description,
          unit: item.unit,
          quantity: item.quantity,
          sort_order: item.sort_order,
        }))
      )

    if (itemsError) {
      await supabase.from('rfqs').delete().eq('id', rfq.id)
      return { error: 'Could not save line items. Try again.' }
    }

    const emailsFailed: string[] = []

    if (input.supplierIds.length > 0) {
      const { data: rfqSuppliers, error: supplierError } = await supabase
        .from('rfq_suppliers')
        .insert(
          input.supplierIds.map(supplierId => ({
            rfq_id: rfq.id,
            supplier_id: supplierId,
          }))
        )
        .select('public_token, supplier:suppliers(name, email)')

      if (supplierError) {
        await supabase.from('rfqs').delete().eq('id', rfq.id)
        return { error: 'Could not add suppliers. Try again.' }
      }

      if (!asDraft && rfqSuppliers) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

        for (const rs of rfqSuppliers) {
          const supplier = rs.supplier as unknown as { name: string; email: string } | null
          if (!supplier) continue

          const result = await sendQuoteInvitation({
            to: supplier.email,
            supplierName: supplier.name,
            rfqTitle: input.title,
            deadline: input.deadline,
            quoteUrl: `${appUrl}/quote/${rs.public_token}`,
            buyerName,
            organizationName: orgName,
          })

          if (result.error && result.error !== 'email_not_configured') {
            emailsFailed.push(supplier.name)
          }
        }
      }
    }

    revalidatePath('/dashboard')
    revalidatePath(`/rfq/${rfq.id}`)

    return { data: { id: rfq.id, emailsFailed } }
  } catch {
    return { error: 'Something went wrong. Try again.' }
  }
}

// ─── Get RFQ detail (buyer view) ─────────────────────────────────────────────

export async function getRFQDetail(id: string): Promise<RFQDetail | null> {
  const { supabase, orgId } = await getContext()

  const { data: rfq } = await supabase
    .from('rfqs')
    .select('*')
    .eq('id', id)
    .eq('organization_id', orgId)
    .single()

  if (!rfq) return null

  const [{ data: items }, { data: rfqSuppliers }, { data: decisions }] = await Promise.all([
    supabase
      .from('rfq_items')
      .select('*')
      .eq('rfq_id', id)
      .order('sort_order'),
    supabase
      .from('rfq_suppliers')
      .select('id, supplier_id, public_token, status, supplier:suppliers(id, name, email)')
      .eq('rfq_id', id)
      .order('invited_at'),
    supabase
      .from('decisions')
      .select('id, winning_supplier_id, reason, ai_recommendation, decided_at, winning_supplier:suppliers(id, name, email)')
      .eq('rfq_id', id),
  ])

  const suppliers = (rfqSuppliers ?? []) as unknown as RFQDetail['rfq_suppliers']
  const submitted_count = suppliers.filter(s => s.status === 'submitted').length
  const decision = (decisions?.[0] ?? null) as unknown as RFQDetail['decision']

  return {
    ...rfq,
    rfq_items: items ?? [],
    rfq_suppliers: suppliers,
    submitted_count,
    decision,
  }
}

// ─── Get comparison data ──────────────────────────────────────────────────────

export async function getComparisonData(rfqId: string): Promise<ComparisonData | null> {
  const { supabase, orgId } = await getContext()

  const { data: rfq } = await supabase
    .from('rfqs')
    .select('*')
    .eq('id', rfqId)
    .eq('organization_id', orgId)
    .single()

  if (!rfq) return null

  const [{ data: items }, { data: rfqSuppliers }, { data: quotes }] = await Promise.all([
    supabase
      .from('rfq_items')
      .select('*')
      .eq('rfq_id', rfqId)
      .order('sort_order'),
    supabase
      .from('rfq_suppliers')
      .select('id, supplier_id, public_token, status, supplier:suppliers(id, name, email)')
      .eq('rfq_id', rfqId)
      .order('invited_at'),
    supabase
      .from('quotes')
      .select('id, supplier_id, rfq_supplier_id, notes, submitted_at, quote_items(*)')
      .eq('rfq_id', rfqId),
  ])

  // Build a map: rfqSupplierId → quote
  const quoteByRfqSupplierId = new Map(
    (quotes ?? []).map(q => [q.rfq_supplier_id, q])
  )

  const columns: SupplierColumn[] = (rfqSuppliers ?? []).map(rs => {
    const s = rs as unknown as {
      id: string; supplier_id: string; public_token: string; status: string
      supplier: { id: string; name: string; email: string }
    }
    const quote = quoteByRfqSupplierId.get(s.id)

    if (!quote) {
      return {
        rfqSupplierId: s.id,
        supplierId: s.supplier_id,
        supplierName: s.supplier.name,
        publicToken: s.public_token,
        submissionStatus: s.status as 'invited' | 'submitted',
        quote: null,
      }
    }

    const itemPrices: SupplierColumn['quote'] extends null ? never : NonNullable<SupplierColumn['quote']>['itemPrices'] = {}
    let totalValue = 0

    for (const qi of (quote.quote_items as unknown as Array<{
      rfq_item_id: string; unit_price: number; total_price: number
      delivery_days: number | null; notes: string | null
    }>) ?? []) {
      itemPrices[qi.rfq_item_id] = {
        unitPrice: Number(qi.unit_price),
        totalPrice: Number(qi.total_price),
        deliveryDays: qi.delivery_days,
        notes: qi.notes,
      }
      totalValue += Number(qi.total_price)
    }

    return {
      rfqSupplierId: s.id,
      supplierId: s.supplier_id,
      supplierName: s.supplier.name,
      publicToken: s.public_token,
      submissionStatus: s.status as 'invited' | 'submitted',
      quote: {
        id: quote.id,
        totalValue,
        notes: quote.notes,
        submittedAt: quote.submitted_at,
        itemPrices,
      },
    }
  })

  return { rfq, items: items ?? [], columns }
}

// ─── Get all RFQs with counts (dashboard) ────────────────────────────────────

export async function getRFQsWithCounts(): Promise<RFQSummary[]> {
  const { supabase, orgId } = await getContext()

  const { data, error } = await supabase
    .from('rfqs')
    .select(`
      *,
      rfq_suppliers(supplier_id, status),
      decisions(winning_supplier:suppliers(name))
    `)
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data ?? []).map(rfq => {
    const suppliers = rfq.rfq_suppliers as Array<{ supplier_id: string; status: string }>
    const decisions = rfq.decisions as Array<{ winning_supplier: { name: string } | null }>

    return {
      id: rfq.id,
      organization_id: rfq.organization_id,
      created_by: rfq.created_by,
      title: rfq.title,
      description: rfq.description,
      deadline: rfq.deadline,
      status: rfq.status,
      created_at: rfq.created_at,
      updated_at: rfq.updated_at,
      total_suppliers: suppliers?.length ?? 0,
      submitted_count: suppliers?.filter(s => s.status === 'submitted').length ?? 0,
      winning_supplier_name: decisions?.[0]?.winning_supplier?.name ?? null,
    }
  })
}
