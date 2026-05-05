import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terminal',
  description:
    'Interactive command-line tour of NateOS. Type help to begin — open apps, read project content, follow links, all without leaving the keyboard.',
  alternates: { canonical: '/terminal' },
  openGraph: {
    title: 'Terminal — NateOS',
    description: 'Interactive command-line tour of NateOS.',
    url: 'https://nate.cx/terminal',
  },
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
