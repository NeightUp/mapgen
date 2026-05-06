# world_building_game
***NOTE: This is a work in progress.  Code is not "show ready" so don't judge me for the bits that don't make sense***

A program to build a procedurally generated, hex based game map in python with pygame.  
Requires the pygame, and perlin_noise libraries to run.

The project is currently split into two main layers:

* `world_building_game/generator.py` builds the world data from layered noise and terrain rules.
* `world_building_game/world.py` stores map/tile data that future systems can use.
* `world_building_game/map.py` and `world_building_game/tile.py` render that world with pygame.

This keeps the current prototype behavior, while making room for biomes, rivers, settlements,
resources, political regions, and Rift and Reign game rules to be added on top of map data
instead of being mixed directly into pygame sprites.

When you run the code, it will create an image file called full_map.png.  
This will be created every time a new map is generated.  
If one already exists, it will overwrite the previous version with the new version.
I have found it handy to have, so you can run and close the program, then check the image to see the full output.
useful for quickly dialing in changes to how the map is generated, or how the terrain is assigned.

You can move around the map by moving the mouse close to the edges of the screen.

*** CONFIG ***

Set `MAP_SEED` in `world_building_game/settings.py` to an integer to regenerate the same map
between runs. Leave it as `None` to keep generating a fresh random map each launch.

*** TO DO ***

Add an infinite scroll feature on the x-axis.
Add more mouse controls over the screen position on the map.
Add in biome generation and tile typing.
Add in water source blocks
Add in path finding for generating rivers.
Refine noise map generation for higher resolution maps.
  
