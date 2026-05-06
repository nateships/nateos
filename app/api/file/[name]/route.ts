import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

/**
 * Streams the resume PDF / DOCX from /public with explicit inline-disposition
 * headers. Vercel's static asset CDN sniffs Content-Type for /public files and
 * can serve them as application/octet-stream, which makes the browser
 * download instead of rendering inline. Routing through this handler gives
 * us full control over the response headers — they survive any CDN behavior.
 *
 * Allowlist gate: only the two resume documents are served. Any other name
 * returns 404, which prevents path-traversal abuse.
 */
const ALLOWED: Record<string, string> = {
  'Nate_OFarrell_Resume_2026.pdf': 'application/pdf',
  'Nate_OFarrell_Resume_2026.docx':
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}

type Props = { params: Promise<{ name: string }> }

export async function GET(_req: Request, { params }: Props) {
  const { name } = await params
  const contentType = ALLOWED[name]
  if (!contentType) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }
  let buf: Buffer
  try {
    buf = await readFile(join(process.cwd(), 'public', name))
  } catch {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }
  return new Response(new Uint8Array(buf), {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `inline; filename="${name}"`,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
