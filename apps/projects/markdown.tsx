import type { ReactNode } from 'react'

type Block = { kind: 'p'; text: string } | { kind: 'ul'; items: string[] }

/**
 * Tiny markdown subset parser for project bodies. Recognizes:
 *  - blank lines as paragraph/list breaks
 *  - lines starting with `- ` as list items
 *  - leading-whitespace continuation lines as part of the previous item
 *  - everything else as paragraph text (joined within a block)
 *
 * Inline `code spans` are turned into <code> elements at render time.
 */
export function parseBody(body: string): Block[] {
  const blocks: Block[] = []
  let curUl: { kind: 'ul'; items: string[] } | null = null

  for (const raw of body.split('\n')) {
    const trimmed = raw.trim()
    if (!trimmed) {
      if (curUl) {
        blocks.push(curUl)
        curUl = null
      }
      continue
    }
    if (trimmed.startsWith('- ')) {
      if (!curUl) curUl = { kind: 'ul', items: [] }
      curUl.items.push(trimmed.slice(2).trim())
      continue
    }
    if (curUl && (raw.startsWith('  ') || raw.startsWith('\t'))) {
      const items = curUl.items
      items[items.length - 1] = `${items[items.length - 1]} ${trimmed}`
      continue
    }
    if (curUl) {
      blocks.push(curUl)
      curUl = null
    }
    const last = blocks[blocks.length - 1]
    if (last && last.kind === 'p') last.text = `${last.text} ${trimmed}`
    else blocks.push({ kind: 'p', text: trimmed })
  }
  if (curUl) blocks.push(curUl)
  return blocks
}

function renderInline(text: string): ReactNode[] {
  const parts: ReactNode[] = []
  const re = /`([^`]+)`/g
  let last = 0
  let i = 0
  let m = re.exec(text)
  while (m !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index))
    parts.push(
      <code key={`c${i++}`} className="px-1 py-0.5 rounded bg-white/10 text-[12px] font-mono">
        {m[1]}
      </code>,
    )
    last = m.index + m[0].length
    m = re.exec(text)
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}

export function renderBody(body: string): ReactNode {
  const blocks = parseBody(body)
  return (
    <div className="flex flex-col gap-3 text-[13px] leading-relaxed opacity-90">
      {blocks.map((b, i) =>
        b.kind === 'p' ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: block index is stable for static content
          <p key={`p${i}`}>{renderInline(b.text)}</p>
        ) : (
          // biome-ignore lint/suspicious/noArrayIndexKey: block index is stable for static content
          <ul key={`u${i}`} className="list-disc pl-5 flex flex-col gap-1.5">
            {b.items.map((it, j) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: item index is stable for static content
              <li key={`u${i}-${j}`}>{renderInline(it)}</li>
            ))}
          </ul>
        ),
      )}
    </div>
  )
}
