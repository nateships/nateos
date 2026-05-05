import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Send Nate a message. iMessage-style contact form delivered straight to nate@nateofarrell.com via Resend. Recruiter, engineer, or other — whichever fits.',
  alternates: { canonical: '/messages' },
  openGraph: {
    title: "Contact — Nate O'Farrell",
    description: 'Send Nate a message — delivered straight to inbox.',
    url: 'https://nate.cx/messages',
  },
}

export default function MessagesRoute() {
  return (
    <section className="sr-only" aria-label="Contact">
      <h1>Contact Nate O&apos;Farrell</h1>
      <p>Email: nate@nateofarrell.com · Phone: +1 (781) 888 2277</p>
      <p>Send a message via the iMessage-style form on this page.</p>
    </section>
  )
}
