import { isJobSearchActive } from '@/lib/job-search'
import type { AppManifest } from '@/lib/os/types'
import { ResumeApp } from './app'
import { ResumeIcon } from './icon'

// When not job hunting the app shows a profile card, so it presents as "About"
// across the dock, window chrome, Spotlight, and the About dialog.
const active = isJobSearchActive()

export const manifest: AppManifest = {
  id: 'resume',
  title: active ? 'Resume' : 'About',
  icon: ResumeIcon,
  route: '/resume',
  component: ResumeApp,
  defaultSize: active ? { w: 900, h: 820 } : { w: 440, h: 560 },
  minSize: { w: 360, h: 320 },
  capabilities: ['resize', 'minimize'],
  surfaces: ['dock', 'launchpad', 'spotlight'],
  category: 'core',
  description: active
    ? 'Full work history, projects, certifications, and skills. PDF export available.'
    : 'Profile card — current role and links.',
}
