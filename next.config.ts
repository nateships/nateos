import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // serving local Apple PNGs as-is is fine for portfolio
  },
  // /public is 274MB (mostly Apple wallpapers at 260MB). Without this,
  // /api/file/[name] uses readFile(process.cwd() + 'public/...') and Vercel
  // bundles the entire /public into the serverless function, blowing past
  // the 250MB unzipped function-size limit. Exclude the heavy directories
  // — the only files this route actually reads are the resume PDF + DOCX
  // at /public root, which stay traced.
  outputFileTracingExcludes: {
    '/api/file/[name]': [
      'public/apple/wallpapers/**',
      'public/apple/icons/**',
      'public/apple/fonts/**',
    ],
  },
  async headers() {
    // Force inline disposition on resume documents so the Quick Look <object>
    // tag renders them in-browser instead of triggering a download. Vercel's
    // CDN sniffs Content-Type for /public files and sometimes falls back to
    // application/octet-stream, which the browser treats as a download. The
    // path-to-regexp `:path*.ext` source ran into edge cases — match the two
    // exact filenames so the rule is unambiguous.
    return [
      {
        source: '/Nate_OFarrell_Resume_2026.pdf',
        headers: [
          { key: 'Content-Type', value: 'application/pdf' },
          { key: 'Content-Disposition', value: 'inline' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
      {
        source: '/Nate_OFarrell_Resume_2026.docx',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          },
          { key: 'Content-Disposition', value: 'inline' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ]
  },
}

export default nextConfig
