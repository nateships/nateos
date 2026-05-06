'use client'
import { useEffect, useRef, useState } from 'react'
import { safeGet, safeSet } from '@/lib/storage'
import type { ChatMessage, SendBody } from './types'

const STORAGE_KEY = 'nateos.messages'
// Cap persisted history so a long-lived session doesn't bloat localStorage.
const MESSAGES_CAP = 200

export function MessagesApp() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window === 'undefined') return []
    const raw = safeGet(STORAGE_KEY)
    if (!raw) return []
    try {
      return JSON.parse(raw) as ChatMessage[]
    } catch {
      return []
    }
  })
  const [input, setInput] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [context, setContext] = useState<SendBody['context']>('other')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    const trimmed = messages.length > MESSAGES_CAP ? messages.slice(-MESSAGES_CAP) : messages
    safeSet(STORAGE_KEY, JSON.stringify(trimmed))
  }, [messages])

  async function send() {
    setError(null)
    const body = input.trim()
    if (!body || !name.trim() || !email.includes('@')) {
      setError('Name, email, and message required.')
      return
    }
    setSending(true)
    const visitorMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'visitor',
      text: body,
      ts: Date.now(),
    }
    setMessages((m) => [...m, visitorMsg])
    setInput('')
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, email, context, body } satisfies SendBody),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: 'system',
          text: 'Delivered. Nate replies from nate@nateofarrell.com — usually within a day.',
          ts: Date.now(),
        },
      ])
    } catch (e) {
      setError(`Couldn't send: ${e instanceof Error ? e.message : 'unknown error'}`)
      setMessages((m) =>
        m.map((x) => (x.id === visitorMsg.id ? { ...x, text: `${x.text} ⚠ delivery failed` } : x)),
      )
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="os-glass-app h-full w-full flex flex-col text-white">
      <header className="px-5 py-3 border-b border-white/10">
        <h1 className="text-[14px] font-semibold">Nate O'Farrell</h1>
        <p className="text-[11px] opacity-60">iMessage · delivered to nate@nateofarrell.com</p>
      </header>

      <div className="flex-1 overflow-auto os-scroll px-4 pt-3 pb-4 flex flex-col gap-2">
        {messages.length === 0 ? (
          <p className="text-[12px] opacity-50 self-center text-center max-w-[80%]">
            Send a message — it lands in Nate's inbox via Resend.
          </p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-[80%] px-3 py-2 rounded-2xl text-[13px] ${
                m.role === 'visitor'
                  ? 'self-end bg-blue-500 text-white rounded-br-md'
                  : 'self-start bg-white/10 text-white rounded-bl-md'
              }`}
            >
              {m.text}
            </div>
          ))
        )}
      </div>

      <div className="px-4 py-3 border-t border-white/10 flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="bg-white/5 rounded-md px-3 py-1.5 text-[12px] outline-none focus:ring-1 focus:ring-blue-500"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            className="bg-white/5 rounded-md px-3 py-1.5 text-[12px] outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <select
          value={context}
          onChange={(e) => setContext(e.target.value as SendBody['context'])}
          className="bg-white/5 rounded-md px-3 py-1.5 text-[12px] outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="recruiter">Recruiter / hiring manager</option>
          <option value="engineer">Engineering peer</option>
          <option value="other">Other</option>
        </select>
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Write a message…"
            rows={2}
            className="flex-1 bg-white/5 rounded-md px-3 py-2 text-[13px] outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send()
            }}
          />
          <button
            type="button"
            disabled={sending}
            onClick={send}
            className="px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white text-[12px] font-medium"
          >
            {sending ? 'Sending…' : 'Send'}
          </button>
        </div>
        {error ? <p className="text-red-400 text-[11px]">{error}</p> : null}
      </div>
    </div>
  )
}
