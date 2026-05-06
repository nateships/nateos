'use client'
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
 * Quick Look-style preview window. Renders an iframe inline so visitors can
 * read the resume (PDF or DOCX) without committing to a download.
 *  - PDFs render natively in the browser's plugin.
 *  - DOCX files use Microsoft's Office Online embed viewer, which requires a
 *    publicly-reachable URL. On localhost the viewer can't reach the file,
 *    so we fall back to a download link.
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

  if (isDocx) {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      return (
        <Fallback src={src} msg="DOCX preview needs a public URL — unavailable on localhost." />
      )
    }
    if (typeof window !== 'undefined') {
      const absolute = `${window.location.origin}${src}`
      const officeUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(absolute)}`
      return (
        <div className="os-glass-app h-full w-full">
          <iframe title={title} src={officeUrl} className="w-full h-full border-0 bg-white" />
        </div>
      )
    }
    // SSR — render a placeholder; the client will replace it on hydration.
    return <div className="os-glass-app h-full w-full" />
  }

  if (isPdf) {
    // <object> with explicit type beats <iframe> for inline PDF rendering on
    // some CDNs — it forces the browser's PDF viewer instead of letting the
    // network response steer the frame into a download. Inner <iframe> +
    // download link kicks in if the browser can't render PDFs at all.
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

  return <Fallback src={src} msg={`Preview not supported for this file type.`} />
}
