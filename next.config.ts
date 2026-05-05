import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // serving local Apple PNGs as-is is fine for portfolio
  },
}

export default nextConfig
