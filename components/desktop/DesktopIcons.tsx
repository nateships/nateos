'use client'
import Image from 'next/image'
import { useWindowStore } from '@/lib/os/window-store'

export function DesktopIcons() {
  const openApp = useWindowStore((s) => s.openApp)
  return (
    <div className="absolute top-10 left-3 z-10 flex flex-col gap-3">
      <a
        href="/resume.pdf"
        download="Nate_OFarrell_Resume.pdf"
        className="flex flex-col items-center gap-1 w-16 hover:bg-white/10 rounded-md p-1.5 transition-colors"
      >
        <Image
          src="/apple/icons/file-pdf.png"
          alt="Resume.pdf"
          width={48}
          height={48}
          unoptimized
        />
        <span className="text-[10px] text-white drop-shadow font-medium">Resume.pdf</span>
      </a>
      <button
        type="button"
        onClick={() => openApp('projects')}
        className="flex flex-col items-center gap-1 w-16 hover:bg-white/10 rounded-md p-1.5 transition-colors"
      >
        <Image
          src="/apple/icons/GenericFolderIcon.png"
          alt="Projects"
          width={48}
          height={48}
          unoptimized
        />
        <span className="text-[10px] text-white drop-shadow font-medium">Projects</span>
      </button>
    </div>
  )
}
