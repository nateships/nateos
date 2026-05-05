'use client'
import { useWindowStore } from '@/lib/os/window-store'
import { Window } from './Window'

export function WindowLayer() {
  const windows = useWindowStore((s) => s.windows)
  const sorted = [...windows].sort((a, b) => a.z - b.z)
  return (
    // pointer-events-none lets clicks fall through to desktop icons in the
    // gaps between windows. Each Window's root re-enables events on itself.
    <div className="absolute inset-0 pt-7 pointer-events-none z-20">
      {sorted.map((w) => (
        <Window key={w.id} windowId={w.id} />
      ))}
    </div>
  )
}
