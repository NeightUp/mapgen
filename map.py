import pygame
import math
from pathlib import Path

from generator import WorldGenerator
from settings import *
from tile import Tile

BASE_DIR = Path(__file__).resolve().parent
TILE_DIR = BASE_DIR / "tiles"


class TileImages:
    def __init__(self):
        self.terrain_images = {
            "ice": self._load("ice.png"),
            "tundra": self._load("tundra.png"),
            "high_mountain": self._load("high_mountain.png"),
            "mountain": self._load("mountains.png"),
            "hills": self._load("hills.png"),
            "plains": self._load("plains.png"),
            "ocean": self._load("water.png"),
            "deep_ocean": self._load("deep_water.png"),
        }
        self.grid_black = self._load("grid_black.png")
        self.grid_white = self._load("grid_white.png")

    def terrain(self, terrain_type):
        return self.terrain_images[terrain_type]

    def _load(self, filename):
        return pygame.image.load(str(TILE_DIR / filename)).convert_alpha()


class Map:
    def __init__(self):
        self.tile_images = TileImages()
        self.world = WorldGenerator().generate()
        self.camera_group = CameraGroup(self.tile_images, self.world)
        self.generate_map()

    def generate_map(self):
        for map_tile in self.world.tiles:
            image = self.tile_images.terrain(map_tile.terrain)
            Tile(map_tile, image, self.camera_group)
        self.camera_group.draw_full_map()

    def run(self):
        self.camera_group.custom_draw()

    def handle_resize(self):
        self.camera_group.handle_resize()

class CameraGroup(pygame.sprite.Group):
    # class to control the camera and track the screen location on the map
    def __init__(self, tile_images, world):
        super().__init__()
        self.display_surface = pygame.display.get_surface()
        self.tile_images = tile_images
        self.world = world
        self.offset = pygame.math.Vector2()
        self.grid_image_black = tile_images.grid_black
        self.grid_image_white = tile_images.grid_white
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
        # this function uses the tile border image to calculate the overall size of the map surface
        tile = self.grid_image_black.get_rect()
        width = int(tile.width * (self.world.cols + 0.5))
        height = int((tile.height * HEX_VERTICAL_OVERLAP) * (self.world.rows + 0.5))
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
        # draws the map tiles and the black tile borders to the map surface
        # and saves an image of the entire map
        for sprite in self.sprites():
            self.map_surface.blit(sprite.tile_image, sprite.tile_pos)
            if self.grid_check:
                self.map_surface.blit(self.grid_image_black, sprite.tile_pos)
        pygame.image.save(self.map_surface, BASE_DIR / "full_map.png")

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
        #checks if the mouse is near the center of a tile
        check = False
        mouse_pos = pygame.mouse.get_pos()
        pos = mouse_pos + self.offset
        square = ((pos[0] - tile.tile_image_rect.centerx) ** 2, (pos[1] - tile.tile_image_rect.centery) ** 2)
        if (math.sqrt(square[0]) + math.sqrt(square[1])) <= tile.tile_image_height // 2 + 2:
             check = True
        return check

    def custom_draw(self):
        # function to draw the map to the screen.
        self.camera_pixel_position(pygame.mouse.get_pos() + self.offset)
        for sprite in self.sprites():
            if self.check_mouse(sprite):
                self.map_surface.blit(self.grid_image_white, sprite.tile_pos)
                # check if the mouse has moved and fill in the tiles behind the mouse
                if self.previous_sprite != sprite and self.previous_sprite is not None:
                    if self.grid_check:
                        self.map_surface.blit(self.grid_image_black, self.previous_sprite.tile_pos)
                    else:
                        self.map_surface.blit(self.previous_sprite.tile_image, self.previous_sprite.tile_pos)
                self.previous_sprite = sprite
        #calculate the offset and draw the map
        offset_pos = self.map_rect.topleft - self.offset
        self.display_surface.blit(self.map_surface, offset_pos)
