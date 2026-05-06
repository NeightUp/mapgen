from dataclasses import dataclass, field


@dataclass(frozen=True)
class MapTile:
    row: int
    col: int
    elevation: float
    adjusted_elevation: float
    terrain: str
    moisture: float = 0
    temperature: float = 0
    biome: str = ""
    features: tuple[str, ...] = field(default_factory=tuple)


class WorldMap:
    def __init__(self, rows, cols, tiles):
        self.rows = rows
        self.cols = cols
        self.tiles = tiles
        self._by_index = {(tile.row, tile.col): tile for tile in tiles}

    def get_tile(self, row, col):
        return self._by_index.get((row, col))

    def neighbors(self, tile):
        # Odd-row horizontal hex layout. This is not used by rendering yet, but
        # it gives rivers, regions, and pathfinding a shared place to start.
        if tile.row % 2:
            offsets = ((-1, 0), (-1, 1), (0, -1), (0, 1), (1, 0), (1, 1))
        else:
            offsets = ((-1, -1), (-1, 0), (0, -1), (0, 1), (1, -1), (1, 0))

        for row_offset, col_offset in offsets:
            neighbor = self.get_tile(tile.row + row_offset, tile.col + col_offset)
            if neighbor is not None:
                yield neighbor
