'use client'
import Image from 'next/image'
import { useSettings } from '@/lib/settings/store'

const FALLBACK_GRADIENT = 'linear-gradient(135deg, #2a3b5f 0%, #5e8bb8 50%, #b88a8a 100%)'

export function Wallpaper() {
  const url = useSettings((s) => s.wallpaper)
  return (
    <div
      className="nateos-wallpaper absolute inset-0 -z-10"
      style={{ background: FALLBACK_GRADIENT }}
    >
      <Image
        key={url}
        src={url}
        alt=""
        fill
        priority
        sizes="100vw"
        style={{ objectFit: 'cover' }}
        onError={(e) => {
          ;(e.target as HTMLImageElement).style.display = 'none'
        }}
      />
    </div>
  )
}
