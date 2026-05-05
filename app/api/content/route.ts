import { existsSync, readFileSync } from 'node:fs'
import { join, normalize, sep } from 'node:path'
import { NextResponse } from 'next/server'

const ROOT = join(process.cwd(), 'content')
const ROOT_PREFIX = ROOT + sep

export async function GET(req: Request) {
  const url = new URL(req.url)
  const file = url.searchParams.get('file')
  if (!file) return NextResponse.json({ error: 'missing file' }, { status: 400 })
  // Prevent path traversal: resolve against ROOT and require the result to
  // be inside ROOT (path equal to ROOT or starting with ROOT + separator).
  // Bare `startsWith(ROOT)` would accept sibling dirs like `content-drafts/`.
  const safe = normalize(join(ROOT, file))
  if (safe !== ROOT && !safe.startsWith(ROOT_PREFIX)) {
    return NextResponse.json({ error: 'invalid path' }, { status: 400 })
  }
  if (!existsSync(safe)) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }
  const text = readFileSync(safe, 'utf8')
  return new NextResponse(text, { status: 200, headers: { 'content-type': 'text/plain' } })
}
