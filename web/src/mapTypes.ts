export type Terrain =
  | 'deep_ocean'
  | 'ocean'
  | 'plains'
  | 'hills'
  | 'mountain'
  | 'high_mountain'
  | 'tundra'
  | 'ice'

export interface MapTile {
  row: number
  col: number
  elevation: number
  terrain: Terrain
}

export interface HexMap {
  rows: number
  cols: number
  tiles: MapTile[]
}
