'use client'
import { type AccentColor, type DockSize, useSettings } from '@/lib/settings/store'

const ACCENTS: { value: AccentColor; swatch: string; label: string }[] = [
  { value: 'blue', swatch: 'oklch(62.3% 0.214 259.815)', label: 'Blue' },
  { value: 'purple', swatch: 'oklch(62.7% 0.265 303.9)', label: 'Purple' },
  { value: 'pink', swatch: 'oklch(65.6% 0.241 354.308)', label: 'Pink' },
  { value: 'red', swatch: 'oklch(63.7% 0.237 25.331)', label: 'Red' },
  { value: 'orange', swatch: 'oklch(70.5% 0.213 47.604)', label: 'Orange' },
  { value: 'yellow', swatch: 'oklch(79.5% 0.184 86.047)', label: 'Yellow' },
  { value: 'green', swatch: 'oklch(72.3% 0.219 149.579)', label: 'Green' },
  { value: 'graphite', swatch: 'oklch(55.2% 0.016 285.938)', label: 'Graphite' },
]

const DOCK_SIZES: { value: DockSize; label: string }[] = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
]

export function AppearancePane() {
  const accent = useSettings((s) => s.accentColor)
  const setAccent = useSettings((s) => s.setAccentColor)
  const reduceMotion = useSettings((s) => s.reduceMotion)
  const setReduceMotion = useSettings((s) => s.setReduceMotion)
  const transparency = useSettings((s) => s.transparency)
  const setTransparency = useSettings((s) => s.setTransparency)
  const dockSize = useSettings((s) => s.dockSize)
  const setDockSize = useSettings((s) => s.setDockSize)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-[12px] font-semibold mb-2">Accent color</h3>
        <div className="flex gap-2 flex-wrap">
          {ACCENTS.map((a) => (
            <button
              key={a.value}
              type="button"
              aria-label={a.label}
              title={a.label}
              onClick={() => setAccent(a.value)}
              className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${
                accent === a.value ? 'border-white ring-2 ring-white/40' : 'border-white/20'
              }`}
              style={{ backgroundColor: a.swatch }}
            />
          ))}
        </div>
        <p className="text-[11px] opacity-50 mt-2">
          Drives selection, focus, and highlight throughout the system.
        </p>
      </div>

      <div>
        <h3 className="text-[12px] font-semibold mb-2">Dock size</h3>
        <div className="inline-flex rounded-md bg-white/5 p-0.5">
          {DOCK_SIZES.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => setDockSize(d.value)}
              className={`px-3 py-1 rounded text-[12px] ${
                dockSize === d.value ? 'bg-blue-500 text-white' : 'hover:bg-white/5'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[12px] font-semibold">Transparency</h3>
          <span className="text-[11px] opacity-60 tabular-nums">{transparency}</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={transparency}
          onChange={(e) => setTransparency(Number(e.target.value))}
          className="w-64 accent-blue-500"
          aria-label="Transparency"
        />
        <div className="flex justify-between w-64 text-[10px] opacity-50 mt-1">
          <span>Solid</span>
          <span>Glass</span>
        </div>
      </div>

      <label className="flex items-start gap-3 text-[12px] cursor-pointer">
        <input
          type="checkbox"
          className="mt-0.5"
          checked={reduceMotion}
          onChange={(e) => setReduceMotion(e.target.checked)}
        />
        <span>
          <span className="block">Reduce motion</span>
          <span className="block text-[11px] opacity-50">Skip the boot animation.</span>
        </span>
      </label>
    </div>
  )
}
