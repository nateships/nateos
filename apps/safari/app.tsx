'use client'
import { useState } from 'react'
import { bookmarks } from '@/app/safari/data'
import { BookmarksBar } from './Bookmarks'

export function SafariApp() {
  const [url, setUrl] = useState<string>(bookmarks[0]?.url ?? 'about:blank')
  const [navInput, setNavInput] = useState<string>(url)

  function go(target: string) {
    setUrl(target)
    setNavInput(target)
  }

  return (
    <div className="h-full w-full flex flex-col bg-zinc-900/95 text-white">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10">
        <span className="opacity-60 text-[12px]">←</span>
        <span className="opacity-60 text-[12px]">→</span>
        <input
          value={navInput}
          onChange={(e) => setNavInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') go(navInput)
          }}
          className="flex-1 bg-white/5 rounded-md px-3 py-1 text-[12px] outline-none focus:ring-1 focus:ring-blue-500"
        />
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-[11px] opacity-70 hover:underline"
        >
          Open ↗
        </a>
      </div>
      <BookmarksBar items={bookmarks} onPick={go} />
      <div className="flex-1 bg-white relative">
        <iframe
          key={url}
          src={url}
          title="Safari content"
          className="absolute inset-0 w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          referrerPolicy="no-referrer"
        />
        <div className="absolute bottom-3 right-3 text-[10px] bg-black/70 text-white/80 px-2 py-1 rounded">
          Some sites block embedding. Click "Open ↗" if blank.
        </div>
      </div>
    </div>
  )
}
