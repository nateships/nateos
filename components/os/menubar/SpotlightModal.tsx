'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { registry } from '@/lib/os/registry'
import type { AppManifest } from '@/lib/os/types'
import { useWindowStore } from '@/lib/os/window-store'
import { SpotlightIcon } from '../SystemIcons'

type Props = {
  open: boolean
  onClose: () => void
}

function score(app: AppManifest, q: string): number {
  if (!q) return 0
  const query = q.toLowerCase()
  const id = app.id.toLowerCase()
  const title = app.title.toLowerCase()
  if (id === query || title === query) return 100
  if (id.startsWith(query) || title.startsWith(query)) return 80
  if (id.includes(query) || title.includes(query)) return 50
  // Subsequence (fuzzy) — every char of query appears in order in title
  let i = 0
  for (const c of title) {
    if (c === query[i]) i++
    if (i === query.length) return 20
  }
  return -1
}

/**
 * macOS Spotlight-style search.
 * - Filters the App Registry by id/title.
 * - Arrow up/down to navigate, Enter to launch.
 * - Esc or backdrop click closes.
 */
export function SpotlightModal({ open, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [activeIdx, setActiveIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const openApp = useWindowStore((s) => s.openApp)

  const results = useMemo(() => {
    if (!query.trim()) {
      // Empty query: show first 6 apps in registry order
      return registry.filter((m) => !m.disabled).slice(0, 6)
    }
    return registry
      .filter((m) => !m.disabled)
      .map((m) => ({ m, s: score(m, query) }))
      .filter((r) => r.s >= 0)
      .sort((a, b) => b.s - a.s)
      .map((r) => r.m)
      .slice(0, 8)
  }, [query])

  useEffect(() => {
    setActiveIdx(0)
  }, [])

  // Reset query on open + focus input.
  useEffect(() => {
    if (!open) return
    setQuery('')
    setActiveIdx(0)
    const id = window.setTimeout(() => inputRef.current?.focus(), 0)
    return () => window.clearTimeout(id)
  }, [open])

  // Esc close.
  useEffect(() => {
    if (!open) return
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  function launch(app: AppManifest) {
    openApp(app.id)
    onClose()
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIdx((i) => Math.min(results.length - 1, i + 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIdx((i) => Math.max(0, i - 1))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const target = results[activeIdx]
      if (target) launch(target)
    }
  }

  if (!open) return null

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: backdrop click-to-close is standard modal behavior
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center pt-[18vh] bg-black/30 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Spotlight Search"
        className="w-[640px] max-w-[88vw] rounded-2xl border border-white/10 shadow-2xl backdrop-blur-2xl bg-zinc-900/85 text-white overflow-hidden"
      >
        <form
          onSubmit={(event) => {
            event.preventDefault()
            const target = results[activeIdx]
            if (target) launch(target)
          }}
          className="flex items-center gap-3 px-5 py-4 border-b border-white/5"
        >
          <SpotlightIcon size={22} className="opacity-80" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setActiveIdx(0)
            }}
            onKeyDown={onKeyDown}
            placeholder="Spotlight Search"
            className="flex-1 bg-transparent text-[22px] leading-none placeholder:text-white/40 focus:outline-none"
            aria-label="Spotlight Search"
          />
        </form>
        <div className="max-h-[50vh] overflow-auto os-scroll py-1">
          {results.length === 0 ? (
            <div className="px-5 py-3 text-[13px] opacity-60">No matches</div>
          ) : (
            results.map((m, idx) => {
              const Icon = m.icon
              const active = idx === activeIdx
              return (
                <button
                  key={m.id}
                  type="button"
                  onMouseEnter={() => setActiveIdx(idx)}
                  onClick={() => launch(m)}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-left ${
                    active ? 'bg-blue-500/80 text-white' : 'hover:bg-white/5'
                  }`}
                >
                  <Icon size={28} />
                  <span className="flex-1 min-w-0">
                    <span className="block text-[14px] font-medium truncate">{m.title}</span>
                    <span className="block text-[11px] opacity-60 truncate">
                      Application · {m.id}
                    </span>
                  </span>
                  {active ? <span className="text-[11px] opacity-80">↵ open</span> : null}
                </button>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
