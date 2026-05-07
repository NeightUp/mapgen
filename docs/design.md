# Mapgen Design Document

## Purpose

Mapgen is a procedural hex-map generator utility. Its first purpose is to generate readable, useful world maps for strategy-game prototyping, worldbuilding, tabletop planning, and future Rift and Reign development.

The current project begins from an existing Python/Pygame prototype that already produces promising landmass shapes. The long-term goal is to turn the generator into a browser-based utility that works on desktop and mobile without requiring users to install Python, Pygame, or local asset packs.

## Core Goal

Build a browser-based hex map generator that can:

- Generate useful strategy/worldbuilding maps.
- Display the map clearly.
- Allow users to adjust generation settings.
- Allow users to save, export, and regenerate maps using seeds.
- Grow in clean stages without becoming a full game engine too early.

## What Mapgen Is

Mapgen is:

- A procedural map generator.
- A hex-grid map viewer.
- A browser-based map utility.
- A tool for experimenting with terrain, elevation, water, biomes, rivers, and future map layers.
- A project that should stay modular enough to eventually support game-specific rules or export formats.

## What Mapgen Is Not

Mapgen is not, for the early release:

- A full 4X game.
- A complete game engine.
- A multiplayer service.
- A map marketplace.
- A user account system.
- A tile-art asset pipeline.
- A full simulation of population, politics, economy, or warfare.

Those may matter later for Rift and Reign, but they should not distract from the map generator’s first usable release.

## Design Principles

### 1. Data First

The generator should produce structured map data before anything is drawn.

Rendering should consume map data. It should not be responsible for deciding what the world is.

Each tile should eventually support fields like:

- `row`
- `col`
- `terrain`
- `elevation`
- `moisture`
- `temperature`
- `biome`
- `features`
- `river_edges`
- `region_id`
- `start_score`

Early versions do not need all of these fields, but the structure should allow them to be added without rewriting the whole project.

### 2. Separate Generation From Rendering

The generator should not care whether the map is displayed with:

- Pygame
- HTML Canvas
- SVG
- WebGL
- PixiJS
- Tile images
- Solid-color drawn hexes

The generator produces data. The renderer displays data.

This separation is important because the current Python/Pygame prototype is useful, but the release target is a browser app.

### 3. Solid-Color Hexes First

Early development should stop relying on tile image assets.

The current tile assets were useful for the original prototype, but they now add unnecessary complexity:

- Asset naming problems.
- Scaling problems.
- Alignment problems.
- Transparency issues.
- File management overhead.
- Extra work when moving to the browser.

For the next stage, the renderer should draw hexes directly in code using solid terrain colors.

Tile art can return later after the map data, geometry, zoom, pan, export, and browser pipeline are stable.

### 4. Preserve the Existing Prototype

The current Python/Pygame generator already makes useful maps. It should be preserved as a working reference.

Do not destroy the current prototype in a large rewrite. Instead:

- Keep a stable branch/tag.
- Refactor in small steps.
- Make sure each step still produces a visible map.
- Move useful generator logic forward into the browser version.

### 5. Browser App Target

The release version should run in a browser.

The recommended future stack is:

- TypeScript for the browser app.
- Vite for local development and building.
- HTML Canvas for the main map renderer.
- A small UI layer for controls, settings, and export tools.
- JSON as the core map data format.

React may be useful later for the UI, but the renderer and generator logic should not depend on React. The map engine should be plain TypeScript modules that can be tested independently.

### 6. Mobile Matters

The app should eventually work on phones and tablets.

Mobile support does not need to be perfect immediately, but the design should avoid desktop-only assumptions. Controls should eventually support:

- Touch pan.
- Pinch zoom.
- Responsive layout.
- Simple export/download behavior.

### 7. Avoid Feature Drift

This project should grow in stages.

When a new idea comes up, ask:

- Does this support the current roadmap stage?
- Does this help the generator become usable?
- Does this make the project harder to finish?
- Should this be documented for later instead of built now?

Good ideas should be recorded, but not all good ideas belong in V1.

## Current Prototype State

The current prototype:

- Is written in Python.
- Uses Pygame for display.
- Uses Perlin noise for base elevation.
- Uses thresholds for deep ocean, ocean, plains, hills, mountains, high mountains, tundra, and ice.
- Saves `full_map.png` as a generated local preview.
- Uses simple tile assets for display.

The generator already creates decent world-scale maps. The next development goal is not to replace the generator immediately. The next goal is to simplify and separate the display pipeline.

## Early Rendering Direction

The early renderer should:

- Draw hexes in code.
- Use solid colors for terrain.
- Compute hex positions mathematically.
- Support optional grid lines.
- Support pan and zoom.
- Avoid image tile assets.
- Use map data as the source of truth.

The renderer should eventually support hover and tile inspection, but that does not need to happen before the basic renderer works.

## Future Tile Asset Direction

Tile assets may return later, but only after:

- Hex geometry is stable.
- Zoom and pan are stable.
- Terrain and biome layers are stable.
- The browser renderer works.
- Export behavior works.
- The project has a clear reason to use art assets.

Possible future visual styles:

- Solid-color hexes.
- Canvas-generated terrain textures.
- SVG pattern fills.
- PNG/WebP tile art.
- Layered feature overlays.
- Biome-specific decorations.
- Optional stylized mode.

## V1 Scope

The first useful browser release should allow a user to:

- Open the map generator in a browser.
- Generate a random map.
- Enter or copy a seed.
- Regenerate the same map from a seed.
- Adjust basic generation settings.
- Pan and zoom around the map.
- Toggle the grid.
- Export the map as an image.
- Export the map data as JSON.

## V1 Non-Goals

V1 should not include:

- User accounts.
- Multiplayer.
- Cloud saves.
- Paid features.
- Advanced tile art.
- Full game simulation.
- Diplomacy, economy, population, or combat systems.
- Complex scenario editing.
- Marketplace/community features.

## Long-Term Possibilities

After the core generator is stable, possible future features include:

- Biome layers.
- Rivers and lakes.
- Resource placement.
- Start-position scoring.
- Region and continent detection.
- Export presets.
- Game-specific export formats.
- Scenario editing tools.
- Custom palettes.
- Tile asset themes.
- Procedural decoration overlays.
- Rift and Reign integration.