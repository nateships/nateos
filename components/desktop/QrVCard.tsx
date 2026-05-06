'use client'
import Image from 'next/image'

export function QrVCard() {
  return (
    <a
      href="/contact.vcf"
      download="Nate_OFarrell.vcf"
      className="absolute top-12 right-4 z-10 w-[140px] rounded-2xl backdrop-blur-md bg-zinc-900/55 border border-white/10 p-3 text-white text-[10px] hover:bg-zinc-900/70 transition-colors"
    >
      <Image
        src="/qr.png"
        alt="Save Nate's contact"
        width={120}
        height={120}
        className="rounded-md w-full h-auto"
        priority
        unoptimized
      />
      <div className="mt-2 font-medium">Save my contact</div>
      <div className="opacity-70">Scan with Camera</div>
    </a>
  )
}
