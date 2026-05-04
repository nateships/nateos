'use client'
import type { Project } from '@/lib/content/schema'

export function ProjectCard({
  project,
  active,
  onSelect,
}: {
  project: Project
  active: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left px-3 py-2.5 rounded-md transition-colors ${
        active ? 'bg-blue-500/80 text-white' : 'hover:bg-white/5'
      }`}
    >
      <div className="text-[13px] font-medium">{project.title}</div>
      <div className="text-[11px] opacity-70 truncate mt-0.5">{project.summary}</div>
    </button>
  )
}
