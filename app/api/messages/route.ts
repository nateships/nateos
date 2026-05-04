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

function rateLimit(ip: string): boolean {
  const now = Date.now()
  const arr = (buckets.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  if (arr.length >= LIMIT) return false
  arr.push(now)
  buckets.set(ip, arr)
  return true
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: 'Rate limited' }, { status: 429 })
  }

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
    // Honeypot tripped — pretend success
    return NextResponse.json({ ok: true })
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
