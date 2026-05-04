'use client'
import { type AppearanceMode, useSettings } from '@/lib/settings/store'

const MODES: { value: AppearanceMode; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'auto', label: 'Auto' },
]

export function AppearancePane() {
  const mode = useSettings((s) => s.appearance)
  const setMode = useSettings((s) => s.setAppearance)
  const reduceMotion = useSettings((s) => s.reduceMotion)
  const setReduceMotion = useSettings((s) => s.setReduceMotion)
  return (
    <div className="flex flex-col gap-5">
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
          Theme tokens land in Plan 3 (retro skin). Currently visual-only.
        </p>
      </div>
      <label className="flex items-center gap-3 text-[12px]">
        <input
          type="checkbox"
          checked={reduceMotion}
          onChange={(e) => setReduceMotion(e.target.checked)}
        />
        Reduce motion (skip boot animation, dock magnification)
      </label>
    </div>
  )
}
