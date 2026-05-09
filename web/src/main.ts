import './style.css'
import type { HexMap, Terrain } from './mapTypes.ts'
import {
  DEFAULT_GENERATOR_SETTINGS,
  generateBrowserMap,
  type GeneratorSettings,
} from './browserGenerator.ts'
import { downloadCanvasPng, downloadJson } from './downloads.ts'
import { loadMapJson } from './loadMapJson.ts'
import { calculateMapStats } from './mapStats.ts'
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
      <span>Source <strong id="map-source">Loading</strong></span>
      <span>Seed <strong id="map-seed">Loading</strong></span>
      <span>Zoom <strong id="zoom-level">100%</strong></span>
      <span>Rows <strong id="map-rows">Loading</strong></span>
      <span>Cols <strong id="map-cols">Loading</strong></span>
      <span>Total <strong id="map-tiles">Loading</strong></span>
      <span id="tile-count"></span>
    </div>
  </header>

  <section class="stats-banner" aria-label="Map quality diagnostics">
    <article>
      <span>Land</span>
      <strong id="stats-land">Loading</strong>
    </article>
    <article>
      <span>Water</span>
      <strong id="stats-water">Loading</strong>
    </article>
    <article>
      <span>E/W Edge Land</span>
      <strong id="stats-edge-land">Loading</strong>
    </article>
    <article>
      <span>Land Balance</span>
      <strong id="stats-land-balance">Loading</strong>
    </article>
    <article>
      <span>Edge Status</span>
      <strong id="stats-edge-label">Loading</strong>
    </article>
  </section>

  <section class="workspace" aria-label="Map browser prototype">
    <div class="canvas-panel">
      <canvas id="map-canvas" aria-label="Solid-color hex map prototype"></canvas>
      <section id="terrain-legend-panel" class="terrain-legend" aria-label="Terrain legend">
        <div class="terrain-legend-header">
          <h3>Terrain</h3>
          <button
            id="terrain-legend-toggle"
            class="terrain-legend-toggle"
            type="button"
            aria-expanded="true"
            aria-controls="terrain-legend"
          >
            -
          </button>
        </div>
        <ul id="terrain-legend" class="terrain-legend-body"></ul>
      </section>
    </div>

    <aside class="control-sidebar">
      <section class="panel-section generator-controls" aria-label="Generator controls">
        <h2>Generator</h2>
        <label class="seed-field" for="seed-input">Seed</label>
        <input id="seed-input" type="number" inputmode="numeric" placeholder="Enter seed" />
        <button id="generate-seed" type="button">Generate from Seed</button>
        <button id="random-seed" type="button">Random Seed</button>
        <button id="load-json-sample" type="button">Load Sample JSON</button>
        <label class="slider-control" for="sea-level">
          <span>Sea Level</span>
          <output id="sea-level-value"></output>
          <input id="sea-level" type="range" min="-0.2" max="0.2" step="0.01" />
        </label>
        <label class="slider-control" for="mountain-amount">
          <span>Mountain Amount</span>
          <output id="mountain-amount-value"></output>
          <input id="mountain-amount" type="range" min="0.5" max="1.8" step="0.05" />
        </label>
        <label class="slider-control" for="roughness">
          <span>Roughness</span>
          <output id="roughness-value"></output>
          <input id="roughness" type="range" min="0.4" max="1.8" step="0.05" />
        </label>
        <button id="reset-generator-settings" type="button">Reset Generator Settings</button>
      </section>

      <section class="panel-section view-export-controls" aria-label="Map view and export controls">
        <h2>View & Export</h2>
        <label class="grid-toggle">
          <input id="grid-toggle" type="checkbox" checked />
          <span>Show grid</span>
        </label>
        <div class="viewer-controls" aria-label="Zoom controls">
          <button id="zoom-out" type="button">-</button>
          <button id="reset-view" type="button">Reset View</button>
          <button id="zoom-in" type="button">+</button>
        </div>
        <button id="download-json" type="button">Download JSON</button>
        <button id="download-png" type="button">Download PNG</button>
      </section>
    </aside>
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
const statsLand = document.querySelector<HTMLElement>('#stats-land')!
const statsWater = document.querySelector<HTMLElement>('#stats-water')!
const statsLandBalance = document.querySelector<HTMLElement>('#stats-land-balance')!
const statsEdgeLand = document.querySelector<HTMLElement>('#stats-edge-land')!
const statsEdgeLabel = document.querySelector<HTMLElement>('#stats-edge-label')!
const gridToggle = document.querySelector<HTMLInputElement>('#grid-toggle')!
const terrainLegendPanel = document.querySelector<HTMLElement>('#terrain-legend-panel')!
const terrainLegendHeader = document.querySelector<HTMLElement>('.terrain-legend-header')!
const terrainLegendToggle = document.querySelector<HTMLButtonElement>('#terrain-legend-toggle')!
const terrainLegend = document.querySelector<HTMLUListElement>('#terrain-legend')!
const seedInput = document.querySelector<HTMLInputElement>('#seed-input')!
const seaLevelInput = document.querySelector<HTMLInputElement>('#sea-level')!
const seaLevelValue = document.querySelector<HTMLOutputElement>('#sea-level-value')!
const mountainAmountInput = document.querySelector<HTMLInputElement>('#mountain-amount')!
const mountainAmountValue = document.querySelector<HTMLOutputElement>('#mountain-amount-value')!
const roughnessInput = document.querySelector<HTMLInputElement>('#roughness')!
const roughnessValue = document.querySelector<HTMLOutputElement>('#roughness-value')!
const resetGeneratorSettingsButton = document.querySelector<HTMLButtonElement>(
  '#reset-generator-settings',
)!
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
let isTerrainLegendCollapsed = false
let isTerrainLegendDragging = false
let terrainLegendPointerId: number | null = null
let terrainLegendDragOffsetX = 0
let terrainLegendDragOffsetY = 0

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
  updateMapStats(currentMap)
  seedInput.value = currentMap.seed === null ? '' : String(currentMap.seed)
  resetView()
}

function updateMapStats(map: HexMap): void {
  const stats = calculateMapStats(map)

  statsLand.textContent = `${stats.landTiles} (${formatPercent(stats.landPercent)})`
  statsWater.textContent = `${stats.waterTiles} (${formatPercent(stats.waterPercent)})`
  statsLandBalance.textContent = stats.landBalanceLabel
  statsEdgeLand.textContent = `${stats.edgeLandTiles} (${formatPercent(stats.edgeLandPercent)})`
  statsEdgeLabel.textContent = stats.edgeLandLabel
  setStatusClass(statsLandBalance, statusClassForLandBalance(stats.landBalanceLabel))
  setStatusClass(statsEdgeLabel, statusClassForEdgeLand(stats.edgeLandLabel))
  renderTerrainLegend(stats.terrainCounts)
}

type StatusClass = 'status-positive' | 'status-warning' | 'status-danger' | 'status-info'

function setStatusClass(element: HTMLElement, statusClass: StatusClass): void {
  element.classList.remove('status-positive', 'status-warning', 'status-danger', 'status-info')
  element.classList.add(statusClass)
}

function statusClassForLandBalance(
  label: 'Too low' | 'Low land' | 'Balanced' | 'High land',
): StatusClass {
  if (label === 'Balanced') {
    return 'status-positive'
  }

  if (label === 'Low land') {
    return 'status-warning'
  }

  return 'status-danger'
}

function statusClassForEdgeLand(label: 'Clean' | 'Watch' | 'Heavy'): StatusClass {
  if (label === 'Clean') {
    return 'status-positive'
  }

  if (label === 'Watch') {
    return 'status-warning'
  }

  return 'status-danger'
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}

function formatTerrainName(terrain: Terrain): string {
  return terrain.replaceAll('_', ' ')
}

function renderTerrainLegend(terrainCounts?: Record<Terrain, number>): void {
  terrainLegend.innerHTML = TERRAIN_ORDER.map(
    (terrain) => `
      <li>
        <span class="terrain-swatch" style="background: ${TERRAIN_COLORS[terrain]}"></span>
        <span>${formatTerrainName(terrain)} (${terrainCounts?.[terrain] ?? 0})</span>
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

function generatorSettingsFromInputs(): GeneratorSettings {
  return {
    seaLevel: Number(seaLevelInput.value),
    mountainAmount: Number(mountainAmountInput.value),
    roughness: Number(roughnessInput.value),
  }
}

function initializeGeneratorSettings(): void {
  seaLevelInput.value = String(DEFAULT_GENERATOR_SETTINGS.seaLevel)
  mountainAmountInput.value = String(DEFAULT_GENERATOR_SETTINGS.mountainAmount)
  roughnessInput.value = String(DEFAULT_GENERATOR_SETTINGS.roughness)
  updateGeneratorSettingLabels()
}

function updateGeneratorSettingLabels(): void {
  seaLevelValue.textContent = Number(seaLevelInput.value).toFixed(2)
  mountainAmountValue.textContent = Number(mountainAmountInput.value).toFixed(2)
  roughnessValue.textContent = Number(roughnessInput.value).toFixed(2)
}

function generateFromSeed(seed: number): void {
  const settings = generatorSettingsFromInputs()

  seedInput.value = String(seed)
  setCurrentMap(generateBrowserMap(seed, settings), 'Browser generated seed')
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

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function setTerrainLegendPosition(left: number, top: number): void {
  const panelRect = canvasPanel.getBoundingClientRect()
  const legendRect = terrainLegendPanel.getBoundingClientRect()
  const maxLeft = Math.max(0, panelRect.width - legendRect.width)
  const maxTop = Math.max(0, panelRect.height - legendRect.height)

  terrainLegendPanel.style.left = `${clamp(left, 0, maxLeft)}px`
  terrainLegendPanel.style.top = `${clamp(top, 0, maxTop)}px`
  terrainLegendPanel.style.bottom = 'auto'
}

function clampTerrainLegendPosition(): void {
  const left = Number.parseFloat(terrainLegendPanel.style.left)
  const top = Number.parseFloat(terrainLegendPanel.style.top)

  if (Number.isNaN(left) || Number.isNaN(top)) {
    return
  }

  setTerrainLegendPosition(left, top)
}

function toggleTerrainLegend(): void {
  isTerrainLegendCollapsed = !isTerrainLegendCollapsed
  terrainLegendPanel.classList.toggle('is-collapsed', isTerrainLegendCollapsed)
  terrainLegendToggle.textContent = isTerrainLegendCollapsed ? '+' : '-'
  terrainLegendToggle.setAttribute('aria-expanded', String(!isTerrainLegendCollapsed))
  window.requestAnimationFrame(clampTerrainLegendPosition)
}

function stopTerrainLegendDrag(event: PointerEvent): void {
  if (!isTerrainLegendDragging || event.pointerId !== terrainLegendPointerId) {
    return
  }

  isTerrainLegendDragging = false
  terrainLegendPointerId = null
  terrainLegendPanel.classList.remove('is-dragging')

  if (terrainLegendHeader.hasPointerCapture(event.pointerId)) {
    terrainLegendHeader.releasePointerCapture(event.pointerId)
  }
}

async function boot(): Promise<void> {
  try {
    await loadJsonSample()
  } catch (error) {
    setCurrentMap(createSampleMap(), 'TypeScript fallback sample')
    showStatus(`JSON sample failed to load; using TypeScript fallback sample. ${String(error)}`)
  }
}

terrainLegendPanel.addEventListener('pointerdown', (event) => {
  event.stopPropagation()
})

terrainLegendHeader.addEventListener('pointerdown', (event) => {
  const target = event.target as HTMLElement

  if (target.closest('button')) {
    return
  }

  event.preventDefault()
  event.stopPropagation()

  const panelRect = canvasPanel.getBoundingClientRect()
  const legendRect = terrainLegendPanel.getBoundingClientRect()

  isTerrainLegendDragging = true
  terrainLegendPointerId = event.pointerId
  terrainLegendDragOffsetX = event.clientX - legendRect.left
  terrainLegendDragOffsetY = event.clientY - legendRect.top
  terrainLegendPanel.classList.add('is-dragging')
  terrainLegendHeader.setPointerCapture(event.pointerId)
  setTerrainLegendPosition(legendRect.left - panelRect.left, legendRect.top - panelRect.top)
})

terrainLegendHeader.addEventListener('pointermove', (event) => {
  if (!isTerrainLegendDragging || event.pointerId !== terrainLegendPointerId) {
    return
  }

  event.preventDefault()
  const panelRect = canvasPanel.getBoundingClientRect()
  setTerrainLegendPosition(
    event.clientX - panelRect.left - terrainLegendDragOffsetX,
    event.clientY - panelRect.top - terrainLegendDragOffsetY,
  )
})

terrainLegendHeader.addEventListener('pointerup', stopTerrainLegendDrag)
terrainLegendHeader.addEventListener('pointercancel', stopTerrainLegendDrag)
terrainLegendToggle.addEventListener('click', (event) => {
  event.stopPropagation()
  toggleTerrainLegend()
})

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

for (const input of [seaLevelInput, mountainAmountInput, roughnessInput]) {
  input.addEventListener('input', updateGeneratorSettingLabels)
}

resetGeneratorSettingsButton.addEventListener('click', () => {
  initializeGeneratorSettings()
  showStatus('Generator settings reset to defaults.')
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
  clampTerrainLegendPosition()
  scheduleSettledDraw(isViewFitted)
})
resizeObserver.observe(canvasPanel)

window.addEventListener('resize', () => scheduleSettledDraw(isViewFitted))
renderTerrainLegend()
initializeGeneratorSettings()
void boot()
