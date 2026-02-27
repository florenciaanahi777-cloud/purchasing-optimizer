'use client'

import { useRouter } from 'next/navigation'
import { Globe, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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

export function UserMenu({ name, email }: UserMenuProps) {
  const router = useRouter()
  const initials = getInitials(name, email)
  const displayName = name ?? email

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
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

        {/* User info header — non-clickable */}
        <DropdownMenuLabel className="font-normal">
          <p className="text-sm font-medium leading-none">{displayName}</p>
          {name && (
            <p className="text-xs text-muted-foreground mt-1 leading-none">{email}</p>
          )}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Change language — placeholder */}
        <DropdownMenuItem
          disabled
          className="text-muted-foreground cursor-not-allowed"
        >
          <Globe className="h-3.5 w-3.5 mr-2" />
          Change language
          <span className="ml-auto text-xs text-muted-foreground/60">Soon</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Sign out */}
        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5 mr-2" />
          Sign out
        </DropdownMenuItem>

      </DropdownMenuContent>
    </DropdownMenu>
  )
}
