'use client'
import type { Bookmark } from '@/lib/content/schema'
import { GitHubCard } from './GitHubCard'
import { OgCard } from './OgCard'
import { classify } from './preview-type'
import { YouTubeEmbed } from './YouTubeEmbed'

export function PreviewPane({ bookmark }: { bookmark: Bookmark }) {
  const t = classify(bookmark.url)
  if (t.kind === 'youtube') return <YouTubeEmbed videoId={t.videoId} label={bookmark.label} />
  if (t.kind === 'github') return <GitHubCard owner={t.owner} repo={t.repo} />
  return <OgCard url={t.url} />
}
