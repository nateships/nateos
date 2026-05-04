'use client'
import { useWindowStore } from '@/lib/os/window-store'
import { Window } from './Window'

export function WindowLayer() {
  const windows = useWindowStore((s) => s.windows)
  const sorted = [...windows].sort((a, b) => a.z - b.z)
  return (
    <div className="absolute inset-0 pt-7 pointer-events-none">
      <div className="relative w-full h-full pointer-events-auto">
        {sorted.map((w) => (
          <Window key={w.id} windowId={w.id} />
        ))}
      </div>
    </div>
  )
}
