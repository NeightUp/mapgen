import pygame
import math
from pathlib import Path

from generator import WorldGenerator
from settings import *
from tile import Tile

BASE_DIR = Path(__file__).resolve().parent


class Map:
    def __init__(self):
        self.world = WorldGenerator().generate()
        self.camera_group = CameraGroup(self.world)
        self.generate_map()

    def generate_map(self):
        for map_tile in self.world.tiles:
            Tile(map_tile, self.camera_group)
        self.camera_group.draw_full_map()

    def run(self):
        self.camera_group.custom_draw()

    def handle_resize(self):
        self.camera_group.handle_resize()

class CameraGroup(pygame.sprite.Group):
    # class to control the camera and track the screen location on the map
    def __init__(self, world):
        super().__init__()
        self.display_surface = pygame.display.get_surface()
        self.world = world
        self.offset = pygame.math.Vector2()
        self.map_size = self.get_full_map_size()
        self.map_surface = pygame.Surface(self.map_size)
        self.map_rect = self.map_surface.get_rect()
        self.grid_check = True
        self.previous_sprite = None
        self.active_pixel = (0, 0)
        self.border_size = 30
        camera_rect_size = self.get_camera_rect()
        self.camera_rect = pygame.Rect(self.border_size, self.border_size, camera_rect_size[0], camera_rect_size[1])

    def get_full_map_size(self):
        # this function uses code-drawn hex dimensions to calculate the full map surface
        tile_width = math.ceil(math.sqrt(3) * HEX_SIZE)
        tile_height = HEX_SIZE * 2
        width = int(tile_width * (self.world.cols + 0.5))
        height = int((tile_height * HEX_VERTICAL_OVERLAP) * (self.world.rows + 0.5))
        return (width, height)

    def get_camera_rect(self):
        # calculates the overall size of the camera rect
        width = max(1, self.display_surface.get_size()[0] - (self.border_size * 2))
        height = max(1, self.display_surface.get_size()[1] - (self.border_size * 2))
        return(width, height)

    def handle_resize(self):
        self.display_surface = pygame.display.get_surface()
        camera_rect_size = self.get_camera_rect()
        self.camera_rect.size = camera_rect_size

    def draw_full_map(self):
        # draws the map tiles and saves an image of the entire map
        self.map_surface.fill(DEEP_WATER_COLOR)
        for sprite in self.sprites():
            self.draw_tile(sprite)
        pygame.image.save(self.map_surface, BASE_DIR / "full_map.png")

    def draw_tile(self, tile, outline_color=None):
        color = TERRAIN_COLORS.get(tile.tile_type, PLAINS_COLOR)
        pygame.draw.polygon(self.map_surface, color, tile.points)
        if self.grid_check or outline_color is not None:
            pygame.draw.polygon(
                self.map_surface,
                outline_color or GRID_COLOR,
                tile.points,
                1,
            )

    def camera_pixel_position(self, pos):
        # this function checks and moves the camera position around on the map surface
        # by using the mouse position and a small border inside the display surface.
        # it keeps the map inside the bounds of the screen.
        speed = 5
        if pos[0] < self.camera_rect.left:
            self.camera_rect.left -= speed
            if self.camera_rect.left - self.border_size < self.map_rect.left:
                self.camera_rect.left = self.map_rect.left + self.border_size
        if pos[0] > self.camera_rect.right:
            self.camera_rect.right += speed
            if self.camera_rect.right + self.border_size > self.map_rect.right:
                self.camera_rect.right = self.map_rect.right - self.border_size
        if pos[1] > self.camera_rect.bottom:
            self.camera_rect.bottom += speed
            if self.camera_rect.bottom + self.border_size > self.map_rect.bottom:
                self.camera_rect.bottom = self.map_rect.bottom - self.border_size
        if pos[1] < self.camera_rect.top:
            self.camera_rect.top -= speed
            if self.camera_rect.top - self.border_size < self.map_rect.top:
                self.camera_rect.top = self.map_rect.top + self.border_size
        self.offset.x = self.camera_rect.left - self.border_size
        self.offset.y = self.camera_rect.top - self.border_size

    def check_mouse(self, tile):
        # checks if the mouse is near the center of a tile
        check = False
        mouse_pos = pygame.mouse.get_pos()
        pos = mouse_pos + self.offset
        square = ((pos[0] - tile.center[0]) ** 2, (pos[1] - tile.center[1]) ** 2)
        if (math.sqrt(square[0]) + math.sqrt(square[1])) <= tile.hex_radius + 2:
            check = True
        return check

    def custom_draw(self):
        # function to draw the map to the screen.
        self.camera_pixel_position(pygame.mouse.get_pos() + self.offset)
        for sprite in self.sprites():
            if self.check_mouse(sprite):
                self.draw_tile(sprite, HOVER_GRID_COLOR)
                # check if the mouse has moved and fill in the tiles behind the mouse
                if self.previous_sprite != sprite and self.previous_sprite is not None:
                    self.draw_tile(self.previous_sprite)
                self.previous_sprite = sprite
        #calculate the offset and draw the map
        offset_pos = self.map_rect.topleft - self.offset
        self.display_surface.blit(self.map_surface, offset_pos)
