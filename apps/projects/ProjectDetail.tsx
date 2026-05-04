'use client'
import type { Project } from '@/lib/content/schema'

export function ProjectDetail({ project, body }: { project: Project; body: string }) {
  return (
    <article className="px-7 py-6 flex flex-col gap-4">
      <header>
        <h1 className="text-xl font-semibold tracking-tight">{project.title}</h1>
        <p className="text-[13px] opacity-80 mt-1">{project.summary}</p>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {project.tech.map((t) => (
            <span
              key={t}
              className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 border border-white/10"
            >
              {t}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 mt-3 text-[12px]">
          {project.repo ? (
            <a
              className="text-blue-400 hover:underline"
              href={project.repo}
              target="_blank"
              rel="noreferrer"
            >
              Repository ↗
            </a>
          ) : null}
          {project.url ? (
            <a
              className="text-blue-400 hover:underline"
              href={project.url}
              target="_blank"
              rel="noreferrer"
            >
              Link ↗
            </a>
          ) : null}
        </div>
      </header>
      <section className="text-[13px] leading-relaxed opacity-90 whitespace-pre-line">
        {body}
      </section>
    </article>
  )
}
