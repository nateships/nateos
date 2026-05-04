import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: "NateOS — Nate O'Farrell",
  description: 'Director of Infrastructure & Platform Engineering. Hands-on builder.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-black text-white overflow-hidden">
        {children}
      </body>
    </html>
  )
}
