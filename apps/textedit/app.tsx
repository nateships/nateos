'use client'
import { useEffect, useState } from 'react'
import type { AppContext } from '@/lib/os/types'

export function TexteditApp(ctx: AppContext) {
  const file = (ctx.params?.file as string | undefined) ?? 'profile.mdx'
  const [content, setContent] = useState<string>('Loading…')

  useEffect(() => {
    let cancelled = false
    fetch(`/api/content?file=${encodeURIComponent(file)}`)
      .then((r) => (r.ok ? r.text() : `Could not load: ${file}`))
      .then((text) => {
        if (!cancelled) setContent(text)
      })
      .catch(() => {
        if (!cancelled) setContent(`Could not load: ${file}`)
      })
    return () => {
      cancelled = true
    }
  }, [file])

  return (
    <div className="h-full w-full flex flex-col bg-zinc-50 text-zinc-900">
      <header className="px-4 py-2 border-b border-zinc-300 text-[11px] text-zinc-600 bg-zinc-100">
        {file}
      </header>
      <pre className="flex-1 overflow-auto os-scroll-dark px-6 py-5 text-[13px] font-mono leading-relaxed whitespace-pre-wrap">
        {content}
      </pre>
    </div>
  )
}
