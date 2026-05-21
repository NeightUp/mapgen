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
- A project that will use planned developer diagnostics and review tooling to tune procedural generator quality across seeds and settings.
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
- A system where diagnostics, review labels, scoring, or possible later ML experiments replace procedural generation.

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

Planned Map Lab diagnostics should follow the same data-first approach. Seed, settings, map metrics, observed map-type labels, ratings, flags, and notes should be exportable data that helps tune the procedural generator. Map Lab should help compare pangaea, balanced-continent, unbalanced-continent, archipelago, island-chain, continent-count, land-percentage, elevation-quality, biome-placement, and river/lake suitability goals across many seeds. It should not become the generator itself.

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

Map Lab belongs in this category for now. It is a planned developer-support workflow for generator tuning, not a V1 user-facing requirement.

### 8. Land Shape Is Not Elevation

Detailed generator shaping work is guided by `docs/land-shape-pipeline.md`.

This high-level design document should stay broad: it defines the project direction, release target, core boundaries, and major design principles. The land-shape pipeline document is the focused implementation/design spec for landmass generation, including coastline shape, land/water separation, edge ocean pressure, continent separation, cleanup, and later relief work.

The key generator principle for the next phase is that land shape is not elevation. The value that decides coastlines and landmasses should become separate from the later values that decide internal relief, hills, mountains, basins, rivers, and biomes.

Future Map Lab diagnostics should support this layered approach by measuring and reviewing land shape, adjusted land/coastal shaping, relief/elevation, terrain distribution, and later biome/resource/river layers as distinct concerns.

## Current Prototype State

The current project has two active prototype paths.

The Python/Pygame prototype:

- Is written in Python.
- Uses Pygame for display.
- Uses Perlin noise for base elevation.
- Uses thresholds for deep ocean, ocean, plains, hills, mountains, high mountains, tundra, and ice.
- Saves `full_map.png` as a generated local preview.
- Draws solid-color hexes in code instead of relying on image tile assets.
- Exports structured map data to `exports/map_data.json`.

The browser prototype:

- Lives in `web/`.
- Uses Vite, TypeScript, and HTML Canvas.
- Loads tracked sample JSON from `web/public/sample-map.json`.
- Supports pan, zoom, reset view, grid toggle, terrain legend, metadata, and JSON/PNG downloads.
- Includes deterministic browser-side seed generation and basic generator settings.

The browser generator is currently a functional TypeScript approximation structured after the Python generator. It does not yet match Python output and still needs quality tuning, especially around landmass variety, coastal mountain behavior, and terrain distribution.

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

- Developer Map Lab diagnostics and review sessions.
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

Map Lab may eventually support lightweight scoring or candidate selection, and possibly small ML experiments if enough reviewed examples exist. Those are optional later experiments, not core near-term requirements.
