'use client'
import { useEffect, useState } from 'react'

const RESTART_TEXT_BY_LANG: { lang: string; text: string }[] = [
  {
    lang: 'en',
    text: 'You need to restart your computer. Hold down the Power button for several seconds or press the Restart button.',
  },
  {
    lang: 'fr',
    text: 'Veuillez redémarrer votre ordinateur. Maintenez la touche de démarrage enfoncée pendant plusieurs secondes ou bien appuyez sur le bouton de réinitialisation.',
  },
  {
    lang: 'de',
    text: 'Sie müssen Ihren Computer neu starten. Halten Sie die Einschalttaste mehrere Sekunden gedrückt oder drücken Sie die Neustart-Taste.',
  },
  {
    lang: 'es',
    text: 'Es necesario reiniciar el ordenador. Mantenga pulsado el botón de arranque varios segundos o pulse el botón de reinicio.',
  },
  {
    lang: 'ja',
    text: 'コンピュータを再起動する必要があります。パワーボタンを数秒間押し続けるか、リセットボタンを押してください。',
  },
]

let externalTrigger: (() => void) | null = null

/** Imperative API for components outside the React tree (e.g. Terminal command handler). */
export function triggerKernelPanic() {
  externalTrigger?.()
}

export function KernelPanic() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    externalTrigger = () => setOpen(true)
    return () => {
      externalTrigger = null
    }
  }, [])

  if (!open) return null

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label="Kernel panic"
      className="fixed inset-0 z-[200] flex items-center justify-center bg-zinc-900/60 backdrop-blur-md text-white p-6 cursor-pointer"
      onClick={() => setOpen(false)}
      onKeyDown={() => setOpen(false)}
    >
      <div className="max-w-2xl flex flex-col gap-6 text-center">
        <span className="text-6xl mb-2" aria-hidden="true">
          ⏻
        </span>
        {RESTART_TEXT_BY_LANG.map((r) => (
          <p
            key={r.lang}
            lang={r.lang}
            className="text-[13px] leading-snug opacity-90 max-w-xl mx-auto"
          >
            {r.text}
          </p>
        ))}
        <p className="text-[10px] opacity-50 mt-4">click anywhere to dismiss</p>
      </div>
    </div>
  )
}
