import { type LookupAddress, type LookupOptions, lookup as lookupCb } from 'node:dns'
import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'
import { NextResponse } from 'next/server'
import { Agent, fetch as undiciFetch } from 'undici'

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

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function metaContent(html: string, prop: string): string | null {
  // Use a backreference to the opening quote so values containing the
  // opposite quote (e.g. `content="Nate's site"`) aren't truncated.
  // Escape `prop` so callers like `article.published_time` are matched
  // literally rather than as a regex.
  const p = escapeRegex(prop)
  const re1 = new RegExp(`<meta[^>]+property=(["'])${p}\\1[^>]+content=(["'])(.*?)\\2`, 'i')
  const re2 = new RegExp(`<meta[^>]+content=(["'])(.*?)\\1[^>]+property=(["'])${p}\\3`, 'i')
  const re3 = new RegExp(`<meta[^>]+name=(["'])${p}\\1[^>]+content=(["'])(.*?)\\2`, 'i')
  return html.match(re1)?.[3] ?? html.match(re2)?.[2] ?? html.match(re3)?.[3] ?? null
}

type ByteStream = {
  getReader(): {
    read(): Promise<{ done: boolean; value?: Uint8Array }>
    cancel(): Promise<unknown>
  }
}

/** Read up to `cap` bytes from a ReadableStream, then cancel. Returns UTF-8. */
async function readCapped(body: unknown, cap: number): Promise<string> {
  if (!body) return ''
  const stream = body as ByteStream
  const reader = stream.getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  try {
    while (total < cap) {
      const { done, value } = await reader.read()
      if (done) break
      if (!value) continue
      const remaining = cap - total
      if (value.byteLength > remaining) {
        chunks.push(value.subarray(0, remaining))
        total = cap
        break
      }
      chunks.push(value)
      total += value.byteLength
    }
  } finally {
    await reader.cancel().catch(() => undefined)
  }
  const buf = new Uint8Array(total)
  let offset = 0
  for (const c of chunks) {
    buf.set(c, offset)
    offset += c.byteLength
  }
  return new TextDecoder('utf-8', { fatal: false }).decode(buf)
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

// undici Agent that runs every TCP connect's DNS lookup through our private-IP
// guard. Closes the DNS-rebinding TOCTOU where ssrfSafe sees a public IP
// but fetch's own DNS resolution lands on a private one.
const safeAgent = new Agent({
  connect: {
    lookup: (
      hostname: string,
      opts: LookupOptions,
      cb: (
        err: NodeJS.ErrnoException | null,
        address: string | LookupAddress[],
        family?: number,
      ) => void,
    ) => {
      // Re-run the bare-hostname guard (BLOCKED_HOSTS, IP literal in private ranges).
      const host = hostname.toLowerCase()
      if (BLOCKED_HOSTS.has(host)) {
        cb(new Error(`SSRF blocked: hostname ${host}`), '', 0)
        return
      }
      if (isIP(host) !== 0 && isPrivateIP(host)) {
        cb(new Error(`SSRF blocked: private ip literal ${host}`), '', 0)
        return
      }
      lookupCb(hostname, opts, (err, address, family) => {
        if (err) return cb(err, '', 0)
        const list: LookupAddress[] = Array.isArray(address)
          ? address
          : [{ address: address as string, family: family as number }]
        for (const r of list) {
          if (isPrivateIP(r.address)) {
            cb(new Error(`SSRF blocked: ${hostname} → ${r.address}`), '', 0)
            return
          }
        }
        if (opts?.all) {
          cb(null, list)
        } else {
          const first = list[0]
          cb(null, first.address, first.family)
        }
      })
    },
  },
})

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
    let r: Awaited<ReturnType<typeof undiciFetch>> | null = null
    for (let i = 0; i <= MAX_REDIRECTS; i++) {
      r = await undiciFetch(current.toString(), {
        headers: {
          'user-agent': 'Mozilla/5.0 (compatible; NateOS-Portfolio/1.0; +https://nate.cx)',
          accept: 'text/html,*/*;q=0.5',
        },
        redirect: 'manual',
        dispatcher: safeAgent,
      })
      if (r.status >= 300 && r.status < 400) {
        const loc = r.headers.get('location')
        // Drain redirect body so the connection can return to the pool.
        await r.body?.cancel().catch(() => undefined)
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
      await r.body?.cancel().catch(() => undefined)
      return NextResponse.json({ error: 'too many redirects' }, { status: 502 })
    }
    if (!r.ok) {
      await r.body?.cancel().catch(() => undefined)
      return NextResponse.json(
        { url: target, title: null, description: null, image: null, siteName: null },
        { status: 200 },
      )
    }
    // Reject obviously non-HTML payloads early (e.g. PDFs, videos).
    const contentType = (r.headers.get('content-type') ?? '').toLowerCase()
    if (contentType && !/\b(text\/html|application\/xhtml\+xml|text\/plain)\b/.test(contentType)) {
      await r.body?.cancel().catch(() => undefined)
      return NextResponse.json(
        { url: target, title: null, description: null, image: null, siteName: null },
        { status: 200 },
      )
    }
    // Stream-read with a hard cap so a multi-GB response can't OOM the
    // server. Stops as soon as we have enough bytes.
    const CAP = 200_000
    const html = await readCapped(r.body, CAP)
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
