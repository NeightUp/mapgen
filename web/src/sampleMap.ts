import type { HexMap, Terrain } from './mapTypes.ts'

const ROWS = 28
const COLS = 44

export function createSampleMap(): HexMap {
  const tiles = []

  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const elevation = sampleElevation(row, col)
      tiles.push({
        row,
        col,
        elevation,
        terrain: terrainFor(row, elevation),
      })
    }
  }

  return {
    rows: ROWS,
    cols: COLS,
    tiles,
  }
}

function sampleElevation(row: number, col: number): number {
  const centerRow = ROWS * 0.52
  const centerCol = COLS * 0.48
  const y = (row - centerRow) / (ROWS * 0.42)
  const x = (col - centerCol) / (COLS * 0.36)
  const continent = 0.72 - (x * x + y * y)
  const ridges = Math.sin(col * 0.55) * 0.12 + Math.cos(row * 0.7 + col * 0.15) * 0.1
  const shelf = Math.cos((row + col) * 0.22) * 0.06

  return continent + ridges + shelf - 0.22
}

function terrainFor(row: number, elevation: number): Terrain {
  const polarDistance = Math.min(row, ROWS - row - 1)

  if (polarDistance <= 1) {
    return 'ice'
  }

  if (polarDistance <= 4 && elevation >= -0.05) {
    return 'tundra'
  }

  if (elevation >= 0.45) {
    return 'high_mountain'
  }

  if (elevation >= 0.3) {
    return 'mountain'
  }

  if (elevation >= 0.1) {
    return 'hills'
  }

  if (elevation >= -0.05) {
    return 'plains'
  }

  if (elevation >= -0.12) {
    return 'ocean'
  }

  return 'deep_ocean'
}
