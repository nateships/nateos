import Image from 'next/image'

export function AppleIcon({ src, alt, size = 48 }: { src: string; alt: string; size?: number }) {
  return (
    <Image src={src} alt={alt} width={size} height={size} style={{ borderRadius: 8 }} priority />
  )
}
