import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'
import { NextResponse } from 'next/server'

export const revalidate = 21600
// SSRF protection requires DNS lookup, which is a Node-only API. Force the
// Node runtime so we don't run on the Edge.
export const runtime = 'nodejs'

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

// Hostnames we never proxy, even before DNS resolution.
const BLOCKED_HOSTS = new Set([
  'localhost',
  'metadata.google.internal',
  'metadata.azure.com',
  'instance-data',
])

function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split('.').map(Number)
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)) return true
  const [a, b] = parts as [number, number]
  if (a === 10) return true
  if (a === 127) return true // loopback
  if (a === 0) return true // current network / wildcard
  if (a === 169 && b === 254) return true // link-local + AWS/GCP/Azure metadata
  if (a === 172 && b >= 16 && b <= 31) return true
  if (a === 192 && b === 168) return true
  if (a === 100 && b >= 64 && b <= 127) return true // CGNAT
  if (a >= 224) return true // multicast / reserved
  return false
}

function isPrivateIPv6(ip: string): boolean {
  const lower = ip.toLowerCase()
  if (lower === '::1' || lower === '::') return true
  if (lower.startsWith('fc') || lower.startsWith('fd')) return true // unique local
  if (lower.startsWith('fe80')) return true // link-local
  if (lower.startsWith('::ffff:')) {
    const v4 = lower.slice('::ffff:'.length)
    return isPrivateIPv4(v4)
  }
  return false
}

function isPrivateIP(ip: string): boolean {
  const v = isIP(ip)
  if (v === 4) return isPrivateIPv4(ip)
  if (v === 6) return isPrivateIPv6(ip)
  return true // not an IP we recognize → reject
}

async function ssrfSafe(parsed: URL): Promise<{ ok: true } | { ok: false; reason: string }> {
  const host = parsed.hostname.toLowerCase()
  if (!host) return { ok: false, reason: 'empty host' }
  if (BLOCKED_HOSTS.has(host)) return { ok: false, reason: 'blocked host' }
  // If the host is already an IP literal, validate directly.
  if (isIP(host) !== 0) {
    return isPrivateIP(host) ? { ok: false, reason: 'private ip literal' } : { ok: true }
  }
  // Otherwise resolve and validate every result.
  try {
    const results = await lookup(host, { all: true })
    if (results.length === 0) return { ok: false, reason: 'no DNS result' }
    for (const r of results) {
      if (isPrivateIP(r.address)) return { ok: false, reason: 'resolves to private ip' }
    }
    return { ok: true }
  } catch {
    return { ok: false, reason: 'dns lookup failed' }
  }
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
  const guard = await ssrfSafe(parsed)
  if (!guard.ok) {
    return NextResponse.json({ error: `blocked: ${guard.reason}` }, { status: 400 })
  }
  try {
    // Follow redirects manually so we can re-run the SSRF guard on each hop.
    // `redirect: 'follow'` would let an attacker host a public URL that 302s
    // to e.g. http://169.254.169.254/...
    const MAX_REDIRECTS = 5
    let current = parsed
    let r: Response | null = null
    for (let i = 0; i <= MAX_REDIRECTS; i++) {
      r = await fetch(current.toString(), {
        headers: {
          'user-agent': 'Mozilla/5.0 (compatible; NateOS-Portfolio/1.0; +https://nate.cx)',
          accept: 'text/html,*/*;q=0.5',
        },
        redirect: 'manual',
        next: { revalidate: 21600 },
      })
      if (r.status >= 300 && r.status < 400) {
        const loc = r.headers.get('location')
        if (!loc) break
        const next = new URL(loc, current)
        if (!['http:', 'https:'].includes(next.protocol)) {
          return NextResponse.json({ error: 'bad redirect protocol' }, { status: 400 })
        }
        const hopGuard = await ssrfSafe(next)
        if (!hopGuard.ok) {
          return NextResponse.json(
            { error: `blocked redirect: ${hopGuard.reason}` },
            { status: 400 },
          )
        }
        current = next
        continue
      }
      break
    }
    if (!r) {
      return NextResponse.json({ error: 'no response' }, { status: 502 })
    }
    if (r.status >= 300 && r.status < 400) {
      return NextResponse.json({ error: 'too many redirects' }, { status: 502 })
    }
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
