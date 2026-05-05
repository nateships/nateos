'use client'
import { useEffect, useState } from 'react'
import type { Bookmark } from '@/lib/content/schema'
import { classify } from './preview-type'

type GhRepo = {
  fullName: string
  description: string | null
  stars: number
  language: string | null
}

type Og = {
  title: string | null
  description: string | null
  image: string | null
  siteName: string | null
}

function hostOf(url: string) {
  try {
    return new URL(url).host.replace(/^www\./, '')
  } catch {
    return url
  }
}

export function BookmarkTile({ bookmark }: { bookmark: Bookmark }) {
  const t = classify(bookmark.url)
  const [og, setOg] = useState<Og | null>(null)
  const [gh, setGh] = useState<GhRepo | null>(null)

  useEffect(() => {
    let cancelled = false
    if (t.kind === 'github') {
      fetch(`/api/github?owner=${encodeURIComponent(t.owner)}&repo=${encodeURIComponent(t.repo)}`)
        .then(async (r) => (r.ok ? ((await r.json()) as GhRepo) : null))
        .then((d) => {
          if (!cancelled && d) setGh(d)
        })
        .catch(() => undefined)
    } else if (t.kind === 'og') {
      fetch(`/api/og?url=${encodeURIComponent(t.url)}`)
        .then(async (r) => (r.ok ? ((await r.json()) as Og) : null))
        .then((d) => {
          if (!cancelled && d) setOg(d)
        })
        .catch(() => undefined)
    }
    return () => {
      cancelled = true
    }
  }, [t])

  const host = hostOf(bookmark.url)

  // Image source per tile type
  let imageEl: React.ReactNode = (
    <div className="absolute inset-0 flex items-center justify-center text-white/40 text-3xl font-light">
      {host[0]?.toUpperCase()}
    </div>
  )
  if (t.kind === 'youtube') {
    imageEl = (
      // biome-ignore lint/performance/noImgElement: external YouTube thumbnail URL
      <img
        src={`https://i.ytimg.com/vi/${t.videoId}/hqdefault.jpg`}
        alt={bookmark.label}
        className="absolute inset-0 w-full h-full object-cover"
      />
    )
  } else if (t.kind === 'og' && og?.image) {
    imageEl = (
      // biome-ignore lint/performance/noImgElement: external OG image URL
      <img
        src={og.image}
        alt={bookmark.label}
        className="absolute inset-0 w-full h-full object-cover"
        onError={(e) => {
          e.currentTarget.style.display = 'none'
        }}
      />
    )
  }

  // Footer line: stars/language for GH; description for OG; host otherwise
  let subtitle: string = host
  if (t.kind === 'github' && gh) {
    const parts: string[] = []
    parts.push(`★ ${gh.stars.toLocaleString()}`)
    if (gh.language) parts.push(gh.language)
    subtitle = parts.join(' · ')
  } else if (og?.description) {
    subtitle = og.description
  }

  // Hero overlay (different per type so the tile isn't all the same)
  const overlay =
    t.kind === 'youtube' ? (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center text-white text-xl">
          ▶
        </div>
      </div>
    ) : t.kind === 'github' ? (
      <div className="absolute inset-0 flex items-end p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
        <div className="text-white">
          <div className="text-[11px] opacity-70">{host}</div>
          <div className="text-[15px] font-semibold leading-tight">
            {gh?.fullName ?? bookmark.label}
          </div>
          {gh?.description ? (
            <div className="text-[11px] opacity-80 mt-0.5 line-clamp-2">{gh.description}</div>
          ) : null}
        </div>
      </div>
    ) : null

  return (
    <a
      href={bookmark.url}
      target="_blank"
      rel="noreferrer"
      className="group flex flex-col gap-2 rounded-xl overflow-hidden bg-zinc-800/60 hover:bg-zinc-700/70 transition-colors border border-white/5 hover:border-white/15"
    >
      <div className="relative aspect-video bg-zinc-900">
        {imageEl}
        {overlay}
      </div>
      <div className="px-3 pb-3 pt-1">
        <div className="text-[13px] font-medium truncate text-white">{bookmark.label}</div>
        <div className="text-[11px] opacity-60 truncate mt-0.5">{subtitle}</div>
      </div>
    </a>
  )
}
