import { type NextRequest, NextResponse } from 'next/server'

/**
 * Force inline disposition on the resume documents so the Quick Look preview
 * (an <object> tag pointing at /Resume.pdf) renders in the browser instead of
 * triggering a download. Vercel's static asset CDN otherwise serves /public
 * files with attachment-style behavior on some content-type sniff outcomes.
 *
 * The earlier next.config headers() rule didn't survive on Vercel's CDN, and
 * a serverless API route blew the 250MB function-size budget by bundling
 * /public/apple/wallpapers (260MB). Proxy (formerly Middleware in Next < 16)
 * modifies response headers at the edge without bundling anything.
 *
 * `<a download>` on the resume's text-link "↓ pdf / ↓ docx" still triggers
 * a download — the HTML5 attribute is client-side and overrides the inline
 * server header.
 */
export function proxy(_req: NextRequest) {
  const res = NextResponse.next()
  res.headers.set('Content-Disposition', 'inline')
  res.headers.set('X-Content-Type-Options', 'nosniff')
  return res
}

export const config = {
  matcher: ['/Nate_OFarrell_Resume_2026.pdf', '/Nate_OFarrell_Resume_2026.docx'],
}
