import './style.css'
import type { HexMap, Terrain } from './mapTypes.ts'
import { generateBrowserMap } from './browserGenerator.ts'
import { downloadCanvasPng, downloadJson } from './downloads.ts'
import { loadMapJson } from './loadMapJson.ts'
import { createSampleMap } from './sampleMap.ts'
import { randomSeed } from './seededRandom.ts'
import {
  getViewMetrics,
  type MapViewport,
  renderHexMap,
  TERRAIN_COLORS,
} from './renderCanvas.ts'

const VIEW_PADDING = 24
const PREFERRED_HEX_SIZE = 18
const ZOOM_STEP = 1.2
const TERRAIN_ORDER: Terrain[] = [
  'deep_ocean',
  'ocean',
  'plains',
  'hills',
  'mountain',
  'high_mountain',
  'tundra',
  'ice',
]

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
          <dt>Rows</dt>
          <dd id="map-rows">Loading</dd>
        </div>
        <div>
          <dt>Cols</dt>
          <dd id="map-cols">Loading</dd>
        </div>
        <div>
          <dt>Tiles</dt>
          <dd id="map-tiles">Loading</dd>
        </div>
        <div>
          <dt>Seed</dt>
          <dd id="map-seed">Loading</dd>
        </div>
        <div>
          <dt>Zoom</dt>
          <dd id="zoom-level">100%</dd>
        </div>
      </dl>
      <label class="grid-toggle">
        <input id="grid-toggle" type="checkbox" checked />
        <span>Show grid</span>
      </label>
      <div class="seed-controls" aria-label="Seed controls">
        <label for="seed-input">Seed</label>
        <input id="seed-input" type="number" inputmode="numeric" placeholder="Enter seed" />
        <button id="generate-seed" type="button">Generate from Seed</button>
        <button id="random-seed" type="button">Random Seed</button>
        <button id="load-json-sample" type="button">Load Sample JSON</button>
      </div>
      <div class="viewer-controls" aria-label="Map view controls">
        <button id="zoom-out" type="button">-</button>
        <button id="reset-view" type="button">Reset View</button>
        <button id="zoom-in" type="button">+</button>
      </div>
      <div class="download-controls" aria-label="Download controls">
        <button id="download-json" type="button">Download JSON</button>
        <button id="download-png" type="button">Download PNG</button>
      </div>
      <section class="terrain-legend" aria-label="Terrain legend">
        <h3>Terrain</h3>
        <ul id="terrain-legend"></ul>
      </section>
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
const mapRows = document.querySelector<HTMLElement>('#map-rows')!
const mapCols = document.querySelector<HTMLElement>('#map-cols')!
const mapTiles = document.querySelector<HTMLElement>('#map-tiles')!
const mapSeed = document.querySelector<HTMLElement>('#map-seed')!
const zoomLevel = document.querySelector<HTMLElement>('#zoom-level')!
const gridToggle = document.querySelector<HTMLInputElement>('#grid-toggle')!
const terrainLegend = document.querySelector<HTMLUListElement>('#terrain-legend')!
const seedInput = document.querySelector<HTMLInputElement>('#seed-input')!
const generateSeedButton = document.querySelector<HTMLButtonElement>('#generate-seed')!
const randomSeedButton = document.querySelector<HTMLButtonElement>('#random-seed')!
const loadJsonSampleButton = document.querySelector<HTMLButtonElement>('#load-json-sample')!
const zoomOutButton = document.querySelector<HTMLButtonElement>('#zoom-out')!
const resetViewButton = document.querySelector<HTMLButtonElement>('#reset-view')!
const zoomInButton = document.querySelector<HTMLButtonElement>('#zoom-in')!
const downloadJsonButton = document.querySelector<HTMLButtonElement>('#download-json')!
const downloadPngButton = document.querySelector<HTMLButtonElement>('#download-png')!
let currentMap: HexMap = createSampleMap()
let viewport: MapViewport = {
  offsetX: 0,
  offsetY: 0,
  zoom: 1,
  minZoom: 0.6,
  maxZoom: 8,
}
let isGridVisible = true
let isPanning = false
let isViewFitted = true
let lastPointerX = 0
let lastPointerY = 0
let layoutFrame = 0

const draw = () => {
  renderHexMap(canvas, currentMap, {
    drawGrid: isGridVisible,
    hexSize: PREFERRED_HEX_SIZE,
    padding: VIEW_PADDING,
    viewport,
  })
  updateZoomLevel()
}

function updateMapDetails(map: HexMap, source: string): void {
  tileCount.textContent = `${map.cols} x ${map.rows} tiles`
  mapSource.textContent = source
  mapRows.textContent = String(map.rows)
  mapCols.textContent = String(map.cols)
  mapTiles.textContent = String(map.tiles.length)
  mapSeed.textContent = map.seed === null ? 'None' : String(map.seed)
}

function setCurrentMap(map: HexMap, source: string): void {
  currentMap = map
  updateMapDetails(currentMap, source)
  seedInput.value = currentMap.seed === null ? '' : String(currentMap.seed)
  resetView()
}

function renderTerrainLegend(): void {
  terrainLegend.innerHTML = TERRAIN_ORDER.map(
    (terrain) => `
      <li>
        <span class="terrain-swatch" style="background: ${TERRAIN_COLORS[terrain]}"></span>
        <span>${terrain}</span>
      </li>
    `,
  ).join('')
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

function showStatus(message: string): void {
  statusLine.textContent = message
}

function seedFromInput(): number | null {
  const value = Number(seedInput.value)

  if (!Number.isInteger(value)) {
    return null
  }

  return value
}

function generateFromSeed(seed: number): void {
  seedInput.value = String(seed)
  setCurrentMap(generateBrowserMap(seed), 'Browser generated seed')
  showStatus(`Generated browser placeholder map from seed ${seed}.`)
}

async function loadJsonSample(): Promise<void> {
  currentMap = await loadMapJson('/sample-map.json')
  setCurrentMap(currentMap, 'JSON sample')
  showStatus('Loaded tracked Python export sample from /sample-map.json.')
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
    await loadJsonSample()
  } catch (error) {
    setCurrentMap(createSampleMap(), 'TypeScript fallback sample')
    showStatus(`JSON sample failed to load; using TypeScript fallback sample. ${String(error)}`)
  }
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

gridToggle.addEventListener('change', () => {
  isGridVisible = gridToggle.checked
  draw()
})

generateSeedButton.addEventListener('click', () => {
  const seed = seedFromInput()

  if (seed === null) {
    showStatus('Enter an integer seed before generating.')
    return
  }

  generateFromSeed(seed)
})
randomSeedButton.addEventListener('click', () => generateFromSeed(randomSeed()))
loadJsonSampleButton.addEventListener('click', () => {
  void loadJsonSample().catch((error: unknown) => {
    setCurrentMap(createSampleMap(), 'TypeScript fallback sample')
    showStatus(`JSON sample failed to load; using TypeScript fallback sample. ${String(error)}`)
  })
})

zoomOutButton.addEventListener('click', () => zoomFromCenter(1 / ZOOM_STEP))
resetViewButton.addEventListener('click', resetView)
zoomInButton.addEventListener('click', () => zoomFromCenter(ZOOM_STEP))
downloadJsonButton.addEventListener('click', () => {
  downloadJson('mapgen-map.json', currentMap)
  showStatus('JSON download started.')
})
downloadPngButton.addEventListener('click', () => {
  void downloadCanvasPng('mapgen-map.png', canvas)
    .then(() => showStatus('PNG download started.'))
    .catch((error: unknown) => showStatus(`PNG download failed. ${String(error)}`))
})

const resizeObserver = new ResizeObserver(() => {
  scheduleSettledDraw(isViewFitted)
})
resizeObserver.observe(canvasPanel)

window.addEventListener('resize', () => scheduleSettledDraw(isViewFitted))
renderTerrainLegend()
void boot()
