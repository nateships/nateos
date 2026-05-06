import type { Metadata } from 'next'
import { BASE_OG, BASE_TWITTER } from '@/lib/seo'

const TITLE = "Terminal — Nate O'Farrell"
const DESCRIPTION = 'Interactive command-line tour of NateOS.'

export const metadata: Metadata = {
  title: 'Terminal',
  description:
    'Interactive command-line tour of NateOS. Type help to begin — open apps, read project content, follow links, all without leaving the keyboard.',
  alternates: { canonical: '/terminal' },
  openGraph: { ...BASE_OG, title: TITLE, description: DESCRIPTION, url: '/terminal' },
  twitter: { ...BASE_TWITTER, title: TITLE, description: DESCRIPTION },
}

export default function TerminalRoute() {
  return (
    <section className="sr-only" aria-label="Terminal">
      <h1>Terminal</h1>
      <p>
        Interactive command-line tour of NateOS. Commands include help, apps, open, whoami, ls, cat,
        contact, resume, and a few hidden surprises.
      </p>
    </section>
  )
}
