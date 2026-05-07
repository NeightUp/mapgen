import type { HexMap, Terrain } from './mapTypes.ts'
import { createSeededRandom } from './seededRandom.ts'

const ROWS = 45
const COLS = 85

export function generateBrowserMap(seed: number): HexMap {
  const random = createSeededRandom(seed)
  const phaseA = random() * Math.PI * 2
  const phaseB = random() * Math.PI * 2
  const phaseC = random() * Math.PI * 2
  const centerRow = ROWS * (0.45 + random() * 0.12)
  const centerCol = COLS * (0.42 + random() * 0.16)
  const tiles = []

  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const elevation = elevationAt(row, col, centerRow, centerCol, phaseA, phaseB, phaseC)
      const adjustedElevation = applyPolarBands(row, elevation)
      const terrain = terrainFor(adjustedElevation)

      tiles.push({
        row,
        col,
        terrain,
        elevation,
        adjusted_elevation: adjustedElevation,
        moisture: 0,
        temperature: 0,
        biome: '',
        features: [],
      })
    }
  }

  return {
    rows: ROWS,
    cols: COLS,
    seed,
    tiles,
  }
}

function elevationAt(
  row: number,
  col: number,
  centerRow: number,
  centerCol: number,
  phaseA: number,
  phaseB: number,
  phaseC: number,
): number {
  const x = (col - centerCol) / (COLS * 0.36)
  const y = (row - centerRow) / (ROWS * 0.42)
  const continent = 0.62 - (x * x + y * y)
  const ridgeA = Math.sin(col * 0.24 + row * 0.08 + phaseA) * 0.18
  const ridgeB = Math.cos(row * 0.31 - col * 0.06 + phaseB) * 0.12
  const roughness = Math.sin((row + col) * 0.17 + phaseC) * 0.08
  const edgeOcean = edgeFalloff(col)

  return continent + ridgeA + ridgeB + roughness - edgeOcean - 0.08
}

function edgeFalloff(col: number): number {
  const distanceFromEdge = Math.min(col, COLS - col - 1)

  if (distanceFromEdge <= 0) {
    return 0.38
  }

  if (distanceFromEdge <= 1) {
    return 0.22
  }

  if (distanceFromEdge <= 3) {
    return 0.1
  }

  if (distanceFromEdge <= 5) {
    return 0.04
  }

  return 0
}

function applyPolarBands(row: number, elevation: number): number {
  const polarDistance = Math.min(row, ROWS - row - 1)

  if (polarDistance <= 1) {
    return 1
  }

  if (polarDistance <= 4 && elevation >= -0.05) {
    return 2
  }

  return elevation
}

function terrainFor(value: number): Terrain {
  if (value === 1) {
    return 'ice'
  }

  if (value === 2) {
    return 'tundra'
  }

  if (value >= 0.45) {
    return 'high_mountain'
  }

  if (value >= 0.3) {
    return 'mountain'
  }

  if (value >= 0.1) {
    return 'hills'
  }

  if (value >= -0.05) {
    return 'plains'
  }

  if (value >= -0.12) {
    return 'ocean'
  }

  return 'deep_ocean'
}
