import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json({ error: 'AI chat not enabled' }, { status: 501 })
}
