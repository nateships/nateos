import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Links',
  description: 'Curated bookmarks and external profiles — GitHub, LinkedIn, Sleepbar, IDEA HPC.',
  alternates: { canonical: '/safari' },
  openGraph: {
    title: "Links — Nate O'Farrell",
    description: 'Curated bookmarks and external profiles.',
    url: 'https://nate.cx/safari',
  },
}

export default function SafariRoute() {
  return (
    <section className="sr-only" aria-label="Links">
      <h1>Links</h1>
      <p>Curated bookmarks and external profiles.</p>
    </section>
  )
}
