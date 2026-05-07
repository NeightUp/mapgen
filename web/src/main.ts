import './style.css'
import type { HexMap } from './mapTypes.ts'
import { loadMapJson } from './loadMapJson.ts'
import { createSampleMap } from './sampleMap.ts'
import { renderHexMap } from './renderCanvas.ts'

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
      </dl>
    </aside>
    <div class="canvas-panel">
      <canvas id="map-canvas" aria-label="Solid-color hex map prototype"></canvas>
    </div>
  </section>
</main>
`

const canvas = document.querySelector<HTMLCanvasElement>('#map-canvas')!
const statusLine = document.querySelector<HTMLParagraphElement>('#status-line')!
const tileCount = document.querySelector<HTMLSpanElement>('#tile-count')!
const mapSource = document.querySelector<HTMLElement>('#map-source')!
const mapSeed = document.querySelector<HTMLElement>('#map-seed')!
let currentMap: HexMap = createSampleMap()

const draw = () => {
  renderHexMap(canvas, currentMap, {
    drawGrid: true,
    hexSize: 18,
    padding: 24,
  })
}

function updateMapDetails(map: HexMap, source: string): void {
  tileCount.textContent = `${map.cols} x ${map.rows} tiles`
  mapSource.textContent = source
  mapSeed.textContent = map.seed === null ? 'None' : String(map.seed)
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

  draw()
}

window.addEventListener('resize', draw)
void boot()
