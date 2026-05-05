'use client'
import { useEffect, useState } from 'react'
import { byId } from '@/lib/os/registry'
import { useScreenStore } from '@/lib/os/screen-store'
import { useBattery, useNetwork } from '@/lib/os/use-system-status'
import { useWindowStore } from '@/lib/os/window-store'
import { AppleLogo } from './AppleLogo'
import { AboutAppDialog } from './menubar/AboutAppDialog'
import { AboutDialog } from './menubar/AboutDialog'
import { MenubarMenu, MenubarMenuItem, MenubarMenuSeparator } from './menubar/MenubarMenu'
import { SpotlightModal } from './menubar/SpotlightModal'
import { NoInternet } from './NoInternet'
import { BatteryIcon, SpotlightIcon, WifiIcon } from './SystemIcons'

function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(t)
  }, [])
  return now
}

function formatClock(now: Date) {
  return now.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function formatToday(now: Date) {
  return now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

type MenuId =
  | 'apple'
  | 'app'
  | 'file'
  | 'edit'
  | 'view'
  | 'window'
  | 'help'
  | 'wifi'
  | 'battery'
  | 'clock'
  | null

export function Menubar() {
  const focusedId = useWindowStore((s) => s.focusedId)
  const windows = useWindowStore((s) => s.windows)
  const setScreen = useScreenStore((s) => s.setScreen)
  const focusedApp = focusedId ? byId[windows.find((w) => w.id === focusedId)?.appId ?? ''] : null
  const appTitle = focusedApp?.title ?? 'NateOS'
  const now = useClock()
  const battery = useBattery()
  const network = useNetwork()

  const batteryPct =
    battery.supported && battery.level !== null ? Math.round(battery.level * 100) : null
  const batteryLabel = batteryPct !== null ? `${batteryPct}%` : '—'
  const batteryStatusLine =
    batteryPct !== null
      ? `${batteryPct}% · ${battery.charging ? 'Charging' : 'On Battery'}`
      : 'Battery status unavailable'

  const networkLabel = network.online
    ? network.type !== 'unknown'
      ? network.type.charAt(0).toUpperCase() + network.type.slice(1)
      : 'Connected'
    : 'Offline'

  const [openMenu, setOpenMenu] = useState<MenuId>(null)
  const [spotlightOpen, setSpotlightOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [aboutAppOpen, setAboutAppOpen] = useState(false)
  // Wi-Fi toggle is a gag — flipping it Off opens the Chrome dino easter egg
  // and the toggle visually flips back when the modal is dismissed.
  const [noInternetOpen, setNoInternetOpen] = useState(false)
  const wifiOn = !noInternetOpen
  const focusedWindow = focusedId ? windows.find((w) => w.id === focusedId) : null
  const closeFocusedWindow = useWindowStore((s) => s.closeWindow)
  const setFocusedWindowState = useWindowStore((s) => s.setWindowState)
  function closeFocused() {
    closeMenus()
    if (focusedWindow) closeFocusedWindow(focusedWindow.id)
  }
  function quitFocused() {
    // Quit closes all instances of the focused app (matches macOS Quit behavior).
    closeMenus()
    if (!focusedApp) return
    for (const w of windows.filter((w) => w.appId === focusedApp.id)) {
      closeFocusedWindow(w.id)
    }
  }
  function minimizeFocused() {
    closeMenus()
    if (focusedWindow) setFocusedWindowState(focusedWindow.id, 'min')
  }
  function zoomFocused() {
    closeMenus()
    if (!focusedWindow) return
    setFocusedWindowState(focusedWindow.id, focusedWindow.state === 'max' ? 'normal' : 'max')
  }
  const hasFocused = !!focusedWindow

  function setMenu(id: MenuId, open: boolean) {
    setOpenMenu(open ? id : null)
  }

  function closeMenus() {
    setOpenMenu(null)
  }

  // macOS-style menu-follows-mouse: once any menu is open, hovering another
  // top-level menubar trigger switches to it without requiring a click.
  function hoverSwitch(id: MenuId) {
    return () => {
      if (openMenu !== null && openMenu !== id) setOpenMenu(id)
    }
  }

  function handleRestart() {
    closeMenus()
    try {
      sessionStorage.removeItem('nateos_booted')
    } catch {
      // sessionStorage may be unavailable; ignore.
    }
    window.location.assign('/')
  }

  return (
    <>
      <div className="os-glass-menubar fixed top-0 inset-x-0 h-7 z-50 flex items-stretch px-2 gap-0.5 text-white text-[12px] font-medium border-b border-white/10">
        {/* Apple menu */}
        <MenubarMenu
          ariaLabel="Apple menu"
          trigger={<AppleLogo size={14} className="text-white" />}
          open={openMenu === 'apple'}
          onOpenChange={(o) => setMenu('apple', o)}
          onTriggerEnter={hoverSwitch('apple')}
        >
          <MenubarMenuItem
            onSelect={() => {
              closeMenus()
              setAboutOpen(true)
            }}
          >
            About This Mac
          </MenubarMenuItem>
          <MenubarMenuSeparator />
          <MenubarMenuItem onSelect={handleRestart}>Restart…</MenubarMenuItem>
          <MenubarMenuItem
            onSelect={() => {
              closeMenus()
              setScreen('sleeping')
            }}
          >
            Sleep
          </MenubarMenuItem>
          <MenubarMenuSeparator />
          <MenubarMenuItem
            onSelect={() => {
              closeMenus()
              setScreen('locked')
            }}
          >
            Lock Screen
          </MenubarMenuItem>
        </MenubarMenu>

        {/* Focused app title menu */}
        <MenubarMenu
          ariaLabel={`${appTitle} menu`}
          triggerClassName="font-semibold tracking-tight"
          trigger={<span>{appTitle}</span>}
          open={openMenu === 'app'}
          onOpenChange={(o) => setMenu('app', o)}
          onTriggerEnter={hoverSwitch('app')}
        >
          <MenubarMenuItem
            disabled={!focusedApp}
            onSelect={() => {
              closeMenus()
              if (focusedApp) setAboutAppOpen(true)
            }}
          >
            About {appTitle}
          </MenubarMenuItem>
          <MenubarMenuSeparator />
          <MenubarMenuItem disabled={!hasFocused} onSelect={quitFocused} shortcut="⌘Q">
            Quit {appTitle}
          </MenubarMenuItem>
        </MenubarMenu>

        {/* File */}
        <MenubarMenu
          ariaLabel="File menu"
          trigger={<span className="opacity-90">File</span>}
          open={openMenu === 'file'}
          onOpenChange={(o) => setMenu('file', o)}
          onTriggerEnter={hoverSwitch('file')}
        >
          <MenubarMenuItem disabled={!hasFocused} onSelect={closeFocused} shortcut="⌘W">
            Close Window
          </MenubarMenuItem>
          <MenubarMenuItem disabled={!hasFocused} onSelect={quitFocused} shortcut="⌘Q">
            Quit {appTitle}
          </MenubarMenuItem>
        </MenubarMenu>

        {/* Edit — Cut/Copy/Paste delegate to browser via execCommand-like behavior; left as
            disabled placeholders for v1 since there is no editable surface. */}
        <MenubarMenu
          ariaLabel="Edit menu"
          trigger={<span className="opacity-90">Edit</span>}
          open={openMenu === 'edit'}
          onOpenChange={(o) => setMenu('edit', o)}
          onTriggerEnter={hoverSwitch('edit')}
        >
          <MenubarMenuItem disabled shortcut="⌘Z">
            Undo
          </MenubarMenuItem>
          <MenubarMenuItem disabled shortcut="⇧⌘Z">
            Redo
          </MenubarMenuItem>
          <MenubarMenuSeparator />
          <MenubarMenuItem disabled shortcut="⌘X">
            Cut
          </MenubarMenuItem>
          <MenubarMenuItem disabled shortcut="⌘C">
            Copy
          </MenubarMenuItem>
          <MenubarMenuItem disabled shortcut="⌘V">
            Paste
          </MenubarMenuItem>
          <MenubarMenuItem disabled shortcut="⌘A">
            Select All
          </MenubarMenuItem>
        </MenubarMenu>

        {/* View */}
        <MenubarMenu
          ariaLabel="View menu"
          trigger={<span className="opacity-90">View</span>}
          open={openMenu === 'view'}
          onOpenChange={(o) => setMenu('view', o)}
          onTriggerEnter={hoverSwitch('view')}
        >
          <MenubarMenuItem
            disabled={!hasFocused}
            onSelect={zoomFocused}
            shortcut={focusedWindow?.state === 'max' ? 'Exit Full' : '⌃⌘F'}
          >
            {focusedWindow?.state === 'max' ? 'Exit Full Screen' : 'Enter Full Screen'}
          </MenubarMenuItem>
          <MenubarMenuItem
            onSelect={() => {
              closeMenus()
              window.location.reload()
            }}
            shortcut="⌘R"
          >
            Reload
          </MenubarMenuItem>
        </MenubarMenu>

        {/* Window */}
        <MenubarMenu
          ariaLabel="Window menu"
          trigger={<span className="opacity-90">Window</span>}
          open={openMenu === 'window'}
          onOpenChange={(o) => setMenu('window', o)}
          onTriggerEnter={hoverSwitch('window')}
        >
          <MenubarMenuItem disabled={!hasFocused} onSelect={minimizeFocused} shortcut="⌘M">
            Minimize
          </MenubarMenuItem>
          <MenubarMenuItem disabled={!hasFocused} onSelect={zoomFocused}>
            Zoom
          </MenubarMenuItem>
          <MenubarMenuSeparator />
          <MenubarMenuItem disabled={!hasFocused} onSelect={closeFocused} shortcut="⌘W">
            Close
          </MenubarMenuItem>
        </MenubarMenu>

        {/* Help */}
        <MenubarMenu
          ariaLabel="Help menu"
          trigger={<span className="opacity-90">Help</span>}
          open={openMenu === 'help'}
          onOpenChange={(o) => setMenu('help', o)}
          onTriggerEnter={hoverSwitch('help')}
        >
          <MenubarMenuItem
            disabled={!focusedApp}
            onSelect={() => {
              closeMenus()
              if (focusedApp) setAboutAppOpen(true)
            }}
          >
            {appTitle} Help
          </MenubarMenuItem>
        </MenubarMenu>

        {/* Right-side status tray. */}
        <div className="ml-auto flex items-stretch gap-0.5">
          <button
            type="button"
            aria-label="Spotlight Search"
            onClick={() => {
              closeMenus()
              setSpotlightOpen(true)
            }}
            onMouseEnter={() => {
              if (openMenu !== null) closeMenus()
            }}
            className="inline-flex items-center h-7 px-2 rounded-sm hover:bg-white/10 focus:outline-none"
          >
            <SpotlightIcon size={14} />
          </button>

          <MenubarMenu
            ariaLabel="Wi-Fi"
            align="end"
            trigger={<WifiIcon size={16} />}
            open={openMenu === 'wifi'}
            onOpenChange={(o) => setMenu('wifi', o)}
            onTriggerEnter={hoverSwitch('wifi')}
            panelClassName="min-w-[260px]"
          >
            <div className="flex items-center justify-between px-3 py-1.5">
              <span className="text-[12px] font-semibold">Wi-Fi</span>
              <button
                type="button"
                role="switch"
                aria-checked={wifiOn}
                aria-label="Wi-Fi"
                onClick={() => {
                  if (wifiOn) {
                    closeMenus()
                    setNoInternetOpen(true)
                  }
                }}
                className="inline-flex items-center gap-2 focus:outline-none"
              >
                <span className="text-[11px] opacity-70">{wifiOn ? 'On' : 'Off'}</span>
                <span
                  aria-hidden="true"
                  className={`inline-block w-7 h-4 rounded-full relative transition-colors ${
                    wifiOn ? 'bg-blue-500' : 'bg-zinc-600'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${
                      wifiOn ? 'right-0.5' : 'left-0.5'
                    }`}
                  />
                </span>
              </button>
            </div>
            <MenubarMenuSeparator />
            <div className="px-3 py-1 text-[11px] uppercase opacity-60 tracking-wide">Status</div>
            <MenubarMenuItem onSelect={closeMenus}>
              <span className="inline-flex items-center gap-2">
                <WifiIcon size={12} />
                {networkLabel}
              </span>
            </MenubarMenuItem>
          </MenubarMenu>

          <MenubarMenu
            ariaLabel="Battery"
            align="end"
            trigger={
              <span className="flex items-center gap-1">
                <BatteryIcon
                  size={22}
                  level={battery.level ?? 0.87}
                  charging={battery.charging ?? false}
                />
                <span className="text-[11px] opacity-90">{batteryLabel}</span>
              </span>
            }
            open={openMenu === 'battery'}
            onOpenChange={(o) => setMenu('battery', o)}
            onTriggerEnter={hoverSwitch('battery')}
            panelClassName="min-w-[240px]"
          >
            <div className="px-3 py-1.5">
              <div className="text-[12px] font-semibold">{batteryStatusLine}</div>
              <div className="text-[11px] opacity-70 mt-0.5">
                {battery.supported
                  ? 'Battery Health: Normal'
                  : 'Browser hides battery info — showing default'}
              </div>
            </div>
          </MenubarMenu>

          <MenubarMenu
            ariaLabel="Date and time"
            align="end"
            trigger={<span>{formatClock(now)}</span>}
            open={openMenu === 'clock'}
            onOpenChange={(o) => setMenu('clock', o)}
            onTriggerEnter={hoverSwitch('clock')}
            panelClassName="min-w-[260px]"
          >
            <div className="px-3 py-2">
              <div className="text-[11px] uppercase tracking-wide opacity-60">Today</div>
              <div className="text-[16px] font-semibold mt-1">{formatToday(now)}</div>
            </div>
          </MenubarMenu>
        </div>
      </div>

      <SpotlightModal open={spotlightOpen} onClose={() => setSpotlightOpen(false)} />
      <AboutDialog open={aboutOpen} onClose={() => setAboutOpen(false)} />
      <AboutAppDialog
        app={aboutAppOpen ? focusedApp : null}
        onClose={() => setAboutAppOpen(false)}
      />
      {noInternetOpen ? <NoInternet onClose={() => setNoInternetOpen(false)} /> : null}
    </>
  )
}
