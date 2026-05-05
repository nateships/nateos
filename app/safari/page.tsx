import type { Metadata } from 'next'
import { BASE_OG, BASE_TWITTER } from '@/lib/seo'

const TITLE = "Links — Nate O'Farrell"
const DESCRIPTION = 'Curated bookmarks and external profiles.'

export const metadata: Metadata = {
  title: 'Links',
  description: 'Curated bookmarks and external profiles — GitHub, LinkedIn, Sleepbar, IDEA HPC.',
  alternates: { canonical: '/safari' },
  openGraph: { ...BASE_OG, title: TITLE, description: DESCRIPTION, url: '/safari' },
  twitter: { ...BASE_TWITTER, title: TITLE, description: DESCRIPTION },
}

export default function SafariRoute() {
  return (
    <section className="sr-only" aria-label="Links">
      <h1>Links</h1>
      <p>Curated bookmarks and external profiles.</p>
    </section>
  )
}
