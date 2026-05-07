import './style.css'
import type { HexMap } from './mapTypes.ts'
import { loadMapJson } from './loadMapJson.ts'
import { createSampleMap } from './sampleMap.ts'
import { getViewMetrics, type MapViewport, renderHexMap } from './renderCanvas.ts'

const VIEW_PADDING = 24
const PREFERRED_HEX_SIZE = 18
const ZOOM_STEP = 1.2

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<main class="app-shell">
  <header class="app-header">
    <div>
      <h1>Mapgen</h1>
      <p id="status-line" class="status-line">Loading JSON sample map...</p>
    </div>
    <div class="map-meta" aria-label="Prototype map metadata">
      <span>Phase 3C</span>
      <span id="tile-count"></span>
    </div>
  </header>

  <section class="workspace" aria-label="Map browser prototype">
    <aside class="sidebar">
      <h2>Sample Map</h2>
      <dl>
        <div>
          <dt>Source</dt>
          <dd id="map-source">Loading</dd>
        </div>
        <div>
          <dt>Renderer</dt>
          <dd>HTML Canvas</dd>
        </div>
        <div>
          <dt>Seed</dt>
          <dd id="map-seed">Loading</dd>
        </div>
        <div>
          <dt>Grid</dt>
          <dd>Enabled</dd>
        </div>
        <div>
          <dt>Zoom</dt>
          <dd id="zoom-level">100%</dd>
        </div>
      </dl>
      <div class="viewer-controls" aria-label="Map view controls">
        <button id="zoom-out" type="button">-</button>
        <button id="reset-view" type="button">Reset View</button>
        <button id="zoom-in" type="button">+</button>
      </div>
    </aside>
    <div class="canvas-panel">
      <canvas id="map-canvas" aria-label="Solid-color hex map prototype"></canvas>
    </div>
  </section>
</main>
`

const canvas = document.querySelector<HTMLCanvasElement>('#map-canvas')!
const canvasPanel = document.querySelector<HTMLElement>('.canvas-panel')!
const statusLine = document.querySelector<HTMLParagraphElement>('#status-line')!
const tileCount = document.querySelector<HTMLSpanElement>('#tile-count')!
const mapSource = document.querySelector<HTMLElement>('#map-source')!
const mapSeed = document.querySelector<HTMLElement>('#map-seed')!
const zoomLevel = document.querySelector<HTMLElement>('#zoom-level')!
const zoomOutButton = document.querySelector<HTMLButtonElement>('#zoom-out')!
const resetViewButton = document.querySelector<HTMLButtonElement>('#reset-view')!
const zoomInButton = document.querySelector<HTMLButtonElement>('#zoom-in')!
let currentMap: HexMap = createSampleMap()
let viewport: MapViewport = {
  offsetX: 0,
  offsetY: 0,
  zoom: 1,
  minZoom: 0.6,
  maxZoom: 8,
}
let isPanning = false
let isViewFitted = true
let lastPointerX = 0
let lastPointerY = 0
let layoutFrame = 0

const draw = () => {
  renderHexMap(canvas, currentMap, {
    drawGrid: true,
    hexSize: PREFERRED_HEX_SIZE,
    padding: VIEW_PADDING,
    viewport,
  })
  updateZoomLevel()
}

function updateMapDetails(map: HexMap, source: string): void {
  tileCount.textContent = `${map.cols} x ${map.rows} tiles`
  mapSource.textContent = source
  mapSeed.textContent = map.seed === null ? 'None' : String(map.seed)
}

function fitViewportToCanvas(): void {
  const metrics = getViewMetrics(canvas, currentMap, VIEW_PADDING, PREFERRED_HEX_SIZE)

  viewport = {
    ...viewport,
    offsetX: metrics.originX,
    offsetY: metrics.originY,
    zoom: 1,
  }
}

function resetView(): void {
  isViewFitted = true
  scheduleSettledDraw(true)
}

function updateZoomLevel(): void {
  zoomLevel.textContent = `${Math.round(viewport.zoom * 100)}%`
}

function clampZoom(zoom: number): number {
  return Math.min(viewport.maxZoom, Math.max(viewport.minZoom, zoom))
}

function zoomAt(clientX: number, clientY: number, nextZoom: number): void {
  const clampedZoom = clampZoom(nextZoom)

  if (clampedZoom === viewport.zoom) {
    return
  }

  const rect = canvas.getBoundingClientRect()
  const mouseX = clientX - rect.left
  const mouseY = clientY - rect.top
  const mapX = (mouseX - viewport.offsetX) / viewport.zoom
  const mapY = (mouseY - viewport.offsetY) / viewport.zoom

  viewport = {
    ...viewport,
    offsetX: mouseX - mapX * clampedZoom,
    offsetY: mouseY - mapY * clampedZoom,
    zoom: clampedZoom,
  }
  isViewFitted = false
  draw()
}

function zoomFromCenter(multiplier: number): void {
  const rect = canvas.getBoundingClientRect()
  zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, viewport.zoom * multiplier)
}

function scheduleSettledDraw(fitView: boolean): void {
  window.cancelAnimationFrame(layoutFrame)
  layoutFrame = window.requestAnimationFrame(() => {
    layoutFrame = window.requestAnimationFrame(() => {
      if (fitView) {
        fitViewportToCanvas()
      }

      draw()
    })
  })
}

async function boot(): Promise<void> {
  try {
    currentMap = await loadMapJson('/sample-map.json')
    statusLine.textContent = 'Loaded tracked Python export sample from /sample-map.json.'
    updateMapDetails(currentMap, 'JSON sample')
  } catch (error) {
    currentMap = createSampleMap()
    statusLine.textContent = `JSON sample failed to load; using TypeScript fallback sample. ${String(error)}`
    updateMapDetails(currentMap, 'TypeScript fallback sample')
  }

  resetView()
}

canvas.addEventListener('pointerdown', (event) => {
  isPanning = true
  lastPointerX = event.clientX
  lastPointerY = event.clientY
  canvas.classList.add('is-panning')
  canvas.setPointerCapture(event.pointerId)
})

canvas.addEventListener('pointermove', (event) => {
  if (!isPanning) {
    return
  }

  viewport = {
    ...viewport,
    offsetX: viewport.offsetX + event.clientX - lastPointerX,
    offsetY: viewport.offsetY + event.clientY - lastPointerY,
  }
  isViewFitted = false
  lastPointerX = event.clientX
  lastPointerY = event.clientY
  draw()
})

canvas.addEventListener('pointerup', (event) => {
  isPanning = false
  canvas.classList.remove('is-panning')
  canvas.releasePointerCapture(event.pointerId)
})

canvas.addEventListener('pointercancel', () => {
  isPanning = false
  canvas.classList.remove('is-panning')
})

canvas.addEventListener(
  'wheel',
  (event) => {
    event.preventDefault()
    const multiplier = event.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP
    zoomAt(event.clientX, event.clientY, viewport.zoom * multiplier)
  },
  { passive: false },
)

zoomOutButton.addEventListener('click', () => zoomFromCenter(1 / ZOOM_STEP))
resetViewButton.addEventListener('click', resetView)
zoomInButton.addEventListener('click', () => zoomFromCenter(ZOOM_STEP))

const resizeObserver = new ResizeObserver(() => {
  scheduleSettledDraw(isViewFitted)
})
resizeObserver.observe(canvasPanel)
resizeObserver.observe(canvas)

window.addEventListener('resize', () => scheduleSettledDraw(isViewFitted))
void boot()
