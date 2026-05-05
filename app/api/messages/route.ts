import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { z } from 'zod'

const Body = z.object({
  name: z.string().min(1).max(120),
  email: z.email(),
  context: z.enum(['recruiter', 'engineer', 'other']).default('other'),
  body: z.string().min(1).max(5000),
  // honeypot — bots tend to fill every field
  _gotcha: z.string().optional(),
})

const TO = 'nate@nateofarrell.com'
const FROM = 'NateOS <onboarding@resend.dev>'

// Naive in-memory rate limit (3 per IP per hour). Resets on cold start; fine for v1.
const buckets = new Map<string, number[]>()
const LIMIT = 3
const WINDOW_MS = 60 * 60 * 1000
let lastSweep = 0

// Drop expired entries so a long-running warm function doesn't accumulate
// orphaned IP keys forever. Sweeps at most once per WINDOW_MS.
function sweep(now: number) {
  if (now - lastSweep < WINDOW_MS) return
  lastSweep = now
  for (const [ip, arr] of buckets) {
    const fresh = arr.filter((t) => now - t < WINDOW_MS)
    if (fresh.length === 0) buckets.delete(ip)
    else if (fresh.length !== arr.length) buckets.set(ip, fresh)
  }
}

function rateLimit(ip: string): boolean {
  const now = Date.now()
  sweep(now)
  const arr = (buckets.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  if (arr.length >= LIMIT) {
    // Persist the freshly-filtered window so expired entries don't pile up
    // on a quota-exceeded IP.
    buckets.set(ip, arr)
    return false
  }
  arr.push(now)
  buckets.set(ip, arr)
  return true
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'

  let payload: unknown
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const parsed = Body.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }
  if (parsed.data._gotcha) {
    // Honeypot tripped — pretend success without consuming the rate-limit
    // quota for this IP, so a bot scanner can't burn legit users' allowance.
    return NextResponse.json({ ok: true })
  }
  // Apply rate-limit only to legitimate-looking submissions.
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: 'Rate limited' }, { status: 429 })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Email not configured' }, { status: 503 })
  }
  const resend = new Resend(apiKey)
  const { name, email, context, body } = parsed.data
  try {
    await resend.emails.send({
      from: FROM,
      replyTo: email,
      to: TO,
      subject: `[NateOS · ${context}] ${name}`,
      text: `From: ${name} <${email}> (${context})\n\n${body}`,
    })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('resend send failed', e)
    return NextResponse.json({ error: 'Send failed' }, { status: 502 })
  }
}
