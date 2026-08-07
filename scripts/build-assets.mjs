import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')

await sharp(join(publicDir, 'profile.jpg'))
  .resize(1200, 630, { fit: 'cover', position: 'centre' })
  .toFile(join(publicDir, 'og-default.png'))

console.log('Generated public/og-default.png')

await sharp(join(publicDir, 'logo.svg'))
  .resize(180, 180)
  .toFile(join(publicDir, 'apple-touch-icon.png'))

console.log('Generated public/apple-touch-icon.png')
