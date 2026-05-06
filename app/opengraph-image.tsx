import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'

export const alt = "NateOS — Nate O'Farrell"
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OG() {
  // Logo lives next to this module; read at render time and inline as a data
  // URI so ImageResponse can render it without a network round-trip.
  const logoBuf = await readFile(join(process.cwd(), 'app', 'og-logo.jpg'))
  const logoSrc = `data:image/jpeg;base64,${logoBuf.toString('base64')}`

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '48px 80px',
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

      {/* Centered logo — focal centerpiece of the OG card. */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* biome-ignore lint/performance/noImgElement: ImageResponse only supports plain <img>, not next/image */}
        {/* biome-ignore lint/a11y/useAltText: decorative — already announced via the OG `alt` export */}
        <img src={logoSrc} width={360} height={360} />
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 30, opacity: 0.85 }}>
          {"Nate O'Farrell — Director of Infrastructure & Platform Engineering"}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            fontSize: 20,
            opacity: 0.6,
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
      </div>
    </div>,
    { ...size },
  )
}
