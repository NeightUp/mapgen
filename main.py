import pygame, sys
from map import *
from settings import *

class Game:
    def __init__(self):
        pygame.init()
        self.screen = pygame.display.set_mode((WIDTH, HEIGHT), pygame.RESIZABLE)
        pygame.display.set_caption("World Map Generator")
        self.clock = pygame.time.Clock()
        self.map = Map()

    def run(self):
        while True:
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    pygame.quit()
                    sys.exit()
                if event.type == pygame.VIDEORESIZE:
                    self.map.handle_resize()

            self.map.run()
            pygame.display.flip()
            self.clock.tick(FPS)

if __name__ == '__main__':
    game = Game()
    game.run()
