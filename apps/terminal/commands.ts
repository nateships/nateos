import { registry } from '@/lib/os/registry'
import { useSettings } from '@/lib/settings/store'

export type CommandContext = {
  openApp(appId: string, params?: Record<string, unknown>): string
  closeWindow(windowId: string): void
}

const ABOUT =
  "Nate O'Farrell — Director of Infrastructure & Platform Engineering at\n" +
  'Commonwealth Fusion Systems. 15+ years building distributed systems.\n' +
  'Hands-on builder. Tewksbury, MA. nate@nateofarrell.com'

const HELP_LINES = [
  'help                       show this message',
  'apps                       list available apps',
  'open <app>                 open an app',
  'whoami                     who is running NateOS',
  'ls [path]                  list /content',
  'cat <file>                 print a content file',
  'cd <path>                  (cosmetic) change pwd display',
  'clear                      clear screen',
  'theme <classic|tahoe>      toggle era',
  'about                      one-paragraph bio',
  'contact                    open Messages app',
  'resume                     open Resume app',
  'sudo hire-me               (try it)',
]

const VFS: Record<string, string[] | string> = {
  '/': ['resume.mdx', 'projects/', 'links.mdx'],
  '/projects/': ['idea.mdx', 'sleepbar.mdx', 'reinvent-2022.mdx', '_index.mdx'],
}

export async function runCommand(raw: string, ctx: CommandContext): Promise<string> {
  const parts = raw.trim().split(/\s+/)
  const cmd = parts[0]
  const args = parts.slice(1)

  switch (cmd) {
    case 'help':
      return HELP_LINES.join('\n')
    case 'apps':
      return registry.map((m) => `  ${m.id.padEnd(12)} ${m.title}`).join('\n')
    case 'open': {
      const id = args[0]
      if (!id) return 'usage: open <app>'
      const exists = registry.find((m) => m.id === id)
      if (!exists) return `nateos: unknown app: ${id}`
      ctx.openApp(id, undefined)
      return ''
    }
    case 'whoami':
      return 'nate (Director of Infra @ CFS — hands-on builder)'
    case 'ls': {
      const path = args[0] ?? '/'
      const norm = path.endsWith('/') || path === '/' ? path : `${path}/`
      const entry = VFS[norm]
      if (!entry) return `ls: ${path}: no such directory`
      return Array.isArray(entry) ? entry.join('  ') : entry
    }
    case 'cat': {
      const file = args[0]
      if (!file) return 'usage: cat <file>'
      try {
        const r = await fetch(`/api/content?file=${encodeURIComponent(file)}`)
        if (!r.ok) return `cat: ${file}: ${r.status} ${r.statusText}`
        return await r.text()
      } catch (e) {
        return `cat: ${e instanceof Error ? e.message : 'unknown error'}`
      }
    }
    case 'cd': {
      return ''
    }
    case 'clear':
      return '__CLEAR__'
    case 'theme': {
      const arg = args[0]
      if (!arg || !['classic', 'tahoe'].includes(arg)) {
        return 'usage: theme <classic|tahoe>'
      }
      useSettings.getState().setEra(arg as 'classic' | 'tahoe')
      return `theme set to ${arg}.`
    }
    case 'about':
      return ABOUT
    case 'contact':
      ctx.openApp('messages')
      return ''
    case 'resume':
      ctx.openApp('resume')
      return ''
    case 'sudo': {
      if (args[0] === 'hire-me') {
        ctx.openApp('messages')
        return 'Permission granted. Opening Messages…'
      }
      return `nateos: ${args.join(' ')}: sudo not supported. Try 'sudo hire-me'.`
    }
    case '':
      return ''
    default:
      return `nateos: command not found: ${cmd}. Type 'help' for available commands.`
  }
}
