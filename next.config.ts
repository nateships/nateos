import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // serving local Apple PNGs as-is is fine for portfolio
  },
  async headers() {
    // Force inline disposition on resume documents so the Quick Look iframe
    // renders them in-browser instead of triggering a download. Vercel's
    // default for /public PDFs varies by content-type sniffing — being
    // explicit kills the ambiguity.
    return [
      {
        source: '/:path*.pdf',
        headers: [
          { key: 'Content-Type', value: 'application/pdf' },
          { key: 'Content-Disposition', value: 'inline' },
        ],
      },
      {
        source: '/:path*.docx',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          },
          { key: 'Content-Disposition', value: 'inline' },
        ],
      },
    ]
  },
}

export default nextConfig
