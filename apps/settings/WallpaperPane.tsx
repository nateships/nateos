'use client'
import Image from 'next/image'
import { useSettings } from '@/lib/settings/store'

const WALLPAPERS: { name: string; path: string }[] = [
  { name: 'NateOS Big Sur', path: '/apple/wallpapers/nateos-big-sur-dark.jpg' },
  { name: 'Sonoma Horizon', path: '/apple/wallpapers/sonoma-horizon.jpg' },
  { name: 'Sonoma', path: '/apple/wallpapers/sonoma.jpg' },
  { name: 'Mac Blue', path: '/apple/wallpapers/mac-blue.jpg' },
  { name: 'Radial Sky Blue', path: '/apple/wallpapers/radial-sky-blue.jpg' },
]

export function WallpaperPane() {
  const current = useSettings((s) => s.wallpaper)
  const setWallpaper = useSettings((s) => s.setWallpaper)
  return (
    <div>
      <h3 className="text-[12px] font-semibold mb-3">Wallpaper</h3>
      <div className="grid grid-cols-3 gap-3">
        {WALLPAPERS.map((w) => (
          <button
            key={w.path}
            type="button"
            onClick={() => setWallpaper(w.path)}
            className={`relative aspect-video rounded-md overflow-hidden border-2 ${
              current === w.path ? 'border-blue-500' : 'border-transparent hover:border-white/20'
            }`}
          >
            <Image
              src={w.path}
              alt={w.name}
              fill
              sizes="200px"
              style={{ objectFit: 'cover' }}
              unoptimized
            />
            <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-[10px] py-1 px-1.5 truncate">
              {w.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
