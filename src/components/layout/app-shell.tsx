'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ClipboardList, Users, History, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'
import { UserMenu } from './user-menu'

const nav = [
  { href: '/dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/suppliers',  label: 'Suppliers',   icon: Users },
  { href: '/history',    label: 'History',     icon: History },
]

interface AppShellProps {
  children: React.ReactNode
  user: { name: string | null; email: string } | null
}

export function AppShell({ children, user }: AppShellProps) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top nav */}
      <header className="h-14 border-b border-border bg-card flex items-center px-6 gap-8 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <ClipboardList className="h-4 w-4 text-primary" />
          PDO
        </Link>
        <nav className="flex items-center gap-1">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors',
                pathname === href || pathname.startsWith(href + '/')
                  ? 'bg-secondary text-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Push user menu to far right */}
        <div className="ml-auto">
          {user && <UserMenu name={user.name} email={user.email} />}
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 px-6 py-8 max-w-6xl w-full mx-auto">
        {children}
      </main>
    </div>
  )
}
