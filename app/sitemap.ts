import type { MetadataRoute } from 'next'
import { projectsData } from './projects/data'

const SITE_URL = 'https://nate.cx'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const top: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${SITE_URL}/resume`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/projects`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/safari`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/messages`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${SITE_URL}/calendar`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${SITE_URL}/terminal`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/finder`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/settings`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/calculator`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ]
  const projects: MetadataRoute.Sitemap = projectsData.map((p) => ({
    url: `${SITE_URL}/projects/${p.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))
  return [...top, ...projects]
}
