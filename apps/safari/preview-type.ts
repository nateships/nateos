export type PreviewType =
  | { kind: 'youtube'; videoId: string }
  | { kind: 'github'; owner: string; repo: string }
  | { kind: 'og'; url: string }

export function classify(url: string): PreviewType {
  let u: URL
  try {
    u = new URL(url)
  } catch {
    return { kind: 'og', url }
  }
  // YouTube — watch?v= or youtu.be/<id>
  if (u.host.endsWith('youtube.com')) {
    const id = u.searchParams.get('v')
    if (id) return { kind: 'youtube', videoId: id }
  }
  if (u.host === 'youtu.be') {
    const id = u.pathname.replace(/^\//, '').split('/')[0]
    if (id) return { kind: 'youtube', videoId: id }
  }
  // GitHub repo — github.com/owner/repo (must have at least 2 path segments, neither empty)
  if (u.host === 'github.com') {
    const segs = u.pathname.split('/').filter(Boolean)
    if (segs.length >= 2) {
      return { kind: 'github', owner: segs[0], repo: segs[1] }
    }
  }
  return { kind: 'og', url }
}
