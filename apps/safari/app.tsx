'use client'
import { bookmarks } from '@/app/safari/data'
import { BookmarkTile } from './BookmarkTile'

export function SafariApp() {
  return (
    <div className="os-glass-app h-full w-full overflow-auto os-scroll text-white">
      <div className="max-w-4xl mx-auto px-7 py-7 flex flex-col gap-5">
        <header>
          <h1 className="text-xl font-semibold tracking-tight">Favorites</h1>
          <p className="text-[12px] opacity-60 mt-1">
            Curated links — click any tile to open in a new tab.
          </p>
        </header>
        <div className="grid grid-cols-3 gap-3">
          {bookmarks.map((b) => (
            <BookmarkTile key={b.url} bookmark={b} />
          ))}
        </div>
      </div>
    </div>
  )
}
