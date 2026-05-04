'use client'
import Image from 'next/image'

const FALLBACK_GRADIENT = 'linear-gradient(135deg, #2a3b5f 0%, #5e8bb8 50%, #b88a8a 100%)'

const DEFAULT_WALLPAPER = '/apple/wallpapers/default.jpg'

export function Wallpaper({ src }: { src?: string }) {
  const url = src ?? DEFAULT_WALLPAPER
  return (
    <div className="absolute inset-0 -z-10" style={{ background: FALLBACK_GRADIENT }}>
      <Image
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
