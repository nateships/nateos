/**
 * Safe localStorage wrappers — Safari Private Mode, embedded WebViews, and
 * users with storage disabled all throw on access. Centralizing the
 * try/catch here keeps call sites focused on intent.
 */

export function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function safeSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Quota exceeded, private mode, or storage disabled — drop silently.
  }
}

export function safeRemove(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    // ignore
  }
}
