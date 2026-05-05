'use client'
import { type AppearanceMode, type Era, useSettings } from '@/lib/settings/store'

const MODES: { value: AppearanceMode; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'auto', label: 'Auto' },
]

const ERAS: { value: Era; label: string; sub: string }[] = [
  { value: 'tahoe', label: 'Tahoe', sub: 'Modern macOS' },
  { value: 'classic', label: 'Classic', sub: 'System 7-ish' },
]

export function AppearancePane() {
  const mode = useSettings((s) => s.appearance)
  const setMode = useSettings((s) => s.setAppearance)
  const era = useSettings((s) => s.era)
  const setEra = useSettings((s) => s.setEra)
  const reduceMotion = useSettings((s) => s.reduceMotion)
  const setReduceMotion = useSettings((s) => s.setReduceMotion)

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-[12px] font-semibold mb-2">Era</h3>
        <div className="flex gap-2">
          {ERAS.map((e) => (
            <button
              key={e.value}
              type="button"
              onClick={() => setEra(e.value)}
              className={`px-3 py-1.5 rounded-md text-[12px] flex flex-col items-start ${
                era === e.value ? 'bg-blue-500 text-white' : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <span className="font-medium">{e.label}</span>
              <span className="text-[10px] opacity-70">{e.sub}</span>
            </button>
          ))}
        </div>
        <p className="text-[11px] opacity-50 mt-2">
          Classic swaps the boot screen + window chrome.
        </p>
      </div>
      <div>
        <h3 className="text-[12px] font-semibold mb-2">Appearance</h3>
        <div className="flex gap-2">
          {MODES.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMode(m.value)}
              className={`px-3 py-1.5 rounded-md text-[12px] ${
                mode === m.value ? 'bg-blue-500 text-white' : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <p className="text-[11px] opacity-50 mt-2">
          Light/dark currently visual-only; era is the real switch.
        </p>
      </div>
      <label className="flex items-center gap-3 text-[12px]">
        <input
          type="checkbox"
          checked={reduceMotion}
          onChange={(e) => setReduceMotion(e.target.checked)}
        />
        Reduce motion (skip boot animation)
      </label>
    </div>
  )
}
