import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { renderBody } from '@/apps/projects/markdown'
import { BASE_OG, BASE_TWITTER } from '@/lib/seo'
import { projectsData } from '../data'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return projectsData.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const p = projectsData.find((x) => x.slug === slug)
  if (!p) return { title: 'Project not found' }
  const ogTitle = `${p.title} · NateOS`
  return {
    title: p.title,
    description: p.summary,
    alternates: { canonical: `/projects/${p.slug}` },
    openGraph: {
      ...BASE_OG,
      type: 'article',
      url: `/projects/${p.slug}`,
      title: ogTitle,
      description: p.summary,
    },
    twitter: { ...BASE_TWITTER, title: ogTitle, description: p.summary },
  }
}

export default async function ProjectRoute({ params }: Props) {
  const { slug } = await params
  const p = projectsData.find((x) => x.slug === slug)
  if (!p) notFound()
  return (
    <article className="sr-only" aria-label={p.title}>
      <h1>{p.title}</h1>
      <p>{p.summary}</p>
      <p>
        <strong>Stack:</strong> {p.tech.join(', ')}
      </p>
      {p.repo ? (
        <p>
          <a href={p.repo}>Repository</a>
        </p>
      ) : null}
      {p.url ? (
        <p>
          <a href={p.url}>Visit</a>
        </p>
      ) : null}
      <section>
        <h2>Overview</h2>
        {/* Render the markdown body through the same parser used by the
            visible Projects app so crawlers + screen readers receive proper
            <ul>/<li>/<code> elements rather than literal `- ` characters and
            backticks. */}
        {renderBody(p.body)}
      </section>
    </article>
  )
}
