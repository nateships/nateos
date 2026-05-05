import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import './globals.css'
import { DesktopShell } from '@/components/os/DesktopShell'

export const metadata: Metadata = {
  title: "NateOS — Nate O'Farrell",
  description: 'Director of Infrastructure & Platform Engineering. Hands-on builder.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-black text-white overflow-hidden">
        <DesktopShell>{children}</DesktopShell>
        <Analytics />
      </body>
    </html>
  )
}
