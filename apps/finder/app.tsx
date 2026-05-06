'use client'
import Image from 'next/image'
import { useState } from 'react'
import { useWindowStore } from '@/lib/os/window-store'
import { listDir, type VfsEntry } from './vfs'

const SIDEBAR: { label: string; path: string }[] = [
  { label: 'Nate', path: '/' },
  { label: 'Projects', path: '/Projects' },
  { label: 'Documents', path: '/Documents' },
  { label: 'Calendar', path: '/Calendar' },
]

function iconFor(entry: VfsEntry): string {
  if (entry.kind === 'folder') return '/apple/icons/GenericFolderIcon.png'
  const name = entry.name.toLowerCase()
  if (name.endsWith('.pdf')) return '/apple/icons/file-pdf.png'
  if (name.endsWith('.docx')) return '/apple/icons/file-docx.png'
  if (name.endsWith('.md')) return '/apple/icons/file-md.png'
  if (name.endsWith('.txt')) return '/apple/icons/file-txt.png'
  if (name.endsWith('.url') || name.endsWith('.app')) return '/apple/icons/safari.png'
  return '/apple/icons/GenericDocumentIcon.png'
}

export function FinderApp() {
  const [cwd, setCwd] = useState('/')
  const openApp = useWindowStore((s) => s.openApp)
  const entries = listDir(cwd)

  function activate(entry: VfsEntry) {
    if (entry.kind === 'folder') {
      setCwd(entry.path)
      return
    }
    if (!entry.open) return
    if (entry.open.startsWith('/projects/')) {
      const slug = entry.open.split('/').pop()
      openApp('projects', { slug })
      return
    }
    if (entry.open === '/resume') openApp('resume')
    else if (entry.open === '/safari') openApp('safari')
    else if (entry.open === '/calendar') openApp('calendar')
    else if (entry.open.endsWith('.pdf') || entry.open.endsWith('.docx')) {
      // Route through /api/file so the response always has Content-Disposition:
      // inline — Vercel's static asset CDN otherwise serves /public docs as
      // attachments and the iframe/object preview triggers a download.
      const name = entry.open.replace(/^\//, '')
      openApp('preview', { src: `/api/file/${name}`, title: entry.name })
    }
  }

  return (
    <div className="os-glass-app h-full w-full flex text-white">
      <aside className="w-44 border-r border-white/10 p-2 text-[12px]">
        <div className="px-2 py-1.5 text-[10px] uppercase tracking-wider opacity-50">Locations</div>
        <ul className="flex flex-col gap-0.5">
          {SIDEBAR.map((s) => (
            <li key={s.path}>
              <button
                type="button"
                onClick={() => setCwd(s.path)}
                className={`w-full text-left px-2 py-1.5 rounded-md ${
                  s.path === cwd ? 'bg-blue-500/80' : 'hover:bg-white/5'
                }`}
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <div className="flex-1 overflow-auto os-scroll p-3">
        <div className="text-[11px] opacity-60 mb-2">{cwd}</div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-3">
          {entries.length === 0 ? (
            <div className="opacity-50 text-[12px] col-span-full">Empty.</div>
          ) : null}
          {entries.map((e) => (
            <button
              key={e.path}
              type="button"
              onDoubleClick={() => activate(e)}
              className="flex flex-col items-center gap-1 p-2 rounded-md hover:bg-white/5 focus:bg-white/10 outline-none"
              title={e.name}
            >
              <Image src={iconFor(e)} alt="" width={48} height={48} unoptimized />
              <div className="text-[11px] text-center break-words leading-tight max-w-full">
                {e.name}
              </div>
            </button>
          ))}
        </div>
        <p className="text-[10px] opacity-50 mt-3">Double-click to open.</p>
      </div>
    </div>
  )
}
