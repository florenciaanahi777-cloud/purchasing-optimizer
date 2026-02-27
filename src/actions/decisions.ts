'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

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

  return {
    supabase,
    userId: user.id,
    orgId: profile.organization_id as string,
    buyerName: profile.full_name,
  }
}

// ─── Record decision ──────────────────────────────────────────────────────────

export async function recordDecision(input: {
  rfqId: string
  winningSupplierId: string
  winningQuoteId: string
  reason: string
  aiRecommendation?: string
}): Promise<{ error?: string }> {
  try {
    const { supabase, userId, orgId } = await getContext()

    // Verify RFQ belongs to this org
    const { data: rfq } = await supabase
      .from('rfqs')
      .select('id, status')
      .eq('id', input.rfqId)
      .eq('organization_id', orgId)
      .single()

    if (!rfq) return { error: 'RFQ not found.' }
    if (rfq.status === 'decided') return { error: 'A decision has already been recorded.' }

    const { error: decisionError } = await supabase
      .from('decisions')
      .insert({
        rfq_id: input.rfqId,
        winning_supplier_id: input.winningSupplierId,
        winning_quote_id: input.winningQuoteId,
        reason: input.reason.trim(),
        ai_recommendation: input.aiRecommendation ?? null,
        decided_by: userId,
      })

    if (decisionError) return { error: 'Could not save decision. Try again.' }

    // Mark RFQ as decided
    await supabase
      .from('rfqs')
      .update({ status: 'decided' })
      .eq('id', input.rfqId)

    revalidatePath(`/rfq/${input.rfqId}`)
    revalidatePath('/dashboard')
    revalidatePath('/history')

    return {}
  } catch {
    return { error: 'Something went wrong. Try again.' }
  }
}

// ─── Get decided RFQs for history ────────────────────────────────────────────

export type HistoryItem = {
  rfqId: string
  rfqTitle: string
  decidedAt: string
  decidedByName: string | null
  winningSupplierName: string
  itemCount: number
}

export async function getDecidedRFQs(): Promise<HistoryItem[]> {
  const { supabase, orgId } = await getContext()

  const { data, error } = await supabase
    .from('decisions')
    .select(`
      decided_at,
      rfq:rfqs!decisions_rfq_id_fkey(
        id, title, organization_id,
        rfq_items(id)
      ),
      winning_supplier:suppliers!decisions_winning_supplier_id_fkey(name),
      decided_by_user:users!decisions_decided_by_fkey(full_name)
    `)
    .order('decided_at', { ascending: false })

  if (error) throw error

  return (data ?? [])
    .map(row => {
      const rfq = row.rfq as unknown as {
        id: string; title: string; organization_id: string
        rfq_items: Array<{ id: string }>
      } | null
      const supplier = row.winning_supplier as unknown as { name: string } | null
      const decidedByUser = row.decided_by_user as unknown as { full_name: string | null } | null

      if (!rfq || rfq.organization_id !== orgId) return null
      if (!supplier) return null

      return {
        rfqId: rfq.id,
        rfqTitle: rfq.title,
        decidedAt: row.decided_at,
        decidedByName: decidedByUser?.full_name ?? null,
        winningSupplierName: supplier.name,
        itemCount: rfq.rfq_items?.length ?? 0,
      }
    })
    .filter((x): x is HistoryItem => x !== null)
}
