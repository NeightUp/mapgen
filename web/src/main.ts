import './style.css'
import { createSampleMap } from './sampleMap.ts'
import { renderHexMap } from './renderCanvas.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<main class="app-shell">
  <header class="app-header">
    <div>
      <h1>Mapgen</h1>
      <p class="status-line">Browser prototype: hardcoded sample data rendered as solid-color Canvas hexes.</p>
    </div>
    <div class="map-meta" aria-label="Prototype map metadata">
      <span>Phase 3A/3B</span>
      <span id="tile-count"></span>
    </div>
  </header>

  <section class="workspace" aria-label="Map browser prototype">
    <aside class="sidebar">
      <h2>Sample Map</h2>
      <dl>
        <div>
          <dt>Source</dt>
          <dd>TypeScript placeholder</dd>
        </div>
        <div>
          <dt>Renderer</dt>
          <dd>HTML Canvas</dd>
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

const sampleMap = createSampleMap()
const canvas = document.querySelector<HTMLCanvasElement>('#map-canvas')!
const tileCount = document.querySelector<HTMLSpanElement>('#tile-count')!

tileCount.textContent = `${sampleMap.cols} x ${sampleMap.rows} tiles`

const draw = () => {
  renderHexMap(canvas, sampleMap, {
    drawGrid: true,
    hexSize: 18,
    padding: 24,
  })
}

draw()
window.addEventListener('resize', draw)
