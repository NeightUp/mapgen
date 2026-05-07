import random

from perlin_noise import PerlinNoise

from settings import (
    COLS,
    HILLS,
    H_MOUNTAIN,
    ICE,
    MAP_SEED,
    MOUNTAIN,
    OCEAN,
    PLAINS,
    ROWS,
    TUNDRA,
)
from world import MapTile, WorldMap


class WorldGenerator:
    def __init__(self, rows=ROWS, cols=COLS, seed=MAP_SEED):
        self.rows = rows
        self.cols = cols
        self.seed = seed
        self.random = random.Random(seed)

    def generate(self):
        noise_layers = self._build_elevation_noise()
        tiles = []

        for row in range(self.rows):
            for col in range(self.cols):
                elevation = self._elevation_at(row, col, noise_layers)
                adjusted_elevation, terrain = self._classify_terrain(
                    row, col, elevation
                )
                tiles.append(
                    MapTile(
                        row=row,
                        col=col,
                        elevation=elevation,
                        adjusted_elevation=adjusted_elevation,
                        terrain=terrain,
                    )
                )

        return WorldMap(self.rows, self.cols, tiles, seed=self.seed)

    def _build_elevation_noise(self):
        octaves = (3, 6, 12, 24, 48)

        if self.seed is None:
            return [PerlinNoise(octaves=octave) for octave in octaves]

        return [
            PerlinNoise(octaves=octave, seed=self.seed + index)
            for index, octave in enumerate(octaves)
        ]

    def _elevation_at(self, row, col, noise_layers):
        position = [row / self.rows, col / self.cols]
        weights = (1, 0.5, 0.25, 0.125, 0.0625)
        return sum(
            weight * noise(position)
            for weight, noise in zip(weights, noise_layers)
        )

    def _classify_terrain(self, row, col, elevation):
        value = self._apply_ocean_edges(col, elevation)
        value = self._apply_polar_bands(row, value)
        return value, self._terrain_from_value(value)

    def _apply_ocean_edges(self, col, elevation):
        value = elevation

        if col == 0 or col == self.cols - 1:
            if value >= OCEAN:
                value -= 0.4
        elif col <= 1 or col >= self.cols - 2:
            if value >= OCEAN:
                value -= 0.2
        elif col <= 2 or col >= self.cols - 3:
            if value >= PLAINS:
                value -= 0.1
        elif col <= 5 or col >= self.cols - 6:
            if value >= PLAINS:
                value -= 0.05

        return value

    def _apply_polar_bands(self, row, elevation):
        if row == 0 or row == self.rows - 1:
            return ICE

        if row == 1 or row == self.rows - 2:
            if self.random.randint(1, 5) != 5:
                return ICE
            if elevation >= PLAINS:
                return TUNDRA
            return elevation

        if row == 2 or row == self.rows - 3:
            if self.random.randint(1, 4) != 4:
                return ICE
            if elevation >= PLAINS:
                return TUNDRA
            return elevation

        if row == 3 or row == self.rows - 4:
            if elevation >= PLAINS:
                return TUNDRA
            return elevation

        if row == 4 or row == self.rows - 5:
            if elevation >= PLAINS and self.random.randint(1, 5) != 5:
                return TUNDRA
            return elevation

        if row == 5 or row == self.rows - 6:
            if elevation >= PLAINS and self.random.randint(1, 2) == 2:
                return TUNDRA
            return elevation

        return elevation

    def _terrain_from_value(self, value):
        if value == ICE:
            return "ice"
        if value == TUNDRA:
            return "tundra"
        if value >= H_MOUNTAIN:
            return "high_mountain"
        if value >= MOUNTAIN:
            return "mountain"
        if value >= HILLS:
            return "hills"
        if value >= PLAINS:
            return "plains"
        if value >= OCEAN:
            return "ocean"
        return "deep_ocean"
