import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import qrcode from 'qrcode'
import { loadProfile } from '../lib/content/load'

const profile = loadProfile()

const vcard = [
  'BEGIN:VCARD',
  'VERSION:3.0',
  `FN:${profile.name}`,
  `EMAIL:${profile.email}`,
  profile.phone ? `TEL:${profile.phone}` : '',
  `URL:https://nate.cx`,
  `TITLE:${profile.tagline}`,
  `ADR:;;;${profile.location};;;`,
  'END:VCARD',
]
  .filter(Boolean)
  .join('\n')

const pub = join(process.cwd(), 'public')
mkdirSync(pub, { recursive: true })
writeFileSync(join(pub, 'contact.vcf'), vcard)
console.log('✓ public/contact.vcf')

const dataUrl = await qrcode.toDataURL('https://nate.cx/contact.vcf', {
  errorCorrectionLevel: 'M',
  margin: 1,
  width: 320,
  color: { dark: '#000000', light: '#ffffff' },
})
const base64 = dataUrl.split(',')[1]
writeFileSync(join(pub, 'qr.png'), Buffer.from(base64, 'base64'))
console.log('✓ public/qr.png')
