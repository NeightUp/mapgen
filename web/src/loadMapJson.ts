import type { HexMap, MapTile, Terrain } from './mapTypes.ts'

const TERRAIN_TYPES = new Set<Terrain>([
  'deep_ocean',
  'ocean',
  'plains',
  'hills',
  'mountain',
  'high_mountain',
  'tundra',
  'ice',
])

export async function loadMapJson(path: string): Promise<HexMap> {
  const response = await fetch(path)

  if (!response.ok) {
    throw new Error(`Failed to load ${path}: ${response.status}`)
  }

  return parseMapJson(await response.json())
}

function parseMapJson(value: unknown): HexMap {
  if (!isRecord(value)) {
    throw new Error('Map JSON root must be an object')
  }

  const rows = requireNumber(value.rows, 'rows')
  const cols = requireNumber(value.cols, 'cols')
  const seed = parseSeed(value.seed)
  const tilesValue = value.tiles

  if (!Array.isArray(tilesValue)) {
    throw new Error('Map JSON tiles must be an array')
  }

  return {
    rows,
    cols,
    seed,
    tiles: tilesValue.map(parseTile),
  }
}

function parseTile(value: unknown, index: number): MapTile {
  if (!isRecord(value)) {
    throw new Error(`Tile ${index} must be an object`)
  }

  const terrain = parseTerrain(value.terrain, index)
  const features = value.features

  if (!Array.isArray(features) || features.some((feature) => typeof feature !== 'string')) {
    throw new Error(`Tile ${index} features must be an array of strings`)
  }

  return {
    row: requireNumber(value.row, `tiles[${index}].row`),
    col: requireNumber(value.col, `tiles[${index}].col`),
    terrain,
    elevation: requireNumber(value.elevation, `tiles[${index}].elevation`),
    adjusted_elevation: requireNumber(
      value.adjusted_elevation,
      `tiles[${index}].adjusted_elevation`,
    ),
    moisture: requireNumber(value.moisture, `tiles[${index}].moisture`),
    temperature: requireNumber(value.temperature, `tiles[${index}].temperature`),
    biome: requireString(value.biome, `tiles[${index}].biome`),
    features,
  }
}

function parseSeed(value: unknown): number | null {
  if (value === null) {
    return null
  }

  if (typeof value === 'number') {
    return value
  }

  throw new Error('Map JSON seed must be a number or null')
}

function parseTerrain(value: unknown, index: number): Terrain {
  if (typeof value === 'string' && TERRAIN_TYPES.has(value as Terrain)) {
    return value as Terrain
  }

  throw new Error(`Tile ${index} has unknown terrain`)
}

function requireNumber(value: unknown, label: string): number {
  if (typeof value === 'number') {
    return value
  }

  throw new Error(`${label} must be a number`)
}

function requireString(value: unknown, label: string): string {
  if (typeof value === 'string') {
    return value
  }

  throw new Error(`${label} must be a string`)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
