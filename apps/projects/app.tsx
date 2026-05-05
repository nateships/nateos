'use client'
import { useState } from 'react'
import { projectsData } from '@/app/projects/data'
import type { AppContext } from '@/lib/os/types'
import { ProjectCard } from './ProjectCard'
import { ProjectDetail } from './ProjectDetail'

export function ProjectsApp(ctx: AppContext) {
  const initial = (ctx.params?.slug as string | undefined) ?? projectsData[0]?.slug
  const [activeSlug, setActiveSlug] = useState<string>(initial ?? '')
  const active = projectsData.find((p) => p.slug === activeSlug) ?? projectsData[0]
  if (!active) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-zinc-900/95 text-white">
        No projects yet.
      </div>
    )
  }
  return (
    <div className="h-full w-full flex bg-zinc-900/95 text-white">
      <aside className="w-60 border-r border-white/10 p-2 overflow-auto os-scroll">
        <div className="px-2 py-1.5 text-[10px] uppercase tracking-wider opacity-50">Projects</div>
        <div className="flex flex-col gap-0.5">
          {projectsData.map((p) => (
            <ProjectCard
              key={p.slug}
              project={p}
              active={p.slug === active.slug}
              onSelect={() => setActiveSlug(p.slug)}
            />
          ))}
        </div>
      </aside>
      <div className="flex-1 overflow-auto os-scroll">
        <ProjectDetail project={active} body={active.body} />
      </div>
    </div>
  )
}
