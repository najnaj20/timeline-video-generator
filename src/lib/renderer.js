import { easeInOutCubic, easeOutCubic } from './animation'
import {
  aspectOf,
  blendViewport,
  buildCameraTrack,
  cameraViewportAt,
  overviewViewport,
  worldPositionAtProgress,
} from './camera'
import { cumulativeDistances, overviewRouteSegments, unwrapJourneyPoints } from './geo'
import { overlayCard, overlayScale } from './overlay'
import { AppError } from './errors'

export const MAP_ATTRIBUTION = '© OpenStreetMap contributors  © CARTO'

const TILE_TEMPLATES = {
  light: 'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
  dark: 'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
}

const MAP_BG = { light: '#f2edf0', dark: '#0b0f17' }

export const ROUTE_COLORS = {
  pink: { main: '#e90064', label: 'Hot pink' },
  gold: { main: '#f5c542', label: 'Gold' },
  green: { main: '#00ff9d', label: 'Neon green' },
  cyan: { main: '#00d4ff', label: 'Cyan' },
  white: { main: '#f5f7fa', label: 'Putih' },
}

export const MAP_STYLES = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
]

export const MARKER_TYPES = [
  { id: 'circle', label: 'Lingkaran' },
  { id: 'emoji', label: 'Emoji' },
  { id: 'photo', label: 'Foto' },
]

// Route and marker sizes are authored on the same 720 design grid as the overlay.
const TRAIL_WIDTH = 7.5
const RECENT_TRAIL_WIDTH = 12
const OVERVIEW_TRAIL_WIDTH = 5.25
const HEAD_RADIUS = 15
const HEAD_RING_RADIUS = 24
const HEAD_RING_WIDTH = 7.5
const HEAD_SHADOW_BLUR = 15

function hexToRgba(hex, alpha) {
  const cleaned = hex.replace('#', '')
  const value = parseInt(cleaned.length === 3 ? cleaned.split('').map((c) => c + c).join('') : cleaned, 16)
  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`
}

function worldToCanvas(point, viewport, size) {
  return [
    ((point.x - viewport.minX) / (viewport.maxX - viewport.minX)) * size.width,
    ((point.y - viewport.minY) / (viewport.maxY - viewport.minY)) * size.height,
  ]
}

function tileKey(tile) {
  return `${tile.zoom}/${tile.x}/${tile.y}`
}

function loadImage(url, signal) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    const cleanup = () => signal?.removeEventListener('abort', abort)
    const abort = () => {
      image.src = ''
      cleanup()
      reject(new DOMException('Video creation was cancelled.', 'AbortError'))
    }
    image.onload = () => {
      cleanup()
      resolve(image)
    }
    image.onerror = () => {
      cleanup()
      reject(new Error(`Could not load map tile ${url}`))
    }
    if (signal?.aborted) {
      abort()
      return
    }
    signal?.addEventListener('abort', abort, { once: true })
    image.src = url
  })
}

export function requiredTiles(viewport) {
  const tileCount = 2 ** viewport.zoom
  const minTileX = Math.floor(viewport.minX * tileCount)
  const maxTileX = Math.floor(viewport.maxX * tileCount)
  const minTileY = Math.max(0, Math.floor(viewport.minY * tileCount))
  const maxTileY = Math.min(tileCount - 1, Math.floor(viewport.maxY * tileCount))
  const tiles = []
  for (let tileX = minTileX; tileX <= maxTileX; tileX += 1) {
    for (let tileY = minTileY; tileY <= maxTileY; tileY += 1) {
      tiles.push({
        zoom: viewport.zoom,
        x: ((tileX % tileCount) + tileCount) % tileCount,
        y: tileY,
      })
    }
  }
  return tiles
}

function drawMapBackground(canvas, viewport, tiles, mapStyle) {
  const context = canvas.getContext('2d')
  if (!context) throw new AppError('errorCanvasUnavailable', 'Canvas rendering is unavailable.')
  const size = { width: canvas.width, height: canvas.height }
  context.fillStyle = MAP_BG[mapStyle] ?? MAP_BG.light
  context.fillRect(0, 0, size.width, size.height)

  const tileCount = 2 ** viewport.zoom
  const minTileX = Math.floor(viewport.minX * tileCount)
  const maxTileX = Math.floor(viewport.maxX * tileCount)
  const minTileY = Math.max(0, Math.floor(viewport.minY * tileCount))
  const maxTileY = Math.min(tileCount - 1, Math.floor(viewport.maxY * tileCount))

  for (let tileX = minTileX; tileX <= maxTileX; tileX += 1) {
    for (let tileY = minTileY; tileY <= maxTileY; tileY += 1) {
      const wrappedX = ((tileX % tileCount) + tileCount) % tileCount
      const image = tiles.get(tileKey({ zoom: viewport.zoom, x: wrappedX, y: tileY }))
      if (!image) continue
      const worldX = tileX / tileCount
      const worldY = tileY / tileCount
      const [left, top] = worldToCanvas({ x: worldX, y: worldY }, viewport, size)
      const width = (1 / tileCount / (viewport.maxX - viewport.minX)) * size.width
      const height = (1 / tileCount / (viewport.maxY - viewport.minY)) * size.height
      context.drawImage(image, left, top, width, height)
    }
  }
}

async function loadRequiredTiles(coordinates, signal, onProgress) {
  const tiles = new Map()
  let nextIndex = 0
  let completed = 0
  const worker = async () => {
    while (nextIndex < coordinates.length) {
      if (signal?.aborted) throw new DOMException('Video creation was cancelled.', 'AbortError')
      const coordinate = coordinates[nextIndex]
      nextIndex += 1
      const url = TILE_TEMPLATES[coordinate.mapStyle]
        .replace('{z}', String(coordinate.zoom))
        .replace('{x}', String(coordinate.x))
        .replace('{y}', String(coordinate.y))
      try {
        tiles.set(tileKey(coordinate), await loadImage(url, signal))
      } catch (error) {
        if (signal?.aborted || (error instanceof DOMException && error.name === 'AbortError')) throw error
      }
      completed += 1
      onProgress?.(completed, coordinates.length)
    }
  }
  await Promise.all(Array.from({ length: Math.min(6, coordinates.length) }, worker))
  return tiles
}

function journeyStats(points) {
  if (points.length === 0) {
    return { days: 0, yearMin: null, yearMax: null, pointCount: 0 }
  }
  const first = points[0].instant.getTime()
  const last = points[points.length - 1].instant.getTime()
  const years = points.map((p) => p.instant.getFullYear())
  return {
    days: Math.max(1, Math.round((last - first) / 86_400_000)),
    yearMin: Math.min(...years),
    yearMax: Math.max(...years),
    pointCount: points.length,
  }
}

export async function prepareJourney(
  points,
  size = { width: 480, height: 480 },
  cameraMovement = 'steady',
  durationSeconds = 30,
  options = {},
  signal,
  onProgress,
) {
  const style = {
    mapStyle: options.mapStyle || 'light',
    routeColor: options.routeColor || 'pink',
    marker: options.marker || { type: 'circle' },
    recap: options.recap !== false,
  }
  if (points.length < 2) {
    throw new AppError('errorTooFewPoints', 'Select a period containing at least two location points.')
  }
  const worldPoints = unwrapJourneyPoints(points)
  const distances = cumulativeDistances(points)
  const journey = {
    points,
    worldPoints,
    cumulativeDistanceKm: distances,
    totalDistanceKm: distances.at(-1) ?? 0,
    stats: journeyStats(points),
    style,
  }
  console.log('[TimelineVideoGen] prepareJourney:', { points: points.length, totalKm: journey.totalDistanceKm, days: journey.stats.days, years: journey.stats.yearMin + '–' + journey.stats.yearMax })
  const cameraTrack = buildCameraTrack(journey, size, cameraMovement)
  const overviewSegments = overviewRouteSegments(worldPoints)
  const endingOverview = overviewViewport({ ...journey, worldPoints: overviewSegments.flat() }, size)
  const sampleCount = Math.max(
    20,
    Math.min(durationSeconds * 8, Math.max(durationSeconds * 2, Math.ceil(journey.totalDistanceKm / 250))),
  )
  const required = new Map()
  for (let sample = 0; sample <= sampleCount; sample += 1) {
    for (const tile of requiredTiles(cameraViewportAt(cameraTrack, sample / sampleCount))) {
      required.set(tileKey(tile), { ...tile, mapStyle: style.mapStyle })
    }
  }
  const journeyEnd = cameraViewportAt(cameraTrack, 1)
  for (let sample = 0; sample <= 12; sample += 1) {
    const ending = blendViewport(journeyEnd, endingOverview, easeOutCubic(sample / 12), size)
    for (const tile of requiredTiles(ending)) {
      required.set(tileKey(tile), { ...tile, mapStyle: style.mapStyle })
    }
  }
  const tiles = await loadRequiredTiles([...required.values()], signal, onProgress)
  return {
    ...journey,
    overviewRouteSegments: overviewSegments,
    size,
    cameraTrack,
    overviewViewport: endingOverview,
    tiles,
  }
}

function pointAtProgress(journey, progress) {
  const position = worldPositionAtProgress(journey, progress)
  return { point: position.point, completedIndex: position.fromIndex }
}

function strokeRoute(context, points, head, viewport, size) {
  if (points.length === 0) return
  context.beginPath()
  points.forEach((point, index) => {
    const [x, y] = worldToCanvas(point, viewport, size)
    if (index === 0) context.moveTo(x, y)
    else context.lineTo(x, y)
  })
  const [headX, headY] = worldToCanvas(head, viewport, size)
  context.lineTo(headX, headY)
  context.stroke()
}

export const ASPECT_EPSILON = 0.01
export const MIN_PREVIEW_SHORT_EDGE = 240

export function previewCanvasSize(format, cssWidth, devicePixelRatio) {
  const ratio = Number.isFinite(devicePixelRatio) && devicePixelRatio > 0 ? devicePixelRatio : 1
  const deviceWidth = Number.isFinite(cssWidth) && cssWidth > 0 ? cssWidth * ratio : format.width
  const minimumScale = Math.min(1, MIN_PREVIEW_SHORT_EDGE / Math.min(format.width, format.height))
  const scale = Math.min(1, Math.max(minimumScale, deviceWidth / format.width))
  return {
    width: Math.round(format.width * scale),
    height: Math.round(format.height * scale),
  }
}

function drawHeadMarker(context, x, y, scale, marker, ringColor) {
  const radius = HEAD_RADIUS * scale
  context.save()
  context.shadowColor = 'rgba(36, 25, 29, 0.35)'
  context.shadowBlur = HEAD_SHADOW_BLUR * scale
  if (marker.type === 'emoji') {
    context.shadowBlur = 0
    context.font = `${radius * 2}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText(marker.emoji || '📍', x, y + radius * 0.06)
  } else if (marker.type === 'photo' && marker.photo) {
    context.shadowBlur = 0
    context.beginPath()
    context.arc(x, y, radius, 0, Math.PI * 2)
    context.fillStyle = '#ffffff'
    context.fill()
    context.save()
    context.beginPath()
    context.arc(x, y, radius, 0, Math.PI * 2)
    context.clip()
    context.drawImage(marker.photo, x - radius, y - radius, radius * 2, radius * 2)
    context.restore()
  } else {
    context.fillStyle = '#24191d'
    context.beginPath()
    context.arc(x, y, radius, 0, Math.PI * 2)
    context.fill()
  }
  context.shadowBlur = 0
  context.strokeStyle = ringColor
  context.lineWidth = HEAD_RING_WIDTH * scale
  context.beginPath()
  context.arc(x, y, HEAD_RING_RADIUS * scale, 0, Math.PI * 2)
  context.stroke()
  context.restore()
}

function drawRecapCard(context, size, journey, text, progress, mapStyle) {
  const dark = mapStyle === 'dark'
  const scale = overlayScale(size)
  const alpha = easeOutCubic(Math.max(0, Math.min(1, (progress - 0.55) / 0.45)))

  context.save()
  context.globalAlpha = alpha
  context.fillStyle = 'rgba(0, 0, 0, 0.42)'
  context.fillRect(0, 0, size.width, size.height)

  const cardW = Math.min(size.width * 0.78, 420 * scale)
  const cardH = 300 * scale
  const cardX = (size.width - cardW) / 2
  const cardY = (size.height - cardH) / 2 - 10 * scale
  context.fillStyle = dark ? 'rgba(13, 16, 23, 0.94)' : 'rgba(255, 248, 250, 0.95)'
  context.beginPath()
  context.roundRect(cardX, cardY, cardW, cardH, 24 * scale)
  context.fill()
  context.strokeStyle = dark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.08)'
  context.lineWidth = 1
  context.stroke()

  const titleColor = dark ? '#e8ecf4' : '#24191d'
  const subColor = dark ? '#93a0b5' : '#5c4b52'
  context.textAlign = 'center'
  context.fillStyle = titleColor
  context.font = `700 ${30 * scale}px -apple-system, BlinkMacSystemFont, sans-serif`
  context.fillText(text.title, size.width / 2, cardY + 58 * scale, cardW - 32 * scale)
  context.fillStyle = subColor
  context.font = `${16 * scale}px -apple-system, BlinkMacSystemFont, sans-serif`
  context.fillText(text.periodLabel, size.width / 2, cardY + 90 * scale)

  const stats = journey.stats
  const countedKm = Math.round(
    journey.totalDistanceKm * easeOutCubic(progress),
  ).toLocaleString('id-ID', { maximumFractionDigits: 0 })
  const rows = [
    ['📏', 'Total jarak', `${countedKm} km`],
    ['📅', 'Durasi', `${stats.days} hari`],
    ['🗓️', 'Rentang', stats.yearMin === stats.yearMax ? `${stats.yearMin}` : `${stats.yearMin} – ${stats.yearMax}`],
    ['📍', 'Titik lokasi', stats.pointCount.toLocaleString('id-ID')],
  ]
  const rowH = 34 * scale
  const startY = cardY + 118 * scale
  rows.forEach(([icon, label, value], index) => {
    const y = startY + index * rowH
    context.textAlign = 'left'
    context.font = `${15 * scale}px -apple-system, BlinkMacSystemFont, sans-serif`
    context.fillText(`${icon}  ${label}`, cardX + 26 * scale, y)
    context.textAlign = 'right'
    context.font = `600 ${15 * scale}px -apple-system, BlinkMacSystemFont, sans-serif`
    context.fillStyle = dark ? '#f5c542' : '#e90064'
    context.fillText(value, cardX + cardW - 26 * scale, y)
    context.fillStyle = subColor
    context.textAlign = 'center'
  })
  context.restore()
}

export function drawFrame(canvas, journey, frame, text) {
  const context = canvas.getContext('2d')
  if (!context) throw new AppError('errorCanvasUnavailable', 'Canvas rendering is unavailable.')
  const size = { width: canvas.width, height: canvas.height }
  const preparedAspect = aspectOf(journey.size)
  if (Math.abs(aspectOf(size) - preparedAspect) > preparedAspect * ASPECT_EPSILON) {
    throw new AppError('errorAspectRatio', 'The prepared journey does not match the canvas aspect ratio.')
  }
  const scale = overlayScale(size)
  const style = journey.style || {}
  const mapStyle = style.mapStyle || 'light'
  const route = ROUTE_COLORS[style.routeColor] || ROUTE_COLORS.pink
  const marker = style.marker || { type: 'circle' }
  const dark = mapStyle === 'dark'

  context.clearRect(0, 0, size.width, size.height)
  const journeyViewport = cameraViewportAt(journey.cameraTrack, frame.journeyProgress)
  const viewport = frame.outroProgress <= 0
    ? journeyViewport
    : blendViewport(journeyViewport, journey.overviewViewport, easeOutCubic(frame.outroProgress), journey.size)
  drawMapBackground(canvas, viewport, journey.tiles, mapStyle)

  const current = pointAtProgress(journey, frame.journeyProgress)
  context.lineCap = 'round'
  context.lineJoin = 'round'
  const activeAlpha = 1 - easeOutCubic(frame.outroProgress)
  context.save()
  context.globalAlpha = activeAlpha
  const traveled = journey.worldPoints.slice(0, current.completedIndex + 1)
  context.strokeStyle = hexToRgba(route.main, 0.34)
  context.lineWidth = TRAIL_WIDTH * scale
  strokeRoute(context, traveled, current.point, viewport, size)

  const currentDistance = journey.totalDistanceKm * Math.max(0, Math.min(1, frame.journeyProgress))
  const recentStartDistance = Math.max(0, currentDistance - Math.max(80, journey.totalDistanceKm * 0.16))
  const recentStartIndex = Math.max(
    0,
    journey.cumulativeDistanceKm.findIndex((distance) => distance >= recentStartDistance),
  )
  context.strokeStyle = route.main
  context.lineWidth = RECENT_TRAIL_WIDTH * scale
  strokeRoute(
    context,
    journey.worldPoints.slice(recentStartIndex, current.completedIndex + 1),
    current.point,
    viewport,
    size,
  )
  const [headX, headY] = worldToCanvas(current.point, viewport, size)
  drawHeadMarker(context, headX, headY, scale, marker, route.main)
  context.restore()

  if (frame.outroProgress > 0) {
    context.save()
    context.globalAlpha = (190 / 255) * easeInOutCubic(frame.outroProgress)
    context.strokeStyle = route.main
    context.lineWidth = OVERVIEW_TRAIL_WIDTH * scale
    for (const segment of journey.overviewRouteSegments) {
      strokeRoute(context, segment.slice(0, -1), segment.at(-1) ?? current.point, viewport, size)
    }
    context.restore()
  }

  const card = overlayCard(size)
  context.fillStyle = dark ? 'rgba(13, 16, 23, 0.86)' : 'rgba(255, 248, 250, 0.86)'
  context.beginPath()
  context.roundRect(card.left, card.top, card.width, card.bottom - card.top, 24 * scale)
  context.fill()
  context.textAlign = 'center'
  context.fillStyle = dark ? '#e8ecf4' : '#24191d'
  context.font = `700 ${34 * scale}px -apple-system, BlinkMacSystemFont, sans-serif`
  context.fillText(text.title, card.centerX, 72 * scale, card.width - 36 * scale)
  context.fillStyle = dark ? '#93a0b5' : '#5c4b52'
  context.font = `${20 * scale}px -apple-system, BlinkMacSystemFont, sans-serif`
  context.fillText(text.periodLabel, card.centerX, 108 * scale)

  // Odometer live: km & bulan nge-count di bawah judul
  if (frame.outroProgress <= 0 && journey.points.length >= 1) {
    const locale = text.locale || 'id-ID'
    const t0 = journey.points[0].instant.getTime()
    const t1 = journey.points[journey.points.length - 1].instant.getTime()
    const instant = new Date(t0 + (t1 - t0) * Math.max(0, Math.min(1, frame.journeyProgress)))
    const monthLabel = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(instant)
    const liveKm = Math.round(currentDistance).toLocaleString(locale)
    const liveText = `${liveKm} km · ${monthLabel}`
    context.fillStyle = route.main
    context.font = `700 ${19 * scale}px -apple-system, BlinkMacSystemFont, sans-serif`
    context.fillText(liveText, card.centerX, 140 * scale, card.width - 32 * scale)
  }

  context.textAlign = 'right'
  context.fillStyle = dark ? 'rgba(232, 236, 244, 0.55)' : 'rgba(36, 25, 29, 0.78)'
  context.font = `${13 * scale}px -apple-system, BlinkMacSystemFont, sans-serif`
  context.fillText(MAP_ATTRIBUTION, size.width - 12 * scale, size.height - 12 * scale)

  if (style.recap !== false && frame.outroProgress > 0) {
    drawRecapCard(context, size, journey, text, frame.outroProgress, mapStyle)
  }
}
