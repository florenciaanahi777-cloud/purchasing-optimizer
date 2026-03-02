export const dynamic = 'force-dynamic'

import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/layout/app-shell'
import type { Locale } from '@/i18n'

export default async function BuyerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = user
    ? await supabase
        .from('users')
        .select('full_name, locale')
        .eq('id', user.id)
        .single()
    : { data: null }

  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get('locale')?.value as Locale | undefined

  const locale: Locale = (profile?.locale as Locale | undefined) ?? cookieLocale ?? 'en'

  const userInfo = user
    ? {
        name: profile?.full_name ?? null,
        email: user.email ?? '',
        locale,
      }
    : null

  console.log('SERVER LOCALE', {
    profileLocale: profile?.locale,
    cookieLocale,
  })

  return <AppShell user={userInfo}>{children}</AppShell>
}
