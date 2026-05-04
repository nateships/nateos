import type { Profile } from '@/lib/content/schema'
import data from './data.json'

// `data.json` is regenerated from `content/profile.mdx` via
// `bun run scripts/generate-data.ts` (wired to `predev` + `prebuild`).
export const profileData = data as Profile
