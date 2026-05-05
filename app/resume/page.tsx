import type { Metadata } from 'next'
import { BASE_OG, BASE_TWITTER } from '@/lib/seo'
import { resumeData } from './data'

const TITLE = "Resume — Nate O'Farrell"
const DESCRIPTION =
  'Director of Infrastructure & Platform Engineering. 15+ years across cloud, on-prem, and HPC.'

export const metadata: Metadata = {
  // Page title goes through the layout template ("%s · NateOS"). Keep it
  // short here so the rendered title is "Resume · NateOS" rather than
  // double-branded ("Resume — Nate O'Farrell · NateOS").
  title: 'Resume',
  description:
    "Nate O'Farrell — Director of Infrastructure & Platform Engineering. Full work history, skills, certifications, and education. PDF + DOCX downloads available.",
  alternates: { canonical: '/resume' },
  // Spread BASE_OG so siteName/locale stay set; override type to 'profile'
  // and url to the resume canonical. Without spread, parent's defaults are
  // wholesale-replaced when this child openGraph is defined.
  openGraph: {
    ...BASE_OG,
    type: 'profile',
    url: '/resume',
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: { ...BASE_TWITTER, title: TITLE, description: DESCRIPTION },
}

/**
 * Server-rendered semantic resume content shipped in the initial HTML so
 * crawlers (Googlebot, Bingbot, social scrapers, LinkedIn) index real text
 * even though the visible UX is the client-side OS shell. `sr-only` keeps it
 * off-screen for sighted users without hiding it from screen readers.
 */
export default function ResumeRoute() {
  const r = resumeData
  return (
    <article className="sr-only" aria-label="Resume">
      <header>
        <h1>Nate O&apos;Farrell — Resume</h1>
        <p>Director of Infrastructure &amp; Platform Engineering · Tewksbury, MA</p>
        <p>nate@nateofarrell.com · +1 (781) 888 2277</p>
      </header>

      <section>
        <h2>Summary</h2>
        <p>{r.summary}</p>
      </section>

      <section>
        <h2>Experience</h2>
        {r.experience.map((role) => (
          <article key={`${role.company}-${role.title}-${role.start}`}>
            <h3>
              {role.title} · {role.company}
            </h3>
            <p>
              {role.start} – {role.end} · {role.location}
            </p>
            <ul>
              {role.bullets.map((b) => (
                <li key={`${role.company}-${role.start}-${b}`}>{b}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      {r.certifications.length > 0 ? (
        <section>
          <h2>Certifications</h2>
          <ul>
            {r.certifications.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section>
        <h2>Education</h2>
        <ul>
          {r.education.map((e) => (
            <li key={e.school}>
              <strong>{e.school}</strong> — {e.program} · {e.years}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Skills</h2>
        <dl>
          {Object.entries(r.skills).map(([k, items]) => (
            <div key={k}>
              <dt>
                <strong>{k}</strong>
              </dt>
              <dd>{items.join(', ')}</dd>
            </div>
          ))}
        </dl>
      </section>
    </article>
  )
}
