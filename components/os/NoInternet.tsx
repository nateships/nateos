'use client'
import { useEffect, useRef, useState } from 'react'

const W = 600
const H = 150
const GROUND_Y = 120
const TREX_X = 24
const GRAVITY = 0.6
const JUMP = 11
const START_SPEED = 5
const FG = '#535353'
const FG_DIM = '#a8a8a8'
const CLOUD = '#d4d4d4'

type Cactus = { x: number; variant: 0 | 1 | 2; w: number }
type Cloud = { x: number; y: number }
type GameState = 'idle' | 'running' | 'over'

function CACTUS_W(variant: 0 | 1 | 2): number {
  return variant === 0 ? 16 : variant === 1 ? 20 : 24
}

/** Pixelated dinosaur silhouette, right-facing. Drawn on a 22×24 grid scaled 2× to ~44×48px. */
function Trex({
  feetY,
  frame,
  dead,
  idle,
}: {
  feetY: number
  frame: 0 | 1
  dead: boolean
  idle: boolean
}) {
  const top = feetY - 48
  const showAnim = !idle && !dead
  return (
    <g transform={`translate(${TREX_X}, ${top}) scale(2)`}>
      <g fill={FG}>
        {/* Head */}
        <rect x="13" y="0" width="8" height="3" />
        <rect x="13" y="3" width="8" height="3" />
        <rect x="13" y="6" width="6" height="2" />
        <rect x="20" y="6" width="1" height="1" />
        {/* Eye */}
        {dead ? (
          <>
            <rect x="17" y="2" width="1" height="1" />
            <rect x="19" y="2" width="1" height="1" />
            <rect x="18" y="3" width="1" height="1" />
            <rect x="17" y="4" width="1" height="1" />
            <rect x="19" y="4" width="1" height="1" />
          </>
        ) : (
          <rect x="18" y="3" width="1" height="1" fill="white" />
        )}
        {/* Neck */}
        <rect x="11" y="8" width="5" height="2" />
        {/* Body */}
        <rect x="6" y="10" width="9" height="6" />
        <rect x="6" y="16" width="8" height="1" />
        {/* Tail */}
        <rect x="2" y="11" width="4" height="3" />
        <rect x="0" y="12" width="2" height="2" />
        {/* Tiny arm */}
        <rect x="13" y="12" width="2" height="1" />
        {/* Legs */}
        {!showAnim ? (
          <>
            <rect x="6" y="17" width="3" height="5" />
            <rect x="11" y="17" width="3" height="5" />
            <rect x="6" y="22" width="2" height="1" />
            <rect x="11" y="22" width="2" height="1" />
          </>
        ) : frame === 0 ? (
          <>
            <rect x="6" y="17" width="3" height="5" />
            <rect x="6" y="22" width="2" height="1" />
            <rect x="11" y="17" width="3" height="3" />
          </>
        ) : (
          <>
            <rect x="6" y="17" width="3" height="3" />
            <rect x="11" y="17" width="3" height="5" />
            <rect x="11" y="22" width="2" height="1" />
          </>
        )}
      </g>
    </g>
  )
}

function CactusShape({ c }: { c: Cactus }) {
  if (c.variant === 0) {
    // Small single
    return (
      <g transform={`translate(${c.x}, ${GROUND_Y - 30})`} fill={FG}>
        <rect x="5" y="0" width="6" height="30" />
        <rect x="0" y="8" width="5" height="14" />
        <rect x="11" y="6" width="5" height="16" />
      </g>
    )
  }
  if (c.variant === 1) {
    // Tall single
    return (
      <g transform={`translate(${c.x}, ${GROUND_Y - 44})`} fill={FG}>
        <rect x="7" y="0" width="6" height="44" />
        <rect x="0" y="12" width="7" height="20" />
        <rect x="13" y="8" width="7" height="22" />
      </g>
    )
  }
  // Grouped
  return (
    <g transform={`translate(${c.x}, ${GROUND_Y - 28})`} fill={FG}>
      <rect x="0" y="0" width="6" height="28" />
      <rect x="9" y="4" width="6" height="24" />
      <rect x="18" y="0" width="6" height="28" />
    </g>
  )
}

function CloudShape({ c }: { c: Cloud }) {
  return (
    <g transform={`translate(${c.x}, ${c.y})`} fill={CLOUD}>
      <rect x="8" y="0" width="22" height="4" />
      <rect x="4" y="4" width="32" height="4" />
      <rect x="0" y="8" width="40" height="3" />
      <rect x="6" y="11" width="32" height="2" />
    </g>
  )
}

/**
 * Chrome-style "No internet" page with a pixel-art dinosaur runner.
 *
 * Game state lives in refs because the tick loop mutates ~60×/s and using
 * setState would tank perf and trip StrictMode double-invocation issues.
 */
export function NoInternet({ onClose }: { onClose: () => void }) {
  const feetY = useRef(GROUND_Y)
  const vy = useRef(0)
  const cacti = useRef<Cactus[]>([])
  const clouds = useRef<Cloud[]>([
    { x: 100, y: 30 },
    { x: 320, y: 50 },
    { x: 500, y: 25 },
  ])
  const score = useRef(0)
  const speed = useRef(START_SPEED)
  const frameCounter = useRef(0)
  const stateRef = useRef<GameState>('idle')
  const hi = useRef(0)
  // Timestamp of the last collision. Used to lock out restart input briefly
  // so the same keypress that landed on a cactus can't auto-restart the game.
  const deathAtRef = useRef(0)
  const [, force] = useState(0)

  function startOrJump() {
    if (stateRef.current === 'idle') {
      stateRef.current = 'running'
      return
    }
    if (stateRef.current === 'over') {
      // Grace window after death — ignore restart input for 350ms.
      if (Date.now() - deathAtRef.current < 350) return
      feetY.current = GROUND_Y
      vy.current = 0
      cacti.current = []
      score.current = 0
      speed.current = START_SPEED
      frameCounter.current = 0
      stateRef.current = 'running'
      return
    }
    if (feetY.current >= GROUND_Y) vy.current = -JUMP
  }

  useEffect(() => {
    function key(e: KeyboardEvent) {
      if (e.key === 'Escape') return onClose()
      if (e.key === ' ' || e.code === 'Space' || e.key === 'ArrowUp') {
        e.preventDefault()
        // Ignore OS key-autorepeat so a held space doesn't punch through the
        // death lockout and instantly restart.
        if (e.repeat) return
        startOrJump()
      }
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [onClose])

  useEffect(() => {
    let raf = 0
    function tick() {
      const st = stateRef.current
      if (st === 'running') {
        // Physics
        vy.current += GRAVITY
        feetY.current = Math.min(GROUND_Y, feetY.current + vy.current)
        if (feetY.current >= GROUND_Y) vy.current = 0
        // Scroll cacti
        cacti.current = cacti.current
          .map((c) => ({ ...c, x: c.x - speed.current }))
          .filter((c) => c.x + c.w > -10)
        // Spawn cactus
        const last = cacti.current[cacti.current.length - 1]
        const minGap = 180 + Math.random() * 120
        if (!last || last.x < W - minGap) {
          if (Math.random() < 0.04) {
            const variant = Math.floor(Math.random() * 3) as 0 | 1 | 2
            cacti.current.push({ x: W + 10, variant, w: CACTUS_W(variant) })
          }
        }
        // Scroll clouds (slower)
        clouds.current = clouds.current.map((c) => ({
          ...c,
          x: c.x - speed.current * 0.3,
        }))
        for (const c of clouds.current) {
          if (c.x < -50) {
            c.x = W + Math.random() * 80
            c.y = 15 + Math.random() * 40
          }
        }
        // Collision: trex bounding box ≈ x [TREX_X+8, TREX_X+38], top [feetY-44, feetY-2]
        const tx1 = TREX_X + 8
        const tx2 = TREX_X + 38
        const ty1 = feetY.current - 44
        const ty2 = feetY.current - 2
        for (const c of cacti.current) {
          const cTop =
            c.variant === 0 ? GROUND_Y - 30 : c.variant === 1 ? GROUND_Y - 44 : GROUND_Y - 28
          const cx1 = c.x
          const cx2 = c.x + c.w
          if (cx2 > tx1 && cx1 < tx2 && ty2 > cTop) {
            stateRef.current = 'over'
            deathAtRef.current = Date.now()
            if (score.current > hi.current) hi.current = score.current
            break
          }
        }
        score.current += 1
        speed.current = START_SPEED + score.current / 600
        frameCounter.current += 1
      }
      force((n) => (n + 1) % 1_000_000)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const st = stateRef.current
  const dead = st === 'over'
  const idle = st === 'idle'
  const frame: 0 | 1 = (Math.floor(frameCounter.current / 6) % 2) as 0 | 1
  const scoreText = String(Math.floor(score.current / 5)).padStart(5, '0')
  const hiText = String(Math.floor(hi.current / 5)).padStart(5, '0')

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: backdrop click to dismiss
    // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard handled by window listener
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* biome-ignore lint/a11y/noStaticElementInteractions: stop-prop on inner card */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: dialog has its own key handler */}
      <div
        className="bg-white text-zinc-900 rounded-lg p-7 shadow-2xl"
        style={{ width: W + 56 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4 mb-5">
          <div className="text-zinc-700">
            <svg width="36" height="40" viewBox="0 0 22 24">
              <Trex feetY={24} frame={0} dead={false} idle />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-medium">No internet</h2>
            <p className="text-[13px] opacity-70 mt-2">Try:</p>
            <ul className="text-[13px] opacity-70 list-disc list-inside ml-1 mt-1 space-y-0.5">
              <li>Checking the network cables, modem, and router</li>
              <li>Reconnecting to Wi-Fi</li>
              <li>Pressing space to jump</li>
            </ul>
          </div>
        </div>
        <div
          className="relative bg-zinc-50 border border-zinc-200 rounded overflow-hidden"
          style={{ width: W, height: H }}
        >
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-label="Dino game">
            {/* Clouds */}
            {clouds.current.map((c, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: stable cloud slot
              <CloudShape key={`cloud-${i}`} c={c} />
            ))}
            {/* Ground */}
            <line
              x1="0"
              y1={GROUND_Y + 1}
              x2={W}
              y2={GROUND_Y + 1}
              stroke={FG}
              strokeWidth="2"
              strokeDasharray="6 4"
            />
            {/* T-Rex */}
            <Trex feetY={feetY.current} frame={frame} dead={dead} idle={idle} />
            {/* Cacti */}
            {cacti.current.map((c, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: ephemeral, position keyed
              <CactusShape key={`cac-${i}`} c={c} />
            ))}
            {/* HI score */}
            <text
              x="20"
              y="22"
              fontFamily="ui-monospace, Menlo, monospace"
              fontSize="13"
              fill={FG_DIM}
              fontWeight="600"
            >
              HI {hiText}
            </text>
            {/* Score */}
            <text
              x={W - 20}
              y="22"
              textAnchor="end"
              fontFamily="ui-monospace, Menlo, monospace"
              fontSize="13"
              fill={FG}
              fontWeight="600"
            >
              {scoreText}
            </text>
            {/* Idle prompt */}
            {idle ? (
              <text
                x={W / 2}
                y={H / 2 + 4}
                textAnchor="middle"
                fontFamily="ui-monospace, Menlo, monospace"
                fontSize="13"
                fill={FG}
              >
                Press SPACE to play
              </text>
            ) : null}
            {/* Game over */}
            {dead ? (
              <g>
                <text
                  x={W / 2}
                  y={H / 2 - 6}
                  textAnchor="middle"
                  fontFamily="ui-monospace, Menlo, monospace"
                  fontSize="18"
                  fill={FG}
                  fontWeight="700"
                  letterSpacing="3"
                >
                  GAME OVER
                </text>
                <text
                  x={W / 2}
                  y={H / 2 + 14}
                  textAnchor="middle"
                  fontFamily="ui-monospace, Menlo, monospace"
                  fontSize="11"
                  fill={FG}
                >
                  Press SPACE to restart
                </text>
              </g>
            ) : null}
          </svg>
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="text-[11px] opacity-50 font-mono">
            ERR_INTERNET_DISCONNECTED · NateOS
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-blue-500 hover:bg-blue-400 text-white text-[12px] font-medium"
          >
            Reconnect
          </button>
        </div>
      </div>
    </div>
  )
}
