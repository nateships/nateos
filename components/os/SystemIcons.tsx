type IconProps = {
  size?: number
  className?: string
}

// Spotlight (magnifying glass), inspired by SF Symbols `magnifyingglass`.
export function SpotlightIcon({ size = 14, className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="10.5" cy="10.5" r="6.5" />
      <line x1="15.4" y1="15.4" x2="20" y2="20" />
    </svg>
  )
}

// Wi-Fi arcs (SF Symbols `wifi`).
export function WifiIcon({ size = 16, className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3.4 9.2c5.2-4.8 12-4.8 17.2 0" />
      <path d="M6.2 12.4c3.6-3.4 8.4-3.4 11.6 0" />
      <path d="M9 15.6c1.8-1.8 4.2-1.8 6 0" />
      <circle cx="12" cy="19" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  )
}

// Battery — rounded rect outline + tip + fill bar. Shows lightning bolt when charging.
export function BatteryIcon({
  size = 22,
  className,
  level = 0.87,
  charging = false,
}: IconProps & { level?: number; charging?: boolean }) {
  const w = size
  const h = (size * 12) / 22
  const fillWidth = Math.max(0, Math.min(1, level)) * 16
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 22 12"
      width={w}
      height={h}
      aria-hidden="true"
      className={className}
    >
      <rect
        x="0.6"
        y="0.6"
        width="18"
        height="10.8"
        rx="2.4"
        ry="2.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.7"
      />
      <rect
        x="19.4"
        y="4.2"
        width="1.6"
        height="3.6"
        rx="0.6"
        ry="0.6"
        fill="currentColor"
        opacity="0.7"
      />
      <rect x="2" y="2" width={fillWidth} height="8" rx="1.2" ry="1.2" fill="currentColor" />
      {charging ? (
        <path
          d="M11.2 2.4 L7.6 7 L9.8 7 L8.8 9.6 L12.4 5 L10.2 5 Z"
          fill="#ffffff"
          stroke="#000000"
          strokeWidth="0.3"
          strokeLinejoin="round"
        />
      ) : null}
    </svg>
  )
}
