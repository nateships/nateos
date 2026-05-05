'use client'
import { bookmarks } from '@/app/safari/data'
import type { Bookmark } from '@/lib/content/schema'
import { BookmarkTile } from './BookmarkTile'

const CATEGORY_LABELS: Record<Bookmark['category'], string> = {
  code: 'Code',
  social: 'Social',
  media: 'Talks & Media',
  other: 'Elsewhere',
}

const CATEGORY_ORDER: Bookmark['category'][] = ['code', 'social', 'media', 'other']

export function SafariApp() {
  const grouped = CATEGORY_ORDER.map((cat) => ({
    cat,
    items: bookmarks.filter((b) => b.category === cat),
  })).filter((g) => g.items.length > 0)

  return (
    <div className="h-full w-full overflow-auto os-scroll bg-zinc-900/95 text-white">
      <div className="max-w-5xl mx-auto px-7 py-7 flex flex-col gap-7">
        <header>
          <h1 className="text-xl font-semibold tracking-tight">Favorites</h1>
          <p className="text-[12px] opacity-60 mt-1">
            Curated links — click any tile to open in a new tab.
          </p>
        </header>
        {grouped.map(({ cat, items }) => (
          <section key={cat}>
            <h2 className="text-[10px] uppercase tracking-wider opacity-50 mb-3">
              {CATEGORY_LABELS[cat]}
            </h2>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3">
              {items.map((b) => (
                <BookmarkTile key={b.url} bookmark={b} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
