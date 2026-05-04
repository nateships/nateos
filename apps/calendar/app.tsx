'use client'

const CAL_LINK = 'https://cal.com/nateofarrell/intro'

export function CalendarApp() {
  return (
    <div className="h-full w-full flex flex-col bg-zinc-900/95 text-white">
      <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between">
        <div>
          <h1 className="text-[14px] font-semibold">Book an intro chat</h1>
          <p className="text-[11px] opacity-60">15 minutes · Cal.com</p>
        </div>
        <a
          href={CAL_LINK}
          target="_blank"
          rel="noreferrer"
          className="text-[11px] text-blue-400 hover:underline"
        >
          Open in Cal.com ↗
        </a>
      </div>
      <iframe
        src={CAL_LINK}
        title="Book intro chat"
        className="flex-1 w-full bg-white border-0"
        allow="fullscreen; clipboard-read; clipboard-write"
        referrerPolicy="no-referrer"
      />
    </div>
  )
}
