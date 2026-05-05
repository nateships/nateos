'use client'
import { useEffect, useState } from 'react'

type RepoInfo = {
  fullName: string
  description: string | null
  stars: number
  language: string | null
  htmlUrl: string
  readmeExcerpt: string | null
}

export function GitHubCard({ owner, repo }: { owner: string; repo: string }) {
  const [info, setInfo] = useState<RepoInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch(`/api/github?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return (await r.json()) as RepoInfo
      })
      .then((d) => {
        if (!cancelled) setInfo(d)
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'failed')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [owner, repo])

  return (
    <div className="h-full w-full overflow-auto os-scroll bg-zinc-900/95 text-white">
      <div className="max-w-2xl mx-auto px-7 py-7">
        {loading ? (
          <div className="opacity-60 text-[12px]">Loading repo info…</div>
        ) : error ? (
          <div className="text-red-400 text-[12px]">Couldn't load repo: {error}</div>
        ) : info ? (
          <article className="flex flex-col gap-4">
            <header>
              <h1 className="text-xl font-semibold tracking-tight">{info.fullName}</h1>
              {info.description ? (
                <p className="text-[13px] opacity-80 mt-1">{info.description}</p>
              ) : null}
              <div className="flex gap-4 mt-3 text-[12px] opacity-80">
                <span>★ {info.stars.toLocaleString()}</span>
                {info.language ? <span>{info.language}</span> : null}
                <a
                  className="text-blue-400 hover:underline ml-auto"
                  href={info.htmlUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open on GitHub ↗
                </a>
              </div>
            </header>
            {info.readmeExcerpt ? (
              <section>
                <h2 className="text-[10px] uppercase tracking-wider opacity-50 mb-2">README</h2>
                <pre className="text-[12px] leading-relaxed opacity-85 whitespace-pre-wrap font-sans">
                  {info.readmeExcerpt}
                  {info.readmeExcerpt.length >= 600 ? '…' : ''}
                </pre>
              </section>
            ) : null}
          </article>
        ) : null}
      </div>
    </div>
  )
}
