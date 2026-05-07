import type { HexMap, MapTile, Terrain } from './mapTypes.ts'

interface RenderOptions {
  drawGrid?: boolean
  hexSize?: number
  padding?: number
}

const TERRAIN_COLORS: Record<Terrain, string> = {
  ice: 'rgb(255, 255, 255)',
  tundra: 'rgb(175, 167, 123)',
  high_mountain: 'rgb(200, 200, 200)',
  mountain: 'rgb(150, 150, 150)',
  hills: 'rgb(43, 77, 27)',
  plains: 'rgb(137, 159, 74)',
  ocean: 'rgb(35, 137, 218)',
  deep_ocean: 'rgb(15, 94, 156)',
}

const GRID_COLOR = 'rgba(24, 32, 32, 0.55)'

export function renderHexMap(
  canvas: HTMLCanvasElement,
  map: HexMap,
  options: RenderOptions = {},
): void {
  const hexSize = options.hexSize ?? 18
  const padding = options.padding ?? 24
  const context = canvas.getContext('2d')

  if (!context) {
    return
  }

  resizeCanvas(canvas)

  context.clearRect(0, 0, canvas.width, canvas.height)
  context.save()
  context.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1)
  context.fillStyle = '#0e1820'
  context.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight)

  const bounds = mapBounds(map, hexSize)
  const offsetX = Math.max(padding, (canvas.clientWidth - bounds.width) / 2)
  const offsetY = Math.max(padding, (canvas.clientHeight - bounds.height) / 2)

  for (const tile of map.tiles) {
    drawTile(context, tile, hexSize, offsetX, offsetY, options.drawGrid ?? true)
  }

  context.restore()
}

function resizeCanvas(canvas: HTMLCanvasElement): void {
  const ratio = window.devicePixelRatio || 1
  const width = Math.floor(canvas.clientWidth * ratio)
  const height = Math.floor(canvas.clientHeight * ratio)

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width
    canvas.height = height
  }
}

function drawTile(
  context: CanvasRenderingContext2D,
  tile: MapTile,
  hexSize: number,
  offsetX: number,
  offsetY: number,
  drawGrid: boolean,
): void {
  const center = hexCenter(tile.row, tile.col, hexSize, offsetX, offsetY)
  const points = hexPoints(center.x, center.y, hexSize)

  context.beginPath()
  context.moveTo(points[0].x, points[0].y)

  for (const point of points.slice(1)) {
    context.lineTo(point.x, point.y)
  }

  context.closePath()
  context.fillStyle = TERRAIN_COLORS[tile.terrain]
  context.fill()

  if (drawGrid) {
    context.strokeStyle = GRID_COLOR
    context.lineWidth = 1
    context.stroke()
  }
}

function hexCenter(
  row: number,
  col: number,
  hexSize: number,
  offsetX: number,
  offsetY: number,
): { x: number; y: number } {
  const width = Math.sqrt(3) * hexSize
  const x = offsetX + width * (col + 0.5 * (row % 2)) + width / 2
  const y = offsetY + hexSize * 1.5 * row + hexSize

  return { x, y }
}

function hexPoints(centerX: number, centerY: number, hexSize: number): { x: number; y: number }[] {
  const points = []

  for (let corner = 0; corner < 6; corner += 1) {
    const angle = (Math.PI / 180) * (60 * corner - 30)
    points.push({
      x: centerX + hexSize * Math.cos(angle),
      y: centerY + hexSize * Math.sin(angle),
    })
  }

  return points
}

function mapBounds(map: HexMap, hexSize: number): { width: number; height: number } {
  const width = Math.sqrt(3) * hexSize * (map.cols + 0.5)
  const height = hexSize * (1.5 * (map.rows - 1) + 2)

  return { width, height }
}
