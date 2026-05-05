'use client'
import { useState } from 'react'
import { bookmarks } from '@/app/safari/data'
import type { Bookmark } from '@/lib/content/schema'
import { PreviewPane } from './PreviewPane'

const CATEGORY_LABELS: Record<Bookmark['category'], string> = {
  code: 'Code',
  social: 'Social',
  media: 'Talks & Media',
  other: 'Elsewhere',
}

const CATEGORY_ORDER: Bookmark['category'][] = ['code', 'social', 'media', 'other']

function hostOf(url: string) {
  try {
    return new URL(url).host.replace(/^www\./, '')
  } catch {
    return url
  }
}

export function SafariApp() {
  const [activeUrl, setActiveUrl] = useState<string>(bookmarks[0]?.url ?? '')
  const active = bookmarks.find((b) => b.url === activeUrl) ?? bookmarks[0]
  const grouped = CATEGORY_ORDER.map((cat) => ({
    cat,
    items: bookmarks.filter((b) => b.category === cat),
  })).filter((g) => g.items.length > 0)

  return (
    <div className="h-full w-full flex bg-zinc-900/95 text-white">
      <aside className="w-64 border-r border-white/10 overflow-auto os-scroll p-3 flex flex-col gap-4">
        <header>
          <h1 className="text-[14px] font-semibold">Reading List</h1>
          <p className="text-[10px] opacity-60 mt-0.5">Click to preview</p>
        </header>
        {grouped.map(({ cat, items }) => (
          <section key={cat}>
            <h2 className="text-[10px] uppercase tracking-wider opacity-50 mb-1.5 px-1">
              {CATEGORY_LABELS[cat]}
            </h2>
            <ul className="flex flex-col gap-0.5">
              {items.map((b) => {
                const isActive = b.url === active?.url
                return (
                  <li key={b.url}>
                    <button
                      type="button"
                      onClick={() => setActiveUrl(b.url)}
                      className={`w-full text-left px-2 py-1.5 rounded-md transition-colors ${
                        isActive ? 'bg-blue-500/80 text-white' : 'hover:bg-white/5'
                      }`}
                    >
                      <div className="text-[12px] font-medium truncate">{b.label}</div>
                      <div className="text-[10px] opacity-60 truncate">{hostOf(b.url)}</div>
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </aside>
      <div className="flex-1 min-w-0">{active ? <PreviewPane bookmark={active} /> : null}</div>
    </div>
  )
}
