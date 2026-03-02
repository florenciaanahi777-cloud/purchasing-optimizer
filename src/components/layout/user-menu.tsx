'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Globe, LogOut, Check, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLocale, useT } from '@/lib/locale-context'
import { setLocale } from '@/actions/locale'
import type { Locale } from '@/i18n'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface UserMenuProps {
  name: string | null
  email: string
}

function getInitials(name: string | null, email: string): string {
  if (name) {
    const parts = name.trim().split(' ').filter(Boolean)
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    return parts[0][0].toUpperCase()
  }
  return email[0].toUpperCase()
}

const LANGUAGES: { value: Locale; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
]

export function UserMenu({ name, email }: UserMenuProps) {
  const router = useRouter()
  const { locale, setLocale: setLocaleCtx } = useLocale()
  const t = useT()
  const initials = getInitials(name, email)
  const displayName = name ?? email
  const [mounted, setMounted] = useState(false)
  const [langOpen, setLangOpen] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return null

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  async function handleLocaleChange(next: Locale) {
    if (next === locale) return
    setLocaleCtx(next)           // instant UI update
    await setLocale(next)        // persist to DB + cookie
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center justify-center h-7 w-7 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-85 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          title={displayName}
        >
          {initials}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">

        {/* User info header */}
        <DropdownMenuLabel className="font-normal">
          <p className="text-sm font-medium leading-none">{displayName}</p>
          {name && (
            <p className="text-xs text-muted-foreground mt-1 leading-none">{email}</p>
          )}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Language toggle */}
        <DropdownMenuItem
          onSelect={e => e.preventDefault()}
          onClick={() => setLangOpen(prev => !prev)}
          className="cursor-pointer"
        >
          <Globe className="h-3.5 w-3.5 mr-2" />
          {t.language}
          <ChevronDown
            className={cn(
              'h-3.5 w-3.5 ml-auto transition-transform duration-150',
              langOpen && 'rotate-180'
            )}
          />
        </DropdownMenuItem>

        {/* Inline language options */}
        {langOpen && LANGUAGES.map(lang => (
          <DropdownMenuItem
            key={lang.value}
            onSelect={e => e.preventDefault()}
            onClick={() => handleLocaleChange(lang.value)}
            className="pl-8 cursor-pointer"
          >
            <span className="flex-1">{lang.label}</span>
            {locale === lang.value && (
              <Check className="h-3.5 w-3.5 text-primary" />
            )}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        {/* Sign out */}
        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5 mr-2" />
          {t.sign_out}
        </DropdownMenuItem>

      </DropdownMenuContent>
    </DropdownMenu>
  )
}
