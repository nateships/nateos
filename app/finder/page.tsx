import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Finder',
  description: 'Browse the NateOS virtual filesystem — resume, bio, downloads.',
  alternates: { canonical: '/finder' },
}

export default function FinderRoute() {
  return (
    <section className="sr-only" aria-label="Finder">
      <h1>Finder</h1>
      <p>Browse the NateOS virtual filesystem.</p>
    </section>
  )
}
