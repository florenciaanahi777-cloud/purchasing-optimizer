import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'PO — Purchase Optimizer',
  description: 'Centralize, compare and decide smarter.',
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Toaster
          position="top-right"
          theme="dark"
          toastOptions={{
            classNames: {
              success: 'bg-[oklch(0.18_0.05_145)] text-[oklch(0.72_0.17_145)] border border-[oklch(0.72_0.17_145)]/30',
              error:   'bg-[oklch(0.18_0.05_27)] text-[oklch(0.70_0.18_27)] border border-[oklch(0.70_0.18_27)]/30',
              info:    'bg-[oklch(0.18_0.05_240)] text-[oklch(0.75_0.15_240)] border border-[oklch(0.75_0.15_240)]/30',
            },
          }}
        />
      </body>
    </html>
  )
}
