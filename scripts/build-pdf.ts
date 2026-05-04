import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { type DocumentProps, renderToBuffer } from '@react-pdf/renderer'
import React, { type ReactElement } from 'react'
import { ResumePdf } from '../apps/resume/Pdf'
import { loadResume } from '../lib/content/load'

const out = join(process.cwd(), 'public', 'resume.pdf')
mkdirSync(join(process.cwd(), 'public'), { recursive: true })

const element = React.createElement(ResumePdf, {
  resume: loadResume(),
}) as unknown as ReactElement<DocumentProps>
const buf = await renderToBuffer(element)
writeFileSync(out, buf)
console.log(`✓ ${out}`)
