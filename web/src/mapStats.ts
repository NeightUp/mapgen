import type { HexMap, Terrain } from './mapTypes.ts'

export const TERRAIN_STATS_ORDER: Terrain[] = [
  'deep_ocean',
  'ocean',
  'plains',
  'hills',
  'mountain',
  'high_mountain',
  'tundra',
  'ice',
]

export interface MapStats {
  totalTiles: number
  landTiles: number
  waterTiles: number
  landPercent: number
  waterPercent: number
  edgeTiles: number
  edgeLandTiles: number
  edgeLandPercent: number
  terrainCounts: Record<Terrain, number>
  landBalanceLabel: 'Low land' | 'Balanced' | 'High land'
  edgeLandLabel: 'Clean' | 'Watch' | 'Heavy'
}

const WATER_TERRAINS = new Set<Terrain>(['deep_ocean', 'ocean'])

export function calculateMapStats(map: HexMap): MapStats {
  const terrainCounts = emptyTerrainCounts()
  let waterTiles = 0
  let edgeLandTiles = 0

  for (const tile of map.tiles) {
    terrainCounts[tile.terrain] += 1

    const isWater = WATER_TERRAINS.has(tile.terrain)

    if (isWater) {
      waterTiles += 1
    }

    if (!isWater && (tile.col === 0 || tile.col === map.cols - 1)) {
      edgeLandTiles += 1
    }
  }

  const totalTiles = map.tiles.length
  const landTiles = totalTiles - waterTiles
  const edgeTiles = map.rows * 2
  const landPercent = percent(landTiles, totalTiles)
  const waterPercent = percent(waterTiles, totalTiles)
  const edgeLandPercent = percent(edgeLandTiles, edgeTiles)

  return {
    totalTiles,
    landTiles,
    waterTiles,
    landPercent,
    waterPercent,
    edgeTiles,
    edgeLandTiles,
    edgeLandPercent,
    terrainCounts,
    landBalanceLabel: landBalanceLabel(landPercent),
    edgeLandLabel: edgeLandLabel(edgeLandTiles),
  }
}

function emptyTerrainCounts(): Record<Terrain, number> {
  return Object.fromEntries(TERRAIN_STATS_ORDER.map((terrain) => [terrain, 0])) as Record<
    Terrain,
    number
  >
}

function percent(count: number, total: number): number {
  if (total === 0) {
    return 0
  }

  return (count / total) * 100
}

function landBalanceLabel(landPercent: number): MapStats['landBalanceLabel'] {
  if (landPercent < 25) {
    return 'Low land'
  }

  if (landPercent > 55) {
    return 'High land'
  }

  return 'Balanced'
}

function edgeLandLabel(edgeLandTiles: number): MapStats['edgeLandLabel'] {
  if (edgeLandTiles === 0) {
    return 'Clean'
  }

  if (edgeLandTiles <= 5) {
    return 'Watch'
  }

  return 'Heavy'
}
