import type { Metadata } from 'next'
import { BASE_OG, BASE_TWITTER } from '@/lib/seo'
import { projectsData } from './data'

const TITLE = "Projects — Nate O'Farrell"
const DESCRIPTION =
  'Selected projects spanning open-source HPC platforms, indie macOS apps, and AWS re:Invent talks.'

export const metadata: Metadata = {
  title: 'Projects',
  description:
    'Selected projects: NateOS portfolio, IDEA HPC platform powering Commonwealth Fusion Systems, Sleepbar indie macOS app, AWS re:Invent 2022 talk on cloud HPC for fusion.',
  alternates: { canonical: '/projects' },
  openGraph: { ...BASE_OG, title: TITLE, description: DESCRIPTION, url: '/projects' },
  twitter: { ...BASE_TWITTER, title: TITLE, description: DESCRIPTION },
}

export default function ProjectsRoute() {
  return (
    <section className="sr-only" aria-label="Projects">
      <h1>Projects</h1>
      <p>
        Selected projects spanning open-source HPC platforms, indie macOS apps, and AWS re:Invent
        talks.
      </p>
      <ul>
        {projectsData.map((p) => (
          <li key={p.slug}>
            <h2>{p.title}</h2>
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
            <p>
              <a href={`/projects/${p.slug}`}>Read more</a>
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
