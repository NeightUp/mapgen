# Mapgen Design Document

## Purpose

Mapgen is a browser-based procedural hex map generator utility. Its first job is to generate readable, configurable world maps that can support strategy-game design, worldbuilding, tabletop planning, and future Rift and Reign prototyping.

The project begins from the existing Python/Pygame prototype, but the long-term target is a browser app that can run on desktop and mobile without requiring users to install Python, Pygame, or local assets.

## What Mapgen Is

Mapgen is:

- A procedural hex-world generator.
- A visual map preview tool.
- A configurable utility for generating land, water, terrain, biomes, rivers, lakes, and future map layers.
- A project meant to grow in clean, testable stages.
- A future browser-based app with export/save/share features.

## What Mapgen Is Not

Mapgen is not, for the first release:

- A full 4X game.
- A complete game engine.
- A simulation of every political, economic, or historical system.
- A tile-art showcase.
- A terrain-asset pipeline.
- A multiplayer or account-based web service.
- A marketplace or user-content platform.

Those ideas may connect to future projects, but V1 should stay focused on generating and viewing maps.

## Core Design Principles

### 1. Generator logic must stay separate from rendering

The generator should produce plain map data. Rendering should consume that data. The map-generation layer should not care whether the map is displayed with Pygame, HTML Canvas, SVG, PixiJS, or tile assets.

### 2. Data first, visuals second

The map should be represented as structured data before it is drawn. Each tile should eventually support fields such as:

- row
- col
- terrain
- elevation
- moisture
- temperature
- biome
- features
- water status
- river edges
- region id
- start-position scoring data

### 3. Solid-color rendering first

Early browser versions should draw hexes directly in code with solid colors. Tile images should be removed from the core display path during early development.

This keeps the display pipeline simpler and makes it easier to debug alignment, scaling, zooming, panning, terrain classification, biome rules, and export behavior.

Tile assets can return later after the data model and renderer behavior are stable.

### 4. Browser app target

The long-term user-facing app should run in a browser on desktop and mobile. It should not require installation for ordinary users.

### 5. Incremental development

Every step should produce a working map viewer or generator. Avoid large rewrites that leave the project broken for long periods.

### 6. Avoid feature drift

New features should only be added when they support the current roadmap stage. Ideas that are good but not current should be recorded for later instead of being half-built immediately.

## Current Prototype State

The current prototype:

- Is written in Python.
- Uses Pygame for rendering.
- Uses Perlin noise for base elevation.
- Uses simple terrain thresholds for water, plains, hills, mountains, tundra, and ice.
- Saves a generated `full_map.png` preview locally.
- Uses tile image assets for visual display.

The generator already produces useful landmass shapes and should be preserved as the starting reference.

## Near-Term Target

The near-term target is to prepare the codebase for browser-app development by:

1. Preserving the current Python/Pygame prototype.
2. Removing generated outputs from Git tracking.
3. Adding project documentation.
4. Separating generation logic from rendering logic.
5. Replacing image-tile rendering with code-drawn solid-color hexes.
6. Defining a map data format suitable for browser rendering.

## Rendering Direction

Early rendering should use generated hex geometry rather than tile images.

The renderer should be responsible for:

- Computing hex corner points.
- Drawing filled hex shapes.
- Drawing optional grid borders.
- Supporting zoom and pan.
- Supporting hover/selection later.
- Rendering from map data, not from hardcoded terrain sprite files.

## Future Tile Asset Direction

Tile assets may return later, but only after:

- Hex math is stable.
- Map data format is stable.
- Zoom/pan behavior is stable.
- Terrain and biome layers are reasonably mature.
- The app has a clear reason to use art assets instead of direct drawing.

Possible future asset styles:

- Simple colored hexes.
- Procedural canvas textures.
- SVG/pattern overlays.
- PNG/WebP tile art.
- Layered biome and feature overlays.

## First Release Goal

V1 should let a user:

- Open the browser app.
- Generate a new map.
- Set or randomize a seed.
- Adjust basic map settings.
- View the map with pan/zoom.
- Toggle basic layers such as grid, terrain, and water.
- Export the map as an image and/or JSON.

V1 succeeds if users can generate useful maps and give feedback on the core map output.
