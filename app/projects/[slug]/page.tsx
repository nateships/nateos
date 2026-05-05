import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { projectsData } from '../data'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return projectsData.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const p = projectsData.find((x) => x.slug === slug)
  if (!p) return { title: 'Project not found' }
  const url = `https://nate.cx/projects/${p.slug}`
  return {
    title: p.title,
    description: p.summary,
    alternates: { canonical: `/projects/${p.slug}` },
    openGraph: {
      title: `${p.title} · NateOS`,
      description: p.summary,
      url,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${p.title} · NateOS`,
      description: p.summary,
    },
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
        <p>{p.body}</p>
      </section>
    </article>
  )
}
