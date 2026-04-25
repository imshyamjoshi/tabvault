const { PNG } = require('pngjs')
const fs = require('fs')
const path = require('path')

const outDir = path.join(__dirname, '../public/icons')
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

function generateIcon(size) {
  const png = new PNG({ width: size, height: size, colorType: 2 })
  const radius = size * 0.18
  const cx = size / 2
  const cy = size / 2

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 3
      const dx = x - cx
      const dy = y - cy
      const dist = Math.sqrt(dx * dx + dy * dy)
      const inCircle = dist <= size / 2 - 1

      // Background: dark zinc #18181b
      // Inner rounded square: slightly lighter #27272a
      const inInner =
        Math.abs(dx) <= size * 0.35 &&
        Math.abs(dy) <= size * 0.35

      if (!inCircle) {
        png.data[idx] = 0
        png.data[idx + 1] = 0
        png.data[idx + 2] = 0
      } else if (inInner) {
        png.data[idx] = 39
        png.data[idx + 1] = 39
        png.data[idx + 2] = 42
      } else {
        png.data[idx] = 24
        png.data[idx + 1] = 24
        png.data[idx + 2] = 27
      }
    }
  }

  // Draw "T" shape (white pixels) centered
  const unit = Math.floor(size / 8)
  const strokeW = Math.max(1, unit)

  // T - horizontal bar
  const tTop = Math.floor(cy - unit * 1.5)
  const tLeft = Math.floor(cx - unit * 2)
  const tRight = Math.floor(cx + unit * 2)
  for (let y = tTop; y < tTop + strokeW; y++) {
    for (let x = tLeft; x <= tRight; x++) {
      if (x >= 0 && x < size && y >= 0 && y < size) {
        const idx = (y * size + x) * 3
        png.data[idx] = 250
        png.data[idx + 1] = 250
        png.data[idx + 2] = 250
      }
    }
  }

  // T - vertical bar
  const tBottom = Math.floor(cy + unit * 1.5)
  const tMidL = Math.floor(cx - Math.floor(strokeW / 2))
  for (let y = tTop; y <= tBottom; y++) {
    for (let x = tMidL; x < tMidL + strokeW; x++) {
      if (x >= 0 && x < size && y >= 0 && y < size) {
        const idx = (y * size + x) * 3
        png.data[idx] = 250
        png.data[idx + 1] = 250
        png.data[idx + 2] = 250
      }
    }
  }

  const outPath = path.join(outDir, `icon${size}.png`)
  const buffer = PNG.sync.write(png)
  fs.writeFileSync(outPath, buffer)
  console.log(`Generated ${outPath}`)
}

generateIcon(16)
generateIcon(48)
generateIcon(128)
