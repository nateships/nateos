'use client'
import Image from 'next/image'
import { useState } from 'react'
import { type ProjectWithBody, projectsData } from '@/app/projects/data'
import type { AppContext } from '@/lib/os/types'
import { renderBody } from './markdown'

function ProjectMedia({ p }: { p: ProjectWithBody }) {
  if (p.youtube) {
    return (
      <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-white/10 bg-black">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(p.youtube)}`}
          title={p.title}
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    )
  }
  if (p.hero) {
    return (
      <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-white/10 bg-zinc-900">
        <Image src={p.hero} alt={p.title} fill sizes="800px" style={{ objectFit: 'cover' }} />
      </div>
    )
  }
  return null
}

// Short labels for the mobile switcher so all entries fit in one row without
// horizontal scroll. Falls back to the full title for unknown slugs.
const SHORT_LABELS: Record<string, string> = {
  nateos: 'NateOS',
  idea: 'IDEA',
  sleepbar: 'Sleepbar',
  'reinvent-2022': 're:Invent',
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[10px] font-semibold tracking-[0.08em] uppercase opacity-50">{children}</h3>
  )
}

export function ProjectsApp(ctx: AppContext) {
  const initialSlug = (ctx.params?.slug as string | undefined) ?? projectsData[0]?.slug ?? ''
  const [activeSlug, setActiveSlug] = useState<string>(initialSlug)
  const active = projectsData.find((p) => p.slug === activeSlug) ?? projectsData[0]

  if (!active) {
    return (
      <div className="os-glass-app h-full w-full flex items-center justify-center text-white">
        No projects yet.
      </div>
    )
  }

  return (
    <div className="os-glass-app h-full w-full flex text-white">
      {/* Native source list — Music/Photos style. */}
      <aside className="hidden sm:flex w-56 shrink-0 border-r border-white/10 flex-col">
        <div className="px-3 pt-3 pb-1.5 text-[10px] font-semibold tracking-[0.08em] uppercase opacity-50">
          Projects
        </div>
        <div className="flex flex-col px-2 pb-2 gap-0.5 overflow-auto os-scroll">
          {projectsData.map((p) => {
            const isActive = p.slug === active.slug
            return (
              <button
                key={p.slug}
                type="button"
                onClick={() => setActiveSlug(p.slug)}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                  isActive ? 'bg-blue-500 text-white' : 'hover:bg-white/[0.06] text-white/85'
                }`}
              >
                <div className="text-[12.5px] font-medium leading-tight">{p.title}</div>
                <div
                  className={`text-[11px] leading-snug mt-0.5 line-clamp-2 ${
                    isActive ? 'text-white/85' : 'text-white/55'
                  }`}
                >
                  {p.summary}
                </div>
              </button>
            )
          })}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile-only switcher — segmented control. All projects share the row width. */}
        <nav
          aria-label="Projects"
          className="sm:hidden flex gap-1 px-3 py-2.5 border-b border-white/10 shrink-0"
        >
          {projectsData.map((p) => {
            const isActive = p.slug === active.slug
            const label = SHORT_LABELS[p.slug] ?? p.title
            return (
              <button
                key={p.slug}
                type="button"
                onClick={() => setActiveSlug(p.slug)}
                className={`flex-1 min-w-0 px-1 py-1 rounded-md text-[12px] font-medium truncate transition-colors ${
                  isActive ? 'bg-blue-500 text-white' : 'text-white/75 hover:bg-white/10'
                }`}
              >
                {label}
              </button>
            )
          })}
        </nav>

        <div key={active.slug} className="proj-fade flex-1 overflow-auto os-scroll">
          <article className="max-w-[42rem] mx-auto px-7 py-7 flex flex-col gap-7">
            <header className="flex flex-col gap-2">
              <h2 className="text-[22px] font-semibold tracking-tight leading-tight">
                {active.title}
              </h2>
              <p className="text-[13px] opacity-75 leading-relaxed">{active.summary}</p>
            </header>

            {(active.youtube || active.hero) && <ProjectMedia p={active} />}

            <section className="flex flex-col gap-2">
              <SectionHeader>Stack</SectionHeader>
              <div className="flex flex-wrap gap-1.5">
                {active.tech.map((t) => (
                  <span
                    key={t}
                    className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 border border-white/10"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </section>

            {active.repo || active.url ? (
              <section className="flex flex-col gap-2">
                <SectionHeader>Links</SectionHeader>
                <div className="flex flex-wrap gap-2">
                  {active.repo ? (
                    <a
                      href={active.repo}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/15 text-[12px] font-medium"
                    >
                      Repository ↗
                    </a>
                  ) : null}
                  {active.url ? (
                    <a
                      href={active.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-md bg-blue-500 hover:bg-blue-400 text-white text-[12px] font-medium"
                    >
                      Visit ↗
                    </a>
                  ) : null}
                </div>
              </section>
            ) : null}

            <section className="flex flex-col gap-2">
              <SectionHeader>Overview</SectionHeader>
              {renderBody(active.body)}
            </section>
          </article>
        </div>
      </div>
    </div>
  )
}
