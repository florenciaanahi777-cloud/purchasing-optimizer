import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/layout/app-shell'

export default async function BuyerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Fetch full name from users table if available
  const { data: profile } = user
    ? await supabase
        .from('users')
        .select('full_name')
        .eq('id', user.id)
        .single()
    : { data: null }

  const userInfo = user
    ? {
        name: profile?.full_name ?? null,
        email: user.email ?? '',
      }
    : null

  return <AppShell user={userInfo}>{children}</AppShell>
}
