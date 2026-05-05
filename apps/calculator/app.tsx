'use client'
import { useEffect, useRef, useState } from 'react'
import { type CalcState, calc, initialState, type Op } from './engine'
import { Snake } from './Snake'

const KONAMI = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
]

const BTN = 'h-12 rounded-full text-[16px] font-medium flex items-center justify-center'
const NUM = `${BTN} bg-zinc-700/80 text-white hover:bg-zinc-600`
const FN = `${BTN} bg-zinc-500/80 text-black hover:bg-zinc-400`
const OP_BTN = `${BTN} bg-orange-500 text-white hover:bg-orange-400`

export function CalculatorApp() {
  const [state, setState] = useState<CalcState>(initialState)
  const [snake, setSnake] = useState(false)
  // Track Konami sequence in a ref so the keydown listener can be subscribed
  // once and never need re-subscription on every keystroke.
  const seqRef = useRef<string[]>([])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const next = [...seqRef.current, e.key].slice(-KONAMI.length)
      seqRef.current = next
      if (next.join(',') === KONAMI.join(',')) setSnake(true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (snake) return <Snake onExit={() => setSnake(false)} />

  function digit(d: number) {
    setState((s) => calc(s, { kind: 'digit', d }))
  }
  function op(o: Op) {
    setState((s) => calc(s, { kind: 'op', op: o }))
  }

  return (
    <div className="h-full w-full flex flex-col bg-zinc-900 text-white">
      <div className="flex-1 flex items-end justify-end px-5 py-4 text-[44px] font-light tracking-tight">
        {state.display}
      </div>
      <div className="grid grid-cols-4 gap-2 p-3">
        <button type="button" className={FN} onClick={() => op('AC')}>
          AC
        </button>
        <button type="button" className={FN} onClick={() => op('±')}>
          ±
        </button>
        <button type="button" className={FN} onClick={() => op('%')}>
          %
        </button>
        <button type="button" className={OP_BTN} onClick={() => op('/')}>
          ÷
        </button>

        {[7, 8, 9].map((d) => (
          <button key={d} type="button" className={NUM} onClick={() => digit(d)}>
            {d}
          </button>
        ))}
        <button type="button" className={OP_BTN} onClick={() => op('*')}>
          ×
        </button>

        {[4, 5, 6].map((d) => (
          <button key={d} type="button" className={NUM} onClick={() => digit(d)}>
            {d}
          </button>
        ))}
        <button type="button" className={OP_BTN} onClick={() => op('-')}>
          −
        </button>

        {[1, 2, 3].map((d) => (
          <button key={d} type="button" className={NUM} onClick={() => digit(d)}>
            {d}
          </button>
        ))}
        <button type="button" className={OP_BTN} onClick={() => op('+')}>
          +
        </button>

        <button type="button" className={`${NUM} col-span-2`} onClick={() => digit(0)}>
          0
        </button>
        <button type="button" className={NUM} onClick={() => op('.')}>
          .
        </button>
        <button type="button" className={OP_BTN} onClick={() => op('=')}>
          =
        </button>
      </div>
    </div>
  )
}
