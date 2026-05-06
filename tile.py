import pygame
from settings import HEX_VERTICAL_OVERLAP

class Tile(pygame.sprite.Sprite):                    
    def __init__(self, map_tile, image, group):
        super().__init__(group)
        self.map_tile = map_tile
        self.row_index = map_tile.row
        self.col_index = map_tile.col
        self.noise = map_tile.elevation
        self.adj_noise = map_tile.adjusted_elevation
        self.tile_type = map_tile.terrain
        self.tile_image = image
        self.tile_image_width = self.tile_image.get_width()
        self.tile_image_height = self.tile_image.get_height()
        self.tile_pos = self.get_xy()
        self.tile_image_rect = self.tile_image.get_rect(topleft=self.tile_pos)

    def get_xy(self):
        # uses the col and row index values to determine the map x and y positions
        x = self.col_index * self.tile_image_width
        if self.row_index % 2 != 0:                      # on odd numbered rows
            x += self.tile_image_width // 2              # move a half tile over to fit in with above and below tiles
        y = self.row_index * int(self.tile_image_height * HEX_VERTICAL_OVERLAP)
        return(x, y)
