import type { HexMap, Terrain } from './mapTypes.ts'
import { createSeededRandom } from './seededRandom.ts'

const ROWS = 45
const COLS = 85

const ICE = 1
const TUNDRA = 2
const HIGH_MOUNTAIN = 0.45
const MOUNTAIN = 0.3
const HILLS = 0.1
const PLAINS = -0.05
const OCEAN = -0.12

const NOISE_OCTAVES = [3, 6, 12, 24, 48] as const
const NOISE_WEIGHTS = [1, 0.5, 0.25, 0.125, 0.0625] as const
const RELIEF_OCTAVES = [4, 9, 18, 36] as const
const RELIEF_WEIGHTS = [1, 0.55, 0.28, 0.14] as const
const EDGE_OCEAN_PRESSURE_WIDTH = 8
const EDGE_OCEAN_MAX_PRESSURE = 0.42
const EDGE_OCEAN_NOISE_STRENGTH = 1.2
const EDGE_OCEAN_BORDER_CAP = OCEAN - 0.04
const CONTINENT_SEPARATION_MAX_PRESSURE = 0.09
const CONTINENT_SEPARATION_BASE_WIDTH = 0.095
const CONTINENT_SEPARATION_WIDTH_VARIATION = 0.025
const CONTINENT_SEPARATION_WARP_STRENGTH = 0.055
const CONTINENT_SEPARATION_DETAIL_STRENGTH = 0.18

interface NoiseLayer {
  octaves: number
  seed: number
}

export interface GeneratorSettings {
  seaLevel: number
  mountainAmount: number
  roughness: number
}

export const DEFAULT_GENERATOR_SETTINGS: GeneratorSettings = {
  seaLevel: 0.05,
  mountainAmount: 1,
  roughness: 1,
}

export function generateBrowserMap(
  seed: number,
  settings: GeneratorSettings = DEFAULT_GENERATOR_SETTINGS,
): HexMap {
  const landShapeLayers = buildLandShapeNoise(seed)
  const reliefLayers = buildReliefNoise(seed)
  const polarRandom = createSeededRandom(seed ^ 0x9e3779b9)
  const tiles = []

  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const landShapeValue = landShapeAt(row, col, landShapeLayers, settings)
      const seaLevelAdjustedValue = applySeaLevel(landShapeValue, settings)
      const edgeAdjustedLandValue = applyEdgeOceanPressure(row, col, seaLevelAdjustedValue, seed)
      const separatedLandValue = applyContinentSeparationPressure(
        row,
        col,
        edgeAdjustedLandValue,
        seed,
      )
      const isLand = separatedLandValue >= PLAINS
      const reliefValue = isLand ? reliefAt(row, col, reliefLayers, settings) : separatedLandValue
      const baseTerrain = isLand
        ? terrainFromRelief(reliefValue, settings)
        : terrainFromWaterValue(separatedLandValue)
      const terrain = applyPolarTerrainOverlay(row, baseTerrain, polarRandom)
      const adjustedElevation = adjustedDisplayValue(terrain, separatedLandValue, reliefValue)

      tiles.push({
        row,
        col,
        terrain,
        // Compatibility field: this remains the sea-level-adjusted land-shape value until
        // explicit land_shape_value and relief_value fields are added to the data model.
        elevation: seaLevelAdjustedValue,
        // Compatibility field: this now tracks the final display/classification value.
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

function buildLandShapeNoise(seed: number): NoiseLayer[] {
  return NOISE_OCTAVES.map((octaves, index) => ({
    octaves,
    seed: seed + index * 1013,
  }))
}

function buildReliefNoise(seed: number): NoiseLayer[] {
  return RELIEF_OCTAVES.map((octaves, index) => ({
    octaves,
    seed: seed + 0x51f15e + index * 1709,
  }))
}

function landShapeAt(
  row: number,
  col: number,
  noiseLayers: NoiseLayer[],
  settings: GeneratorSettings,
): number {
  const y = row / ROWS
  const x = col / COLS
  const layeredNoise = noiseLayers.reduce(
    (total, layer, index) => total + NOISE_WEIGHTS[index] * valueNoise2d(x, y, layer),
    0,
  )
  const continentMask = continentShape(x, y)
  const roughness = clamp(settings.roughness, 0.4, 1.8)

  return layeredNoise * 0.52 * roughness + continentMask
}

function applySeaLevel(landShapeValue: number, settings: GeneratorSettings): number {
  const seaLevel = clamp(settings.seaLevel, -0.2, 0.2)

  return landShapeValue - seaLevel
}

function applyEdgeOceanPressure(
  row: number,
  col: number,
  adjustedLandValue: number,
  seed: number,
): number {
  const pressure = edgeOceanPressure(row, col, seed)

  if (pressure === 0) {
    return adjustedLandValue
  }

  const pressuredValue = adjustedLandValue - pressure

  if (col === 0 || col === COLS - 1) {
    return Math.min(pressuredValue, EDGE_OCEAN_BORDER_CAP)
  }

  return pressuredValue
}

function applyContinentSeparationPressure(
  row: number,
  col: number,
  adjustedLandValue: number,
  seed: number,
): number {
  // First-pass land-shape pressure only; continent detection and cleanup remain later passes.
  const pressure = continentSeparationPressure(row, col, seed)

  if (pressure === 0) {
    return adjustedLandValue
  }

  return adjustedLandValue - pressure
}

function continentSeparationPressure(row: number, col: number, seed: number): number {
  const x = col / (COLS - 1)
  const y = row / (ROWS - 1)
  const warpLayer = { octaves: 3, seed: seed ^ 0x27d4eb2d }
  const widthLayer = { octaves: 4, seed: seed ^ 0x165667b1 }
  const detailLayer = { octaves: 9, seed: seed ^ 0xd3a2646c }
  const centerlineWarp = valueNoise2d(0.41, y, warpLayer) * CONTINENT_SEPARATION_WARP_STRENGTH
  const centerline = 0.5 + centerlineWarp
  const widthNoise = (valueNoise2d(0.73, y, widthLayer) + 1) / 2
  const width =
    CONTINENT_SEPARATION_BASE_WIDTH +
    (widthNoise - 0.5) * 2 * CONTINENT_SEPARATION_WIDTH_VARIATION
  const distanceFromCenter = Math.abs(x - centerline)

  if (distanceFromCenter >= width) {
    return 0
  }

  const influence = smoothStep(1 - distanceFromCenter / width)
  const detailNoise = valueNoise2d(x, y, detailLayer)
  const detailVariation = clamp(
    1 + detailNoise * CONTINENT_SEPARATION_DETAIL_STRENGTH,
    0.7,
    1.15,
  )

  return CONTINENT_SEPARATION_MAX_PRESSURE * influence * detailVariation
}

function edgeOceanPressure(row: number, col: number, seed: number): number {
  const edgeDistance = Math.min(col, COLS - 1 - col)

  if (edgeDistance >= EDGE_OCEAN_PRESSURE_WIDTH) {
    return 0
  }

  if (edgeDistance === 0) {
    return EDGE_OCEAN_MAX_PRESSURE
  }

  const edgeSide = col < COLS / 2 ? 0 : 1
  const rowVariation = hashNoise(edgeSide, row, seed ^ 0x85ebca6b) * EDGE_OCEAN_NOISE_STRENGTH
  const warpedDistance = edgeDistance + rowVariation
  const edgeInfluence = clamp(1 - warpedDistance / EDGE_OCEAN_PRESSURE_WIDTH, 0, 1)

  return EDGE_OCEAN_MAX_PRESSURE * smoothStep(edgeInfluence)
}

function reliefAt(
  row: number,
  col: number,
  reliefLayers: NoiseLayer[],
  _settings: GeneratorSettings,
): number {
  const y = row / ROWS
  const x = col / COLS
  const weightTotal = RELIEF_WEIGHTS.reduce((total, weight) => total + weight, 0)
  const layeredNoise =
    reliefLayers.reduce(
      (total, layer, index) => total + RELIEF_WEIGHTS[index] * valueNoise2d(x, y, layer),
      0,
    ) / weightTotal
  const ridgeNoise = Math.abs(
    valueNoise2d(x + 0.37, y - 0.19, {
      octaves: 14,
      seed: reliefLayers[0].seed ^ 0x6d2b79f5,
    }),
  )
  const ridgeRelief = (1 - ridgeNoise) * 0.16

  return layeredNoise * 0.32 + ridgeRelief - 0.03
}

function applyPolarTerrainOverlay(row: number, terrain: Terrain, random: () => number): Terrain {
  const polarDistance = Math.min(row, ROWS - 1 - row)

  // Temporary display/classification overlay until climate and biome layers exist.
  // Ice can overlay water at the poles, but tundra should only overlay land terrain.
  if (polarDistance === 0) {
    return 'ice'
  }

  if (rollChance(random, iceChanceForPolarDistance(polarDistance))) {
    return 'ice'
  }

  if (!isLandTerrain(terrain)) {
    return terrain
  }

  if (rollChance(random, tundraChanceForPolarDistance(polarDistance))) {
    return 'tundra'
  }

  return terrain
}

function iceChanceForPolarDistance(polarDistance: number): number {
  if (polarDistance === 1) {
    return 0.8
  }

  if (polarDistance === 2) {
    return 0.6
  }

  if (polarDistance === 3) {
    return 0.2
  }

  if (polarDistance === 4) {
    return 0.05
  }

  return 0
}

function tundraChanceForPolarDistance(polarDistance: number): number {
  if (polarDistance <= 4) {
    return 1
  }

  if (polarDistance === 5) {
    return 0.8
  }

  if (polarDistance === 6) {
    return 0.6
  }

  if (polarDistance === 7) {
    return 0.4
  }

  if (polarDistance === 8) {
    return 0.2
  }

  if (polarDistance === 9) {
    return 0.1
  }

  return 0
}

function rollChance(random: () => number, chance: number): boolean {
  return chance > 0 && random() < chance
}

function isLandTerrain(terrain: Terrain): boolean {
  return terrain !== 'deep_ocean' && terrain !== 'ocean'
}

function terrainFromRelief(reliefValue: number, settings: GeneratorSettings): Terrain {
  const mountainAmount = clamp(settings.mountainAmount, 0.5, 1.8)
  const highMountainThreshold = HIGH_MOUNTAIN / mountainAmount
  const mountainThreshold = MOUNTAIN / mountainAmount

  if (reliefValue >= highMountainThreshold) {
    return 'high_mountain'
  }

  if (reliefValue >= mountainThreshold) {
    return 'mountain'
  }

  if (reliefValue >= HILLS) {
    return 'hills'
  }

  return 'plains'
}

function terrainFromWaterValue(landValue: number): Terrain {
  if (landValue >= OCEAN) {
    return 'ocean'
  }

  return 'deep_ocean'
}

function adjustedDisplayValue(terrain: Terrain, landValue: number, reliefValue: number): number {
  if (terrain === 'ice') {
    return ICE
  }

  if (terrain === 'tundra') {
    return TUNDRA
  }

  if (terrain === 'deep_ocean' || terrain === 'ocean') {
    return landValue
  }

  return reliefValue
}

function continentShape(x: number, y: number): number {
  const westMass = radialFalloff(x, y, 0.25, 0.48, 0.31, 0.5)
  const eastMass = radialFalloff(x, y, 0.72, 0.5, 0.27, 0.42)
  const secondaryIslands = secondaryIslandShape(x, y)
  const separationValley = broadSeparationValley(x, y)
  const polarOcean = Math.abs(y - 0.5) * 0.18

  return Math.max(westMass, eastMass, secondaryIslands) - separationValley - 0.42 - polarOcean
}

function secondaryIslandShape(x: number, y: number): number {
  const northIslandArc = radialFalloff(x, y, 0.44, 0.25, 0.1, 0.17)
  const southIslandArc = radialFalloff(x, y, 0.57, 0.73, 0.11, 0.18)
  const offsetIslets = Math.max(
    radialFalloff(x, y, 0.46, 0.42, 0.06, 0.1),
    radialFalloff(x, y, 0.55, 0.58, 0.06, 0.1),
  )

  return Math.max(northIslandArc, southIslandArc, offsetIslets) * 0.42
}

function broadSeparationValley(x: number, y: number): number {
  const centerline = 0.5 + Math.sin((y - 0.08) * Math.PI * 2) * 0.035
  const width = 0.13 + Math.cos(y * Math.PI * 2) * 0.015
  const distanceFromCenter = Math.abs(x - centerline)
  const influence = clamp(1 - distanceFromCenter / width, 0, 1)

  return smoothStep(influence) * 0.045
}

function radialFalloff(
  x: number,
  y: number,
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number,
): number {
  const dx = (x - centerX) / radiusX
  const dy = (y - centerY) / radiusY
  return 0.65 - (dx * dx + dy * dy) * 0.32
}

function valueNoise2d(x: number, y: number, layer: NoiseLayer): number {
  const sampleX = x * layer.octaves
  const sampleY = y * layer.octaves
  const x0 = Math.floor(sampleX)
  const y0 = Math.floor(sampleY)
  const tx = smoothStep(sampleX - x0)
  const ty = smoothStep(sampleY - y0)
  const a = hashNoise(x0, y0, layer.seed)
  const b = hashNoise(x0 + 1, y0, layer.seed)
  const c = hashNoise(x0, y0 + 1, layer.seed)
  const d = hashNoise(x0 + 1, y0 + 1, layer.seed)

  return lerp(lerp(a, b, tx), lerp(c, d, tx), ty)
}

function hashNoise(x: number, y: number, seed: number): number {
  let value = seed >>> 0
  value ^= Math.imul(x, 374761393)
  value ^= Math.imul(y, 668265263)
  value = Math.imul(value ^ (value >>> 13), 1274126177)

  return (((value ^ (value >>> 16)) >>> 0) / 2147483648) - 1
}

function smoothStep(value: number): number {
  return value * value * (3 - 2 * value)
}

function lerp(a: number, b: number, amount: number): number {
  return a + (b - a) * amount
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
