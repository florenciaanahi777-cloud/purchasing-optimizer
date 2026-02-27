'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Supplier } from '@/types'

async function getContext() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!profile) throw new Error('User profile not found. Run seed.sql to set up your account.')
  return { supabase, orgId: profile.organization_id as string }
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getSuppliers(): Promise<Supplier[]> {
  const { supabase, orgId } = await getContext()

  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('organization_id', orgId)
    .order('name')

  if (error) throw error
  return data
}

export async function getSupplier(id: string): Promise<Supplier | null> {
  const { supabase, orgId } = await getContext()

  const { data } = await supabase
    .from('suppliers')
    .select('*')
    .eq('id', id)
    .eq('organization_id', orgId)
    .single()

  return data
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function createSupplier(input: {
  name: string
  email: string
  contact_name?: string
  notes?: string
}): Promise<{ data?: Supplier; error?: string }> {
  try {
    const { supabase, orgId } = await getContext()

    const { data, error } = await supabase
      .from('suppliers')
      .insert({ ...input, organization_id: orgId })
      .select()
      .single()

    if (error) return { error: 'Could not save supplier. Try again.' }

    revalidatePath('/suppliers')
    return { data }
  } catch {
    return { error: 'Could not save supplier. Try again.' }
  }
}

export async function updateSupplier(
  id: string,
  input: { name: string; email: string; contact_name?: string; notes?: string }
): Promise<{ error?: string }> {
  try {
    const { supabase, orgId } = await getContext()

    const { error } = await supabase
      .from('suppliers')
      .update(input)
      .eq('id', id)
      .eq('organization_id', orgId)

    if (error) return { error: 'Could not update supplier. Try again.' }

    revalidatePath('/suppliers')
    return {}
  } catch {
    return { error: 'Could not update supplier. Try again.' }
  }
}

export async function deleteSupplier(id: string): Promise<{ error?: string }> {
  try {
    const { supabase, orgId } = await getContext()

    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id)
      .eq('organization_id', orgId)

    if (error) return { error: 'Could not delete supplier. Try again.' }

    revalidatePath('/suppliers')
    return {}
  } catch {
    return { error: 'Could not delete supplier. Try again.' }
  }
}
