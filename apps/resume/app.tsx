'use client'
import { resumeData } from '@/app/resume/data'

export function ResumeApp() {
  const r = resumeData
  return (
    <div className="os-glass-app h-full w-full overflow-auto os-scroll text-white">
      <div className="max-w-3xl mx-auto px-8 py-7 flex flex-col gap-7">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Nate O'Farrell</h1>
            <p className="text-sm opacity-80 mt-1">
              Director of Infrastructure & Platform Engineering
            </p>
            <p className="text-[12px] opacity-60 mt-1">Tewksbury, MA</p>
            <div className="flex flex-wrap gap-3 mt-2 text-[12px]">
              <a className="text-blue-400 hover:underline" href="mailto:nate@nateofarrell.com">
                nate@nateofarrell.com
              </a>
              <span className="opacity-70">+1 (781) 888 2277</span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5 items-end">
            <a
              href="/Nate_OFarrell_Resume_2026.pdf"
              download="Nate_OFarrell_Resume_2026.pdf"
              className="w-36 text-center px-3 py-1.5 rounded-md bg-blue-500 hover:bg-blue-400 text-white text-[12px] font-medium whitespace-nowrap"
            >
              Download PDF
            </a>
            <a
              href="/Nate_OFarrell_Resume_2026.docx"
              download="Nate_OFarrell_Resume_2026.docx"
              className="w-36 text-center px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white text-[12px] font-medium whitespace-nowrap"
            >
              Download DOCX
            </a>
          </div>
        </header>

        <section>
          <h2 className="text-[11px] uppercase tracking-wider opacity-60 mb-2">Summary</h2>
          <p className="text-[14px] leading-relaxed opacity-90 whitespace-pre-line">{r.summary}</p>
        </section>

        <section>
          <h2 className="text-[11px] uppercase tracking-wider opacity-60 mb-3">Experience</h2>
          <ul className="flex flex-col gap-5">
            {r.experience.map((role) => (
              <li key={`${role.company}-${role.title}-${role.start}`}>
                <div className="flex items-baseline justify-between gap-3 flex-wrap">
                  <h3 className="text-[15px] font-semibold">{role.title}</h3>
                  <span className="text-[12px] opacity-60">
                    {role.start} – {role.end}
                  </span>
                </div>
                <div className="text-[13px] opacity-80 mb-2">
                  {role.company} · {role.location}
                </div>
                <ul className="list-disc pl-5 flex flex-col gap-1 text-[13px] opacity-90">
                  {role.bullets.map((b) => (
                    <li key={`${role.company}-${role.start}-${b}`}>{b}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>

        {r.certifications.length > 0 ? (
          <section>
            <h2 className="text-[11px] uppercase tracking-wider opacity-60 mb-2">Certifications</h2>
            <ul className="text-[13px] opacity-90 flex flex-col gap-0.5">
              {r.certifications.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <section>
          <h2 className="text-[11px] uppercase tracking-wider opacity-60 mb-2">Education</h2>
          <ul className="text-[13px] opacity-90 flex flex-col gap-1">
            {r.education.map((e) => (
              <li key={e.school}>
                <span className="font-medium">{e.school}</span>
                <span className="opacity-70">
                  {' '}
                  · {e.program} · {e.years}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-[11px] uppercase tracking-wider opacity-60 mb-2">Skills</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-[13px]">
            {Object.entries(r.skills).map(([k, items]) => (
              <div key={k}>
                <dt className="font-medium mb-0.5">{k}</dt>
                <dd className="opacity-80">{items.join(', ')}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </div>
  )
}
