import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'System Settings',
  description: 'Tune NateOS appearance — accent color, dock size, transparency, wallpaper.',
  alternates: { canonical: '/settings' },
}

export default function SettingsRoute() {
  return (
    <section className="sr-only" aria-label="System Settings">
      <h1>System Settings</h1>
      <p>Tune appearance — accent color, dock size, transparency, wallpaper.</p>
    </section>
  )
}
