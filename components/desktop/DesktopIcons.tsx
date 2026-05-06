'use client'
import Image from 'next/image'
import { useWindowStore } from '@/lib/os/window-store'

const PDF_FILE = 'Nate_OFarrell_Resume_2026.pdf'
const DOCX_FILE = 'Nate_OFarrell_Resume_2026.docx'

export function DesktopIcons() {
  const openApp = useWindowStore((s) => s.openApp)

  function previewPdf() {
    openApp('preview', { src: `/api/file/${PDF_FILE}`, title: 'Resume — PDF' })
  }
  function previewDocx() {
    openApp('preview', { src: `/api/file/${DOCX_FILE}`, title: 'Resume — DOCX' })
  }

  return (
    <div className="absolute top-10 left-3 z-10 flex flex-col gap-3">
      <button
        type="button"
        onClick={previewPdf}
        className="flex flex-col items-center gap-1 w-20 hover:bg-white/10 rounded-md p-1.5 transition-colors"
      >
        <Image src="/apple/icons/file-pdf.png" alt={PDF_FILE} width={48} height={48} unoptimized />
        <span className="text-[10px] text-white drop-shadow font-medium text-center break-words leading-tight">
          Nate_OFarrell_
          <br />
          Resume_2026.pdf
        </span>
      </button>
      <button
        type="button"
        onClick={previewDocx}
        className="flex flex-col items-center gap-1 w-20 hover:bg-white/10 rounded-md p-1.5 transition-colors"
      >
        <Image
          src="/apple/icons/file-docx.png"
          alt={DOCX_FILE}
          width={48}
          height={48}
          unoptimized
        />
        <span className="text-[10px] text-white drop-shadow font-medium text-center break-words leading-tight">
          Nate_OFarrell_
          <br />
          Resume_2026.docx
        </span>
      </button>
      <button
        type="button"
        onClick={() => openApp('projects')}
        className="flex flex-col items-center gap-1 w-20 hover:bg-white/10 rounded-md p-1.5 transition-colors"
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
