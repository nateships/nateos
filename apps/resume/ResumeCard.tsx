'use client'
import { profileData } from '@/app/profile/data'

function linkedinUrl(): string | undefined {
  return profileData.links.find((l) => l.label.toLowerCase() === 'linkedin')?.url
}

export function ResumeCard() {
  const url = linkedinUrl()
  return (
    <div className="os-glass-app h-full w-full overflow-auto os-scroll text-white">
      <div className="max-w-md mx-auto px-8 py-10 flex flex-col gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">{profileData.name}</h1>
        {profileData.currentCompany ? (
          <p className="text-sm opacity-80">Now at {profileData.currentCompany}</p>
        ) : null}
        <p className="text-[14px] leading-relaxed opacity-90">{profileData.tagline}</p>
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="self-start px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-400 text-white text-[13px] font-medium"
          >
            Connect on LinkedIn →
          </a>
        ) : null}
      </div>
    </div>
  )
}
