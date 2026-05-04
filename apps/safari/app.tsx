'use client'
import { bookmarks } from '@/app/safari/data'
import type { Bookmark } from '@/lib/content/schema'

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
  const grouped = CATEGORY_ORDER.map((cat) => ({
    cat,
    items: bookmarks.filter((b) => b.category === cat),
  })).filter((g) => g.items.length > 0)

  return (
    <div className="h-full w-full overflow-auto os-scroll bg-zinc-900/95 text-white">
      <div className="max-w-2xl mx-auto px-7 py-7 flex flex-col gap-6">
        <header>
          <h1 className="text-xl font-semibold tracking-tight">Reading List</h1>
          <p className="text-[12px] opacity-60 mt-1">Curated links — click to open in a new tab.</p>
        </header>

        {grouped.map(({ cat, items }) => (
          <section key={cat}>
            <h2 className="text-[10px] uppercase tracking-wider opacity-50 mb-2">
              {CATEGORY_LABELS[cat]}
            </h2>
            <ul className="flex flex-col gap-1.5">
              {items.map((b) => (
                <li key={b.url}>
                  <a
                    href={b.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
                  >
                    <span className="flex-1 min-w-0">
                      <span className="block text-[13px] font-medium truncate">{b.label}</span>
                      <span className="block text-[11px] opacity-60 truncate">{hostOf(b.url)}</span>
                    </span>
                    <span className="text-[12px] opacity-40 group-hover:opacity-100 transition-opacity">
                      ↗
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
