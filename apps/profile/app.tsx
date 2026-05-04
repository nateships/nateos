'use client'
import { profileData } from '@/app/profile/data'
import { ProfileIcon } from './icon'

export function ProfileApp() {
  const p = profileData
  return (
    <div className="h-full w-full overflow-auto os-scroll bg-zinc-900/85 text-white">
      <div className="px-8 py-7 flex flex-col gap-6 max-w-2xl mx-auto">
        <header className="flex items-center gap-5">
          <ProfileIcon size={72} />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{p.name}</h1>
            <p className="text-sm opacity-80 mt-1">{p.tagline}</p>
            <p className="text-xs opacity-60 mt-1">{p.location}</p>
          </div>
        </header>

        <section className="text-[14px] leading-relaxed opacity-90 whitespace-pre-line">
          {p.bio}
        </section>

        <section>
          <h2 className="text-[11px] uppercase tracking-wider opacity-60 mb-2">Contact</h2>
          <div className="flex flex-col gap-1 text-sm">
            <a className="text-blue-400 hover:underline" href={`mailto:${p.email}`}>
              {p.email}
            </a>
            {p.phone ? <span className="opacity-80">{p.phone}</span> : null}
          </div>
        </section>

        <section>
          <h2 className="text-[11px] uppercase tracking-wider opacity-60 mb-2">Links</h2>
          <ul className="flex flex-col gap-1.5 text-sm">
            {p.links.map((l) => (
              <li key={l.url}>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
