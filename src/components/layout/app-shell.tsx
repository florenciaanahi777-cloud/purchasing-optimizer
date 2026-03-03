'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, History, LayoutDashboard, Menu, X } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { UserMenu } from './user-menu'
import { LocaleProvider, useT } from '@/lib/locale-context'
import type { Locale } from '@/i18n'

interface AppShellProps {
  children: React.ReactNode
  user: { name: string | null; email: string; locale: Locale } | null
}

// Rendered inside LocaleProvider — can safely call useT()
function SidebarNav({ setSidebarOpen }: { setSidebarOpen: (v: boolean) => void }) {
  const pathname = usePathname()
  const t = useT()

  const nav = [
    { href: '/dashboard', label: t.nav_dashboard, icon: LayoutDashboard },
    { href: '/suppliers',  label: t.nav_suppliers,  icon: Users },
    { href: '/history',    label: t.nav_history,    icon: History },
  ]

  return (
    <nav className="flex-1 px-3 py-4 space-y-0.5">
      {nav.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={() => setSidebarOpen(false)}
          className={cn(
            'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors',
            pathname === href || pathname.startsWith(href + '/')
              ? 'bg-secondary text-foreground font-medium'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />
          {label}
        </Link>
      ))}
    </nav>
  )
}

// Rendered inside LocaleProvider — can safely call useT()
function TopHeader({
  user,
  sidebarOpen,
  setSidebarOpen,
}: {
  user: AppShellProps['user']
  sidebarOpen: boolean
  setSidebarOpen: (v: boolean) => void
}) {
  const t = useT()

  return (
    <header className="h-14 border-b border-border bg-card flex items-center px-6 shrink-0">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="mr-4 text-muted-foreground hover:text-foreground transition-colors md:hidden"
        aria-label={t.toggle_menu}
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      <div className="ml-auto">
        {user && <UserMenu name={user.name} email={user.email} />}
      </div>
    </header>
  )
}

export function AppShell({ children, user }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <LocaleProvider initial={user?.locale ?? 'en'}>
      <div className="min-h-screen flex">

        {/* ── Sidebar ───────────────────────────────────────────────────── */}
        <aside
          className={cn(
            'w-[240px] shrink-0 border-r border-border bg-card flex flex-col',
            'md:flex',
            sidebarOpen ? 'flex' : 'hidden',
            'fixed inset-y-0 left-0 z-40 md:static md:z-auto'
          )}
        >
          <div className="h-14 flex items-center px-4 border-b border-border shrink-0">
            <Link href="/dashboard" className="flex items-center">
              <Image src="/logo.svg" alt="PO" width={40} height={40} className="object-contain" priority />
            </Link>
          </div>

          <SidebarNav setSidebarOpen={setSidebarOpen} />
        </aside>

        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Right column: header + content ────────────────────────────── */}
        <div className="flex flex-col flex-1 min-w-0">
          <TopHeader user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

          <main className="flex-1 px-6 py-8 max-w-6xl w-full mx-auto">
            {children}
          </main>
        </div>

      </div>
    </LocaleProvider>
  )
}
