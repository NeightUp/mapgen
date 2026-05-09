export type Terrain =
  | 'deep_ocean'
  | 'ocean'
  | 'plains'
  | 'hills'
  | 'mountain'
  | 'high_mountain'
  | 'relief_very_low'
  | 'relief_low'
  | 'relief_low_mid'
  | 'relief_mid'
  | 'relief_high_mid'
  | 'relief_high'
  | 'relief_mountain'
  | 'relief_peak'
  | 'tundra'
  | 'ice'

export interface MapTile {
  row: number
  col: number
  terrain: Terrain
  elevation: number
  adjusted_elevation: number
  moisture: number
  temperature: number
  biome: string
  features: string[]
}

export interface HexMap {
  rows: number
  cols: number
  seed: number | null
  tiles: MapTile[]
}
