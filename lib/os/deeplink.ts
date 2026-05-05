import { byRoute } from './registry'

export function appIdFromPath(pathname: string): string | null {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0) return null
  const direct = `/${segments[0]}`
  return byRoute[direct]?.id ?? null
}

export function paramsFromPath(pathname: string): Record<string, string> | undefined {
  const segments = pathname.split('/').filter(Boolean)
  if (segments[0] === 'projects' && segments[1]) return { slug: segments[1] }
  return undefined
}
