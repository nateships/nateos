import { ImageResponse } from 'next/og'

export const alt = "NateOS — Nate O'Farrell"
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OG() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '72px 80px',
        background: 'linear-gradient(135deg, #0b0d12 0%, #14171f 45%, #1f2433 75%, #2a3247 100%)',
        color: 'white',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", system-ui, sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <div
          style={{
            display: 'flex',
            width: 14,
            height: 14,
            borderRadius: 9999,
            background: '#ff5f57',
          }}
        />
        <div
          style={{
            display: 'flex',
            width: 14,
            height: 14,
            borderRadius: 9999,
            background: '#febc2e',
          }}
        />
        <div
          style={{
            display: 'flex',
            width: 14,
            height: 14,
            borderRadius: 9999,
            background: '#28c840',
          }}
        />
        <div style={{ marginLeft: 'auto', fontSize: 22, opacity: 0.55, letterSpacing: 1.5 }}>
          nate.cx
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ fontSize: 32, opacity: 0.65, letterSpacing: 2 }}>{"Nate O'Farrell"}</div>
        <div
          style={{
            fontSize: 132,
            fontWeight: 600,
            lineHeight: 1,
            letterSpacing: -3,
          }}
        >
          NateOS
        </div>
        <div
          style={{
            fontSize: 36,
            opacity: 0.85,
            maxWidth: 900,
            lineHeight: 1.25,
          }}
        >
          Director of Infrastructure & Platform Engineering — hands-on builder.
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          fontSize: 22,
          opacity: 0.65,
        }}
      >
        <span>IDEA HPC</span>
        <span style={{ opacity: 0.4 }}>·</span>
        <span>Sleepbar</span>
        <span style={{ opacity: 0.4 }}>·</span>
        <span>AWS re:Invent 2022</span>
        <span style={{ opacity: 0.4 }}>·</span>
        <span>Commonwealth Fusion Systems</span>
      </div>
    </div>,
    { ...size },
  )
}
