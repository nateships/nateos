'use client'
import { useEffect, useState } from 'react'
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
 * DOCX renderer — fetches the file in the browser and converts to HTML via
 * mammoth.js, which strips scripts/styles/event handlers and emits only the
 * structural subset (paragraphs, headings, lists, tables, runs). The source
 * DOCX is committed to this repo, not user input, so the converted output is
 * safe to inject. Avoids the Office Online embed viewer's third-party server
 * fetch which is unreliable on preview deployments and CORS-gated hosts.
 */
function DocxRenderer({ src, title }: { src: string; title: string }) {
  const [html, setHtml] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [mammothMod, res] = await Promise.all([import('mammoth'), fetch(src)])
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const arrayBuffer = await res.arrayBuffer()
        const out = await mammothMod.convertToHtml({ arrayBuffer })
        if (!cancelled) setHtml(out.value)
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
  if (html === null) {
    return (
      <div className="os-glass-app h-full w-full flex items-center justify-center text-white text-[13px] opacity-60">
        Loading {title}…
      </div>
    )
  }
  return (
    <div className="h-full w-full overflow-auto os-scroll bg-white text-zinc-900">
      <article
        className="max-w-3xl mx-auto px-10 py-10 docx-content text-[14px] leading-relaxed"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: mammoth strips scripts/styles; source DOCX is committed, not user input
        dangerouslySetInnerHTML={{ __html: html }}
      />
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
