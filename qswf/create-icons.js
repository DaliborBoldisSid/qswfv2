// Script to create simple SVG icons for the PWA
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const createSVGIcon = (size) => {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="url(#grad1)"/>
  <circle cx="${size * 0.5}" cy="${size * 0.35}" r="${size * 0.15}" fill="white" opacity="0.9"/>
  <path d="M ${size * 0.35} ${size * 0.55} Q ${size * 0.5} ${size * 0.7} ${size * 0.65} ${size * 0.55}" stroke="white" stroke-width="${size * 0.05}" fill="none" stroke-linecap="round" opacity="0.9"/>
  <text x="${size * 0.5}" y="${size * 0.75}" font-family="Arial, sans-serif" font-size="${size * 0.15}" font-weight="bold" fill="white" text-anchor="middle" opacity="0.9">QUIT</text>
</svg>`
}

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, 'public')
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true })
}

// Write SVG files
fs.writeFileSync(path.join(publicDir, 'icon-192.svg'), createSVGIcon(192))
fs.writeFileSync(path.join(publicDir, 'icon-512.svg'), createSVGIcon(512))

console.log('SVG icons created successfully!')
console.log('Note: For production, convert these SVG files to PNG using an image converter.')
console.log('For now, we will use SVG files which work in most modern browsers.')

// Also create PNG placeholders by renaming (browser will handle SVG as fallback)
fs.copyFileSync(path.join(publicDir, 'icon-192.svg'), path.join(publicDir, 'icon-192.png'))
fs.copyFileSync(path.join(publicDir, 'icon-512.svg'), path.join(publicDir, 'icon-512.png'))

console.log('Icon files ready!')
