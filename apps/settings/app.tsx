'use client'
import { useState } from 'react'
import { AppearancePane } from './AppearancePane'
import { WallpaperPane } from './WallpaperPane'

type Pane = 'appearance' | 'wallpaper'

const ITEMS: { id: Pane; label: string }[] = [
  { id: 'appearance', label: 'Appearance' },
  { id: 'wallpaper', label: 'Wallpaper' },
]

export function SettingsApp() {
  const [pane, setPane] = useState<Pane>('appearance')
  return (
    <div className="h-full w-full flex bg-zinc-900/95 text-white">
      <aside className="w-44 border-r border-white/10 p-2">
        {ITEMS.map((i) => (
          <button
            key={i.id}
            type="button"
            onClick={() => setPane(i.id)}
            className={`w-full text-left px-3 py-1.5 rounded-md text-[12px] ${
              pane === i.id ? 'bg-blue-500/80' : 'hover:bg-white/5'
            }`}
          >
            {i.label}
          </button>
        ))}
      </aside>
      <div className="flex-1 overflow-auto os-scroll p-6">
        {pane === 'appearance' ? <AppearancePane /> : <WallpaperPane />}
      </div>
    </div>
  )
}
