'use client'
import { useEffect, useRef, useState } from 'react'

const COLS = 16
const ROWS = 20
const TICK = 120

type Point = { x: number; y: number }

function rand(): Point {
  return { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }
}

export function Snake({ onExit }: { onExit: () => void }) {
  const [snake, setSnake] = useState<Point[]>([{ x: 8, y: 10 }])
  const [food, setFood] = useState<Point>(rand)
  const [dir, setDir] = useState<Point>({ x: 1, y: 0 })
  const [dead, setDead] = useState(false)
  const dirRef = useRef(dir)
  dirRef.current = dir

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') return onExit()
      const map: Record<string, Point> = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
      }
      const next = map[e.key]
      if (!next) return
      const cur = dirRef.current
      // Block reversal
      if (next.x + cur.x === 0 && next.y + cur.y === 0) return
      setDir(next)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onExit])

  useEffect(() => {
    if (dead) return
    const t = setInterval(() => {
      // Compute the next state outside of any setState updater so we don't
      // perform side-effects inside a (potentially re-invoked) updater.
      let nextDead = false
      let ate = false
      setSnake((s) => {
        const head = { x: s[0].x + dirRef.current.x, y: s[0].y + dirRef.current.y }
        if (head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS) {
          nextDead = true
          return s
        }
        if (s.some((p) => p.x === head.x && p.y === head.y)) {
          nextDead = true
          return s
        }
        ate = head.x === food.x && head.y === food.y
        const next = [head, ...s]
        if (!ate) next.pop()
        return next
      })
      if (nextDead) setDead(true)
      if (ate) setFood(rand())
    }, TICK)
    return () => clearInterval(t)
  }, [dead, food])

  return (
    <div className="h-full w-full flex flex-col items-center justify-center gap-2 bg-zinc-900 text-white">
      <div className="text-[10px] opacity-60">
        ↑↓←→ to move · Esc to exit{dead ? ' · DEAD — refresh' : ''}
      </div>
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${COLS}, 14px)`,
          gridTemplateRows: `repeat(${ROWS}, 14px)`,
          gap: 1,
        }}
      >
        {Array.from({ length: ROWS * COLS }).map((_, i) => {
          const x = i % COLS
          const y = Math.floor(i / COLS)
          const isSnake = snake.some((p) => p.x === x && p.y === y)
          const isHead = snake[0].x === x && snake[0].y === y
          const isFood = food.x === x && food.y === y
          return (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: grid cells are positional, index = position
              key={i}
              className={`w-[14px] h-[14px] ${
                isHead
                  ? 'bg-emerald-300'
                  : isSnake
                    ? 'bg-emerald-500'
                    : isFood
                      ? 'bg-orange-400'
                      : 'bg-zinc-800'
              }`}
            />
          )
        })}
      </div>
      <button
        type="button"
        onClick={onExit}
        className="mt-2 text-[11px] opacity-60 hover:opacity-100"
      >
        Back to Calculator
      </button>
    </div>
  )
}
