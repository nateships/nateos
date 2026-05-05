import { NextResponse } from 'next/server'

type RepoInfo = {
  fullName: string
  description: string | null
  stars: number
  language: string | null
  htmlUrl: string
  readmeExcerpt: string | null
}

const HEADERS: HeadersInit = {
  'user-agent': 'NateOS-portfolio',
  accept: 'application/vnd.github+json',
}
if (process.env.GITHUB_TOKEN) {
  ;(HEADERS as Record<string, string>).authorization = `Bearer ${process.env.GITHUB_TOKEN}`
}

export const revalidate = 21600 // 6h

export async function GET(req: Request) {
  const url = new URL(req.url)
  const owner = url.searchParams.get('owner')
  const repo = url.searchParams.get('repo')
  if (!owner || !repo) {
    return NextResponse.json({ error: 'missing owner/repo' }, { status: 400 })
  }
  // Basic input safety: only allow [-A-Za-z0-9_.]
  if (!/^[\w.-]+$/.test(owner) || !/^[\w.-]+$/.test(repo)) {
    return NextResponse.json({ error: 'invalid owner/repo' }, { status: 400 })
  }
  try {
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: HEADERS,
      next: { revalidate: 21600 },
    })
    if (!repoRes.ok) {
      return NextResponse.json({ error: `GitHub ${repoRes.status}` }, { status: 502 })
    }
    const r = await repoRes.json()
    let readmeExcerpt: string | null = null
    try {
      const readmeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
        headers: { ...HEADERS, accept: 'application/vnd.github.v3.raw' },
        next: { revalidate: 21600 },
      })
      if (readmeRes.ok) {
        const text = await readmeRes.text()
        // First 600 chars of README, stripped of front-matter and pure markdown noise
        readmeExcerpt = text.slice(0, 600)
      }
    } catch {
      // README is best-effort
    }
    const info: RepoInfo = {
      fullName: r.full_name ?? `${owner}/${repo}`,
      description: r.description ?? null,
      stars: r.stargazers_count ?? 0,
      language: r.language ?? null,
      htmlUrl: r.html_url ?? `https://github.com/${owner}/${repo}`,
      readmeExcerpt,
    }
    return NextResponse.json(info)
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'fetch failed' },
      { status: 502 },
    )
  }
}
