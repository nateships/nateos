import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { DesktopShell } from '@/components/os/DesktopShell'
import { BASE_OG, BASE_TWITTER, SITE_NAME, SITE_URL } from '@/lib/seo'

const TITLE = "NateOS — Nate O'Farrell"
const DESCRIPTION =
  "Nate O'Farrell — Director of Infrastructure & Platform Engineering. Hands-on builder behind IDEA HPC, Sleepbar, AWS re:Invent talks, and this macOS-style portfolio."

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: '%s · NateOS',
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: "Nate O'Farrell", url: SITE_URL }],
  creator: "Nate O'Farrell",
  publisher: "Nate O'Farrell",
  keywords: [
    "Nate O'Farrell",
    'platform engineering',
    'infrastructure engineering',
    'HPC',
    'AWS',
    'Kubernetes',
    'Terraform',
    'IDEA HPC',
    'Commonwealth Fusion Systems',
    'CFS',
    'fusion',
    'portfolio',
    'macOS',
    'Next.js',
  ],
  alternates: { canonical: '/' },
  openGraph: { ...BASE_OG, title: TITLE, description: DESCRIPTION },
  twitter: { ...BASE_TWITTER, title: TITLE, description: DESCRIPTION },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  category: 'technology',
}

export const viewport: Viewport = {
  themeColor: '#000000',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
}

// Structured data — only static constants below, no user input. Safe for
// dangerouslySetInnerHTML; this is the standard Next.js JSON-LD pattern.
const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: "Nate O'Farrell",
  url: SITE_URL,
  email: 'mailto:nate@nateofarrell.com',
  jobTitle: 'Director of Infrastructure & Platform Engineering',
  worksFor: { '@type': 'Organization', name: 'Commonwealth Fusion Systems' },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Tewksbury',
    addressRegion: 'MA',
    addressCountry: 'US',
  },
  sameAs: ['https://github.com/cfsnate', 'https://www.linkedin.com/in/nateofarrell/'],
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  author: { '@type': 'Person', name: "Nate O'Farrell" },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-black text-white overflow-hidden">
        <DesktopShell>{children}</DesktopShell>
        <Analytics />
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD, no user input
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD, no user input
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </body>
    </html>
  )
}
