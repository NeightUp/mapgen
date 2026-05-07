import math

import pygame

from settings import HEX_SIZE, HEX_VERTICAL_OVERLAP


class Tile(pygame.sprite.Sprite):
    def __init__(self, map_tile, group):
        super().__init__(group)
        self.map_tile = map_tile
        self.row_index = map_tile.row
        self.col_index = map_tile.col
        self.noise = map_tile.elevation
        self.adj_noise = map_tile.adjusted_elevation
        self.tile_type = map_tile.terrain
        self.hex_radius = HEX_SIZE
        self.tile_width = math.ceil(math.sqrt(3) * self.hex_radius)
        self.tile_height = self.hex_radius * 2
        self.tile_pos = self.get_xy()
        self.center = (
            self.tile_pos[0] + self.tile_width // 2,
            self.tile_pos[1] + self.hex_radius,
        )
        self.points = self.get_corner_points()
        self.rect = pygame.Rect(
            self.tile_pos[0],
            self.tile_pos[1],
            self.tile_width,
            self.tile_height,
        )

    def get_xy(self):
        # uses the col and row index values to determine the map x and y positions
        x = self.col_index * self.tile_width
        if self.row_index % 2 != 0:
            x += self.tile_width // 2
        y = self.row_index * int(self.tile_height * HEX_VERTICAL_OVERLAP)
        return (x, y)

    def get_corner_points(self):
        points = []
        for index in range(6):
            angle = math.radians(60 * index - 90)
            x = self.center[0] + self.hex_radius * math.cos(angle)
            y = self.center[1] + self.hex_radius * math.sin(angle)
            points.append((round(x), round(y)))
        return points
