import { NextResponse } from 'next/server'

export const revalidate = 21600

type OgInfo = {
  url: string
  title: string | null
  description: string | null
  image: string | null
  siteName: string | null
}

function metaContent(html: string, prop: string): string | null {
  const re1 = new RegExp(`<meta[^>]+property=["']${prop}["'][^>]+content=["']([^"']+)["']`, 'i')
  const re2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${prop}["']`, 'i')
  const re3 = new RegExp(`<meta[^>]+name=["']${prop}["'][^>]+content=["']([^"']+)["']`, 'i')
  return html.match(re1)?.[1] ?? html.match(re2)?.[1] ?? html.match(re3)?.[1] ?? null
}

function decodeEntities(s: string | null): string | null {
  if (!s) return s
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x2F;/g, '/')
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const target = url.searchParams.get('url')
  if (!target) return NextResponse.json({ error: 'missing url' }, { status: 400 })
  let parsed: URL
  try {
    parsed = new URL(target)
  } catch {
    return NextResponse.json({ error: 'invalid url' }, { status: 400 })
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return NextResponse.json({ error: 'bad protocol' }, { status: 400 })
  }
  try {
    const r = await fetch(parsed.toString(), {
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; NateOS-Portfolio/1.0; +https://nate.cx)',
        accept: 'text/html,*/*;q=0.5',
      },
      redirect: 'follow',
      next: { revalidate: 21600 },
    })
    if (!r.ok) {
      return NextResponse.json(
        { url: target, title: null, description: null, image: null, siteName: null },
        { status: 200 },
      )
    }
    const html = (await r.text()).slice(0, 200_000) // cap to avoid huge pages
    const info: OgInfo = {
      url: target,
      title: decodeEntities(
        metaContent(html, 'og:title') ??
          html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ??
          null,
      ),
      description: decodeEntities(
        metaContent(html, 'og:description') ?? metaContent(html, 'description'),
      ),
      image: metaContent(html, 'og:image'),
      siteName: decodeEntities(metaContent(html, 'og:site_name')),
    }
    return NextResponse.json(info)
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'fetch failed' },
      { status: 502 },
    )
  }
}
