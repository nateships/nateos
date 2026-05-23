'use client'
import type { ReactNode } from 'react'
import { profileData } from '@/app/profile/data'

function findLink(label: string): string | undefined {
  return profileData.links.find((l) => l.label.toLowerCase() === label.toLowerCase())?.url
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

type SocialLink = { href: string; label: string; external: boolean; icon: ReactNode }

function buildLinks(): SocialLink[] {
  const linkedin = findLink('linkedin')
  const github = findLink('github')
  const links: SocialLink[] = []
  if (linkedin)
    links.push({ href: linkedin, label: 'LinkedIn', external: true, icon: <LinkedInIcon /> })
  if (github) links.push({ href: github, label: 'GitHub', external: true, icon: <GitHubIcon /> })
  if (profileData.email)
    links.push({
      href: `mailto:${profileData.email}`,
      label: 'Email',
      external: false,
      icon: <MailIcon />,
    })
  return links
}

export function ResumeCard() {
  const links = buildLinks()
  return (
    <div className="os-glass-app h-full w-full overflow-auto os-scroll text-white">
      <div className="min-h-full flex items-center justify-center px-8 py-12">
        <div className="card-rise flex max-w-sm flex-col items-center text-center">
          <div className="card-pop relative mb-6">
            <div className="-inset-1.5 absolute rounded-full bg-gradient-to-br from-blue-400 to-blue-500 opacity-50 blur-lg" />
            <div className="relative grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-blue-400 shadow-black/40 shadow-xl ring-1 ring-white/20">
              <span className="font-semibold text-2xl text-white/95 tracking-wide">
                {initials(profileData.name)}
              </span>
            </div>
          </div>

          <h1 className="font-semibold text-[26px] leading-tight tracking-tight">
            {profileData.name}
          </h1>
          <p className="mt-2 max-w-xs text-[14px] text-white/65 leading-relaxed">
            {profileData.tagline}
          </p>

          {profileData.currentCompany ? (
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[12px] text-white/80">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
              Now at {profileData.currentCompany}
            </div>
          ) : null}

          {profileData.location ? (
            <p className="mt-2 text-[12px] text-white/45">{profileData.location}</p>
          ) : null}

          {links.length > 0 ? (
            <div className="mt-8 flex items-center gap-3">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  aria-label={link.label}
                  title={link.label}
                  {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/10 text-white/80 transition-colors hover:border-white/20 hover:bg-white/20 hover:text-white"
                >
                  {link.icon}
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.05-.02-2.06-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.39 1.24-3.23-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.92 1.24 3.23 0 4.62-2.81 5.64-5.49 5.94.43.37.81 1.1.81 2.22 0 1.6-.01 2.89-.01 3.29 0 .32.22.7.83.58A12.01 12.01 0 0 0 24 12.5C24 5.87 18.63.5 12 .5z" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  )
}
