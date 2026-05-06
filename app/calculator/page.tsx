import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Calculator',
  description: 'Standard four-function calculator with a hidden Konami-code easter egg.',
  alternates: { canonical: '/calculator' },
}

export default function CalculatorRoute() {
  return (
    <section className="sr-only" aria-label="Calculator">
      <h1>Calculator</h1>
      <p>Standard four-function calculator.</p>
    </section>
  )
}
