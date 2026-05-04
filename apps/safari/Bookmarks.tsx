'use client'
import type { Bookmark } from '@/lib/content/schema'

export function BookmarksBar({
  items,
  onPick,
}: {
  items: Bookmark[]
  onPick: (url: string) => void
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10 bg-zinc-900/95 overflow-x-auto os-scroll">
      {items.map((b) => (
        <button
          key={b.url}
          type="button"
          onClick={() => onPick(b.url)}
          className="flex-shrink-0 px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-[11px]"
        >
          {b.label}
        </button>
      ))}
    </div>
  )
}
