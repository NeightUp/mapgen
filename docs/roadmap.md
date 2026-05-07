# Mapgen Roadmap

## Roadmap Purpose

This roadmap exists to keep the project focused.

The goal is to move from the current Python/Pygame prototype toward a browser-based map generator without losing the working generator or drifting into full game development too early.

Each stage should leave the project in a working state.

## Current Status

The project now has two working paths:

- A preserved Python/Pygame prototype that generates maps, draws solid-color hexes, and exports map data as JSON to `exports/map_data.json`.
- A browser prototype in `web/` using Vite, TypeScript, and HTML Canvas.

The browser prototype currently:

- Loads tracked sample map data from `web/public/sample-map.json`.
- Renders hex maps on Canvas using solid terrain colors.
- Supports pan, wheel zoom, zoom buttons, reset view, and resize-safe layout.
- Supports grid toggling, terrain legend, metadata display, current-map JSON download, and visible-canvas PNG download.
- Supports deterministic browser-side seed generation.
- Includes generator controls for Sea Level, Mountain Amount, Roughness, and Reset Generator Settings.

The browser generator is functional and structured after the Python generator, but it is not yet equivalent to the Python output. It still needs generator-quality work before the browser app should be considered a useful map generator rather than a capable prototype viewer.

## Next Planned Work

The next major work is generator quality and refinement, not basic browser setup.

Near-term generator priorities:

- Improve landmass variety and continent shapes.
- Reduce coastal mountain-ring behavior.
- Tune land/water and terrain distribution.
- Improve elevation/noise behavior without adding unnecessary dependencies too early.
- Add better settings feedback and eventually include generator settings in exported map data.
- Begin moisture, temperature, and biome layers after elevation and terrain feel stable.
- Add rivers and lakes later, after terrain/biome foundations are stronger.

## Current Branch

Active branch:

- feature/generator-settings-controls

The current branch is focused on browser-side generator controls and documentation updates after the browser prototype work.

## Phase 0 — Repository Cleanup

Status: Complete

Goal: Make the repository clean enough to work from safely.

Tasks:

- Add .gitignore.
- Stop tracking generated output files such as full_map.png.
- Stop tracking Python cache files.
- Add requirements.txt.
- Update README so it matches the actual project state.
- Add docs/design.md.
- Add docs/roadmap.md.
- Preserve the current prototype as a known working baseline.

Completion criteria:

- git status is clean.
- Generated map images are ignored.
- Cache files are ignored.
- The README is accurate.
- Design and roadmap docs exist.
- The current prototype still runs.

## Phase 1 — Simplify Current Renderer

Status: Complete

Goal: Remove image tile dependency from the current prototype display path.

The current code uses tile image assets. This helped the original prototype get working, but it creates extra complexity. For the next stage, the renderer should draw solid-color hexes directly in code.

Tasks:

- Keep the current generator behavior.
- Add terrain color mapping in code.
- Draw filled hex polygons instead of loading tile images.
- Draw optional grid borders in code.
- Keep the map visually similar enough to confirm generation still works.
- Keep full_map.png generation if useful, but do not track the file in Git.
- Remove or isolate tile image loading from the main display path.

Completion criteria:

- The map displays without tile image assets.
- The generated map still looks recognizable and useful.
- Terrain colors are clear.
- Hex alignment is controlled by code.
- The app still runs after the change.

## Phase 2 — Separate Generator Data From Display

Status: Complete

Goal: Make the generator output clean map data that can later be used by a browser renderer.

Tasks:

- Keep generator logic separate from rendering code.
- Define a basic tile data model.
- Define a basic map data model.
- Make map generation return plain data.
- Avoid Pygame-specific objects in generated map data.
- Add a JSON export function.
- Add a simple JSON output file for generated maps.

Suggested early JSON shape:
{
  "seed": 12345,
  "rows": 45,
  "cols": 85,
  "tiles": [
    {
      "row": 0,
      "col": 0,
      "elevation": 0.12,
      "terrain": "plains"
    }
  ]
}

Completion criteria:

- Generator output can be saved as JSON.
- JSON can represent the full map.
- Rendering reads from generated map data.
- Pygame is no longer mixed into the generator data model.

## Phase 3 — Browser Prototype Spike

Status: Complete

Goal: Prove the browser direction with a simple working prototype.

Recommended stack:

- TypeScript
- Vite
- HTML Canvas
- Plain module-based generator/rendering code

Tasks:

- Create a browser app folder. Complete.
- Add TypeScript/Vite project setup. Complete.
- Create a Canvas renderer. Complete.
- Draw solid-color hexes. Complete.
- Add pan and zoom. Complete.
- Add a hardcoded or imported map JSON sample. Complete.
- Confirm the browser renderer can display generated map data. Complete.

Completion criteria:

- Browser app starts with a local dev command. Complete.
- Canvas draws a hex map. Complete.
- Pan and zoom work. Complete.
- Map data is separate from rendering code. Complete.
- The browser prototype can display exported data from the Python prototype. Complete via `web/public/sample-map.json`.

Additional completed browser prototype work:

- Reset view and resize-safe Canvas layout.
- Grid toggle.
- Terrain legend.
- Map metadata display.
- JSON download for current map data.
- PNG download for current visible Canvas view.
- Seed input, random seed, generated browser maps, and Load Sample JSON.
- Sea Level, Mountain Amount, Roughness, and Reset Generator Settings controls.

## Phase 4 — Port or Rebuild Generator in TypeScript

Status: In progress

Goal: Move the generator into the browser app.

There are two possible paths:

### Option A — Port the Python generator to TypeScript

Best if the current generator logic remains simple and valuable.

Tasks:

- Port terrain thresholds.
- Port seeded randomness.
- Port elevation/noise logic.
- Match output shape to the JSON data model.

### Option B — Rebuild the generator in TypeScript

Best if the Python prototype is treated mostly as design reference.

Tasks:

- Recreate land/water generation.
- Recreate polar bands.
- Recreate terrain classification.
- Add seed support from the beginning.
- Tune results until they match or improve on the Python output.

Recommended path:

Use the Python prototype as reference, but implement the browser generator cleanly in TypeScript.

Current state:

- A browser-side generator exists and is deterministic by seed.
- It uses the same map size and terrain thresholds as the Python prototype.
- It mirrors the Python helper flow for elevation, ocean edges, polar bands, and terrain classification.
- It uses dependency-free deterministic value noise instead of Python Perlin noise.
- It exposes basic generation settings through the browser UI.

Known generator-quality gaps:

- Landmass variety needs improvement.
- Coastal mountain-ring behavior needs reduction.
- Terrain distribution needs tuning.
- The browser generator does not yet match Python output.
- Moisture, temperature, biome, lakes, and rivers are not implemented yet.

Completion criteria:

- Browser app can generate maps without Python.
- Same seed produces the same map.
- Terrain distribution is acceptable.
- Output is visible immediately in the Canvas renderer.

## Phase 5 — Browser Controls

Status: Partially complete

Goal: Let users interact with generation settings.

Tasks:

- Add seed input. Complete.
- Add random seed button. Complete.
- Add regenerate button. Complete as Generate from Seed.
- Add map size controls. Not started.
- Add basic terrain threshold controls. Partially complete through Sea Level, Mountain Amount, and Roughness.
- Add grid toggle. Complete.
- Add export image button. Complete for visible Canvas PNG.
- Add export JSON button. Complete for current map data.

Completion criteria:

- User can generate a map from the browser UI. Complete for the current browser generator.
- User can copy or reuse a seed. Complete.
- User can change basic settings. Partially complete.
- User can export an image. Complete for visible Canvas PNG.
- User can export JSON. Complete for current map data.

## Phase 6 — Better World Layers

Goal: Improve the usefulness of generated maps.

Tasks:

- Add temperature layer.
- Add moisture layer.
- Add biome classification.
- Add inland lakes.
- Add basic river generation.
- Add continent/region detection.
- Add optional resource placeholders.
- Add start-position scoring.

Completion criteria:

- Maps have more believable climate/biome variation.
- Lakes and rivers improve map readability.
- Start-position scoring can identify reasonable player starts.
- These systems are still data-driven and renderer-independent.

## Phase 7 — V1 Release Prep

Goal: Prepare the project for a usable public release.

Tasks:

- Clean UI.
- Responsive layout.
- Mobile usability pass.
- Export reliability.
- Basic help/about panel.
- README update.
- Version tag.
- Deployment setup.
- Manual test checklist.

Completion criteria:

- App runs from a public URL.
- App works on desktop.
- App is usable on mobile.
- Users can generate and export maps.
- The project has clear known limitations.
- V1 is ready for feedback.

## Recommended Development Rules

### Work in small branches

Use branches like:

- prep/browser-mapgen-foundation
- feature/code-drawn-hexes
- feature/json-export
- feature/browser-prototype
- feature/canvas-renderer

### Keep main stable

Only merge when:

- Code runs.
- Generated maps still display.
- The change has a clear purpose.
- The branch does not include accidental generated files.

### Do not commit generated files

Do not commit:

- full_map.png
- cache files
- build folders
- local environment files
- temporary screenshots

### Avoid major rewrites without checkpoints

Large changes should be broken into steps. If a change takes the project from “working” to “broken,” it should be split smaller.

## Near-Term Next Steps

Immediate next steps:

- Tune browser generator output quality.
- Improve continent/landmass shapes and reduce coastal mountain clustering.
- Review terrain distributions across several seeds.
- Decide whether to keep improving the dependency-free noise path or add a small noise implementation later.
- Add settings persistence or exported settings metadata if useful.
- Begin moisture/temperature/biome layers once elevation and terrain are stable.
- Keep Python prototype preserved as a reference.

## Long-Term Direction

The long-term direction is:
Python/Pygame prototype
        ↓
clean generator data model
        ↓
solid-color code-rendered hexes
        ↓
JSON export
        ↓
TypeScript browser prototype
        ↓
Canvas renderer
        ↓
browser-native generator
        ↓
public V1 map generator

The Python version is the working seed. The browser version is the release target.
