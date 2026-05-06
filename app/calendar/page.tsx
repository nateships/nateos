import type { Metadata } from 'next'
import { BASE_OG, BASE_TWITTER } from '@/lib/seo'

const TITLE = "Book a chat — Nate O'Farrell"
const DESCRIPTION = 'Schedule a 15-minute intro via Cal.com.'

export const metadata: Metadata = {
  title: 'Book a chat',
  description: 'Public availability via Cal.com — schedule a 15-minute intro chat with Nate.',
  alternates: { canonical: '/calendar' },
  openGraph: { ...BASE_OG, title: TITLE, description: DESCRIPTION, url: '/calendar' },
  twitter: { ...BASE_TWITTER, title: TITLE, description: DESCRIPTION },
}

export default function CalendarRoute() {
  return (
    <section className="sr-only" aria-label="Book a chat">
      <h1>Book an intro chat</h1>
      <p>15-minute intro via Cal.com.</p>
      <p>
        <a href="https://cal.com/nateofarrell/intro">cal.com/nateofarrell/intro</a>
      </p>
    </section>
  )
}
