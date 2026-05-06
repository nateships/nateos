'use client'
import Image from 'next/image'

export function PreviewIcon({ size = 48 }: { size?: number }) {
  return (
    <Image
      src="/apple/icons/file-pdf.png"
      alt="Preview"
      width={size}
      height={size}
      unoptimized
      priority={false}
    />
  )
}
