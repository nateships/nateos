import { existsSync, readFileSync } from 'node:fs'
import { join, normalize } from 'node:path'
import { NextResponse } from 'next/server'

const ROOT = join(process.cwd(), 'content')

export async function GET(req: Request) {
  const url = new URL(req.url)
  const file = url.searchParams.get('file')
  if (!file) return NextResponse.json({ error: 'missing file' }, { status: 400 })
  // Prevent path traversal: resolve against ROOT, ensure within ROOT.
  const safe = normalize(join(ROOT, file))
  if (!safe.startsWith(ROOT)) {
    return NextResponse.json({ error: 'invalid path' }, { status: 400 })
  }
  if (!existsSync(safe)) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }
  const text = readFileSync(safe, 'utf8')
  return new NextResponse(text, { status: 200, headers: { 'content-type': 'text/plain' } })
}
