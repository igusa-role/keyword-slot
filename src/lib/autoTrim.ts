export interface TrimmedImage {
  dataUrl: string
  originalWidth: number
  originalHeight: number
  croppedWidth: number
  croppedHeight: number
  trimmed: boolean
}

interface BackgroundColor {
  red: number
  green: number
  blue: number
  alpha: number
}

const MAX_PIXELS = 24_000_000
const SAFE_PADDING = 2

function median(values: number[]): number {
  const sorted = [...values].sort((left, right) => left - right)
  return sorted[Math.floor(sorted.length / 2)] ?? 0
}

function estimateBorderBackground(pixels: Uint8ClampedArray, width: number, height: number): BackgroundColor {
  const reds: number[] = []
  const greens: number[] = []
  const blues: number[] = []
  const alphas: number[] = []
  const step = Math.max(1, Math.floor((width * 2 + height * 2) / 1600))

  const sample = (x: number, y: number) => {
    const index = (y * width + x) * 4
    reds.push(pixels[index])
    greens.push(pixels[index + 1])
    blues.push(pixels[index + 2])
    alphas.push(pixels[index + 3])
  }

  for (let x = 0; x < width; x += step) {
    sample(x, 0)
    if (height > 1) sample(x, height - 1)
  }
  for (let y = 0; y < height; y += step) {
    sample(0, y)
    if (width > 1) sample(width - 1, y)
  }

  return { red: median(reds), green: median(greens), blue: median(blues), alpha: median(alphas) }
}

function isForeground(
  pixels: Uint8ClampedArray,
  index: number,
  background: BackgroundColor,
): boolean {
  const alpha = pixels[index + 3]
  if (background.alpha < 36) return alpha > 24
  if (alpha < 24) return false

  const redDifference = pixels[index] - background.red
  const greenDifference = pixels[index + 1] - background.green
  const blueDifference = pixels[index + 2] - background.blue
  const colorDistance = Math.sqrt(redDifference ** 2 + greenDifference ** 2 + blueDifference ** 2)
  const alphaDifference = Math.abs(alpha - background.alpha)
  return colorDistance > 34 || alphaDifference > 42
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const sourceUrl = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(sourceUrl)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(sourceUrl)
      reject(new Error('이미지를 읽을 수 없습니다. PNG, JPG 또는 WEBP 파일을 다시 선택해 주세요.'))
    }
    image.src = sourceUrl
  })
}

export async function autoTrimImage(file: File): Promise<TrimmedImage> {
  if (!file.type.startsWith('image/')) {
    throw new Error('PNG, JPG 또는 WEBP 이미지 파일만 첨부할 수 있습니다.')
  }

  const image = await loadImage(file)
  const width = image.naturalWidth
  const height = image.naturalHeight
  if (!width || !height) throw new Error('이미지 크기를 확인할 수 없습니다.')
  if (width * height > MAX_PIXELS) {
    throw new Error('이미지가 너무 큽니다. 가로×세로 2,400만 픽셀 이하의 이미지를 사용해 주세요.')
  }

  const sourceCanvas = document.createElement('canvas')
  sourceCanvas.width = width
  sourceCanvas.height = height
  const sourceContext = sourceCanvas.getContext('2d', { willReadFrequently: true })
  if (!sourceContext) throw new Error('이미지 처리 환경을 준비할 수 없습니다.')
  sourceContext.drawImage(image, 0, 0)

  const imageData = sourceContext.getImageData(0, 0, width, height)
  const background = estimateBorderBackground(imageData.data, width, height)
  let minX = width
  let minY = height
  let maxX = -1
  let maxY = -1

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4
      if (!isForeground(imageData.data, index, background)) continue
      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x)
      maxY = Math.max(maxY, y)
    }
  }

  const hasForeground = maxX >= minX && maxY >= minY
  const left = hasForeground ? Math.max(0, minX - SAFE_PADDING) : 0
  const top = hasForeground ? Math.max(0, minY - SAFE_PADDING) : 0
  const right = hasForeground ? Math.min(width - 1, maxX + SAFE_PADDING) : width - 1
  const bottom = hasForeground ? Math.min(height - 1, maxY + SAFE_PADDING) : height - 1
  const croppedWidth = right - left + 1
  const croppedHeight = bottom - top + 1

  const outputCanvas = document.createElement('canvas')
  outputCanvas.width = croppedWidth
  outputCanvas.height = croppedHeight
  const outputContext = outputCanvas.getContext('2d')
  if (!outputContext) throw new Error('크롭 결과를 만들 수 없습니다.')
  outputContext.drawImage(sourceCanvas, left, top, croppedWidth, croppedHeight, 0, 0, croppedWidth, croppedHeight)

  return {
    dataUrl: outputCanvas.toDataURL('image/png'),
    originalWidth: width,
    originalHeight: height,
    croppedWidth,
    croppedHeight,
    trimmed: left > 0 || top > 0 || right < width - 1 || bottom < height - 1,
  }
}
