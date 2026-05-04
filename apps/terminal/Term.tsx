'use client'
import { useEffect, useRef, useState } from 'react'
import { type CommandContext, runCommand } from './commands'

const BANNER = `
███╗   ██╗ █████╗ ████████╗███████╗ ██████╗ ███████╗
████╗  ██║██╔══██╗╚══██╔══╝██╔════╝██╔═══██╗██╔════╝
██╔██╗ ██║███████║   ██║   █████╗  ██║   ██║███████╗
██║╚██╗██║██╔══██║   ██║   ██╔══╝  ██║   ██║╚════██║
██║ ╚████║██║  ██║   ██║   ███████╗╚██████╔╝███████║
╚═╝  ╚═══╝╚═╝  ╚═╝   ╚═╝   ╚══════╝ ╚═════╝ ╚══════╝  v1.0
`

type Line = { kind: 'in' | 'out' | 'sys'; text: string }

export function Term({ ctx }: { ctx: CommandContext }) {
  const [history, setHistory] = useState<Line[]>([
    { kind: 'sys', text: BANNER },
    { kind: 'sys', text: 'welcome · Director of Infra @ Commonwealth Fusion · Tewksbury, MA' },
    { kind: 'sys', text: 'type `help` for commands · `apps` to list · `open <app>`' },
  ])
  const [input, setInput] = useState('')
  const [stack, setStack] = useState<string[]>([])
  const [_stackIdx, setStackIdx] = useState<number>(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on every history change
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [history])

  async function submit() {
    const cmd = input.trim()
    if (!cmd) return
    setHistory((h) => [...h, { kind: 'in', text: `nate@nateos ~ $ ${cmd}` }])
    setStack((s) => [...s, cmd])
    setStackIdx(-1)
    setInput('')
    const out = await runCommand(cmd, ctx)
    if (out === '__CLEAR__') {
      setHistory([])
      return
    }
    if (out) setHistory((h) => [...h, { kind: 'out', text: out }])
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      submit()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setStackIdx((i) => {
        const n = i < 0 ? stack.length - 1 : Math.max(0, i - 1)
        setInput(stack[n] ?? '')
        return n
      })
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setStackIdx((i) => {
        if (i < 0) return -1
        const n = i + 1
        if (n >= stack.length) {
          setInput('')
          return -1
        }
        setInput(stack[n] ?? '')
        return n
      })
    } else if (e.key === 'Tab') {
      e.preventDefault()
      const candidates = [
        'help',
        'apps',
        'open',
        'whoami',
        'ls',
        'cat',
        'cd',
        'clear',
        'theme',
        'about',
        'contact',
        'resume',
      ]
      const m = candidates.filter((c) => c.startsWith(input))
      if (m.length === 1) setInput(m[0])
    }
  }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: terminal pane focuses input on background click
    // biome-ignore lint/a11y/useKeyWithClickEvents: input itself handles keyboard
    <div
      className="h-full w-full p-3 text-[13px] font-mono leading-relaxed text-white/90"
      style={{ background: 'rgba(20,20,24,0.92)' }}
      onClick={() => inputRef.current?.focus()}
    >
      <div ref={scrollRef} className="h-[calc(100%-1.5rem)] overflow-auto whitespace-pre-wrap">
        {history.map((l, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: history is append-only
            key={i}
            className={
              l.kind === 'sys' ? 'text-cyan-300/80' : l.kind === 'in' ? 'text-emerald-300' : ''
            }
          >
            {l.text}
          </div>
        ))}
      </div>
      <div className="flex gap-1.5">
        <span className="text-emerald-300">nate@nateos</span>
        <span className="text-sky-300">~</span>
        <span>$</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          className="flex-1 bg-transparent outline-none caret-emerald-300"
          spellCheck={false}
          autoComplete="off"
        />
      </div>
    </div>
  )
}
