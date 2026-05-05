/**
 * Shared SEO constants. Per-page metadata objects fully REPLACE (not merge
 * with) parent layout's `openGraph` / `twitter`, so each page that overrides
 * those nested objects must spread `BASE_OG` / `BASE_TWITTER` to preserve
 * `type`, `siteName`, `locale`, and the card style.
 */
export const SITE_URL = 'https://nate.cx'
export const SITE_NAME = 'NateOS'

export const BASE_OG = {
  type: 'website' as const,
  siteName: SITE_NAME,
  locale: 'en_US',
  url: SITE_URL,
}

export const BASE_TWITTER = {
  card: 'summary_large_image' as const,
}
