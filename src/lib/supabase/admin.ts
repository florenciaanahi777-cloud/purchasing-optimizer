import { createClient } from '@supabase/supabase-js'

/**
 * Admin client using the service role key.
 * Bypasses Row Level Security — only use in server-side code
 * for operations that don't have an authenticated user context
 * (e.g. supplier quote submission via public token).
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
