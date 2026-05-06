'use client'
import { useEffect, useRef, useState } from 'react'
import type { AppContext } from '@/lib/os/types'

function Fallback({ src, msg }: { src: string; msg: string }) {
  return (
    <div className="os-glass-app h-full w-full flex flex-col items-center justify-center text-white text-[13px] gap-3 p-6 text-center">
      <p className="opacity-75">{msg}</p>
      <a
        href={src}
        download
        className="px-4 py-1.5 rounded-md bg-blue-500 hover:bg-blue-400 text-white text-[12px] font-medium"
      >
        Download
      </a>
    </div>
  )
}

/**
 * DOCX renderer — fetches the file in the browser and renders via
 * docx-preview, which preserves the original document's fonts, sizes,
 * spacing, tables, and inline styles (unlike mammoth which strips back to
 * semantic HTML). Avoids the Office Online embed viewer's third-party
 * fetch which is unreliable on preview deployments and CORS-gated hosts.
 */
function DocxRenderer({ src, title }: { src: string; title: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const target = containerRef.current
    if (!target) return
    let cancelled = false
    async function load() {
      try {
        const [docxMod, res] = await Promise.all([import('docx-preview'), fetch(src)])
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const buf = await res.arrayBuffer()
        if (cancelled || !target) return
        target.replaceChildren()
        await docxMod.renderAsync(buf, target, undefined, {
          className: 'docx',
          inWrapper: true,
          ignoreLastRenderedPageBreak: true,
          experimental: true,
          breakPages: true,
        })
        if (!cancelled) setLoading(false)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Conversion failed')
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [src])

  if (error) {
    return <Fallback src={src} msg={`Couldn't render preview: ${error}`} />
  }
  return (
    <div className="h-full w-full flex flex-col bg-zinc-200 text-zinc-900">
      <div className="shrink-0 flex items-center justify-between gap-3 px-3 py-1.5 bg-zinc-100/95 border-b border-zinc-300">
        <span className="text-[11px] text-zinc-500 truncate">{title}</span>
        <a
          href={src}
          download
          className="px-3 py-1 rounded-md bg-blue-500 hover:bg-blue-400 text-white text-[11px] font-medium"
        >
          Download
        </a>
      </div>
      <div className="flex-1 overflow-auto os-scroll relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-500 text-[13px]">
            Loading {title}…
          </div>
        ) : null}
        <div ref={containerRef} className="docx-host py-6" />
      </div>
    </div>
  )
}

/**
 * Quick Look-style preview window. Renders the resume (PDF or DOCX) inline so
 * visitors can read it without committing to a download.
 *  - PDFs render in the browser's native PDF plugin via <object>.
 *  - DOCX files are converted to HTML client-side via mammoth.
 */
export function PreviewApp(ctx: AppContext) {
  const src = (ctx.params?.src as string | undefined) ?? ''
  const title = (ctx.params?.title as string | undefined) ?? 'Preview'
  if (!src) {
    return (
      <div className="os-glass-app h-full w-full flex items-center justify-center text-white text-[13px] opacity-60">
        Nothing to preview.
      </div>
    )
  }
  const lower = src.toLowerCase()
  const isPdf = lower.endsWith('.pdf')
  const isDocx = lower.endsWith('.docx')

  if (isDocx) return <DocxRenderer src={src} title={title} />

  if (isPdf) {
    return (
      <div className="os-glass-app h-full w-full">
        <object
          data={src}
          type="application/pdf"
          aria-label={title}
          className="w-full h-full bg-white"
        >
          <iframe title={title} src={src} className="w-full h-full border-0 bg-white" />
        </object>
      </div>
    )
  }

  return <Fallback src={src} msg="Preview not supported for this file type." />
}
