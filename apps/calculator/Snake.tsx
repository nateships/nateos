'use client'
import { useEffect, useRef, useState } from 'react'

const COLS = 16
const ROWS = 20
const TICK = 120

type Point = { x: number; y: number }

function rand(): Point {
  return { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }
}

function spawnFood(snake: Point[]): Point {
  // Pick a cell that isn't currently occupied by the snake.
  // Bounded retries since the board is small; falls through to whatever
  // rand() returned last if the snake somehow fills the grid.
  for (let i = 0; i < 200; i++) {
    const p = rand()
    if (!snake.some((s) => s.x === p.x && s.y === p.y)) return p
  }
  return rand()
}

export function Snake({ onExit }: { onExit: () => void }) {
  // Game state lives in refs so the tick loop is free of setState-updater
  // side-effects (which would be invoked twice in StrictMode/concurrent).
  const snakeRef = useRef<Point[]>([{ x: 8, y: 10 }])
  const foodRef = useRef<Point>(spawnFood([{ x: 8, y: 10 }]))
  const dirRef = useRef<Point>({ x: 1, y: 0 })
  const [dead, setDead] = useState(false)
  // Bumped every tick to trigger a re-render; the actual game state lives
  // in the refs above.
  const [, force] = useState(0)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        // Mark the event handled so a global ESC listener (e.g. exit-
        // fullscreen on WindowLayer) doesn't also fire on the same press.
        e.preventDefault()
        onExit()
        return
      }
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
      dirRef.current = next
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onExit])

  useEffect(() => {
    if (dead) return
    const t = setInterval(() => {
      const s = snakeRef.current
      const head = { x: s[0].x + dirRef.current.x, y: s[0].y + dirRef.current.y }
      if (head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS) {
        setDead(true)
        return
      }
      if (s.some((p) => p.x === head.x && p.y === head.y)) {
        setDead(true)
        return
      }
      const food = foodRef.current
      const ate = head.x === food.x && head.y === food.y
      const next = [head, ...s]
      if (!ate) next.pop()
      snakeRef.current = next
      if (ate) foodRef.current = spawnFood(next)
      force((n) => (n + 1) % 1_000_000)
    }, TICK)
    return () => clearInterval(t)
  }, [dead])

  const snake = snakeRef.current
  const food = foodRef.current

  return (
    <div className="os-glass-app h-full w-full flex flex-col items-center justify-center gap-2 text-white">
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
