'use client'
import { useEffect, useState } from 'react'

type OgInfo = {
  url: string
  title: string | null
  description: string | null
  image: string | null
  siteName: string | null
}

export function OgCard({ url }: { url: string }) {
  const [info, setInfo] = useState<OgInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch(`/api/og?url=${encodeURIComponent(url)}`)
      .then(async (r) => (await r.json()) as OgInfo)
      .then((d) => {
        if (!cancelled) setInfo(d)
      })
      .catch(() => {
        if (!cancelled)
          setInfo({ url, title: null, description: null, image: null, siteName: null })
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [url])

  let host = ''
  try {
    host = new URL(url).host.replace(/^www\./, '')
  } catch {
    host = url
  }

  return (
    <div className="h-full w-full overflow-auto os-scroll bg-zinc-900/95 text-white">
      <div className="max-w-2xl mx-auto px-7 py-7">
        {loading ? (
          <div className="opacity-60 text-[12px]">Loading preview…</div>
        ) : (
          <article className="flex flex-col gap-4">
            {info?.image ? (
              // Using <img> not <Image> because src is arbitrary external URL
              // biome-ignore lint/performance/noImgElement: external arbitrary URL
              <img
                src={info.image}
                alt={info.title ?? host}
                className="rounded-xl w-full max-h-[320px] object-cover bg-white/5"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            ) : null}
            <header>
              <div className="text-[10px] uppercase tracking-wider opacity-50">
                {info?.siteName ?? host}
              </div>
              <h1 className="text-xl font-semibold tracking-tight mt-1">{info?.title ?? url}</h1>
              {info?.description ? (
                <p className="text-[13px] opacity-80 mt-2">{info.description}</p>
              ) : null}
            </header>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="self-start px-3 py-1.5 rounded-md bg-blue-500 hover:bg-blue-400 text-white text-[12px] font-medium"
            >
              Open in new tab ↗
            </a>
          </article>
        )}
      </div>
    </div>
  )
}
