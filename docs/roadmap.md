# Mapgen Roadmap

## Roadmap Purpose

This roadmap exists to keep the project focused.

The goal is to move from the current Python/Pygame prototype toward a browser-based map generator without losing the working generator or drifting into full game development too early.

Each stage should leave the project in a working state.

## Current Branch

Active cleanup/prep branch:

prep/browser-mapgen-foundation

The current branch is for preparing the project, documenting direction, and making the codebase easier to build from.

## Phase 0 — Repository Cleanup

Status: In progress

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

git status is clean.
Generated map images are ignored.
Cache files are ignored.
The README is accurate.
Design and roadmap docs exist.
The current prototype still runs.

## Phase 1 — Simplify Current Renderer

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

The map displays without tile image assets.
The generated map still looks recognizable and useful.
Terrain colors are clear.
Hex alignment is controlled by code.
The app still runs after the change.

## Phase 2 — Separate Generator Data From Display

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

Generator output can be saved as JSON.
JSON can represent the full map.
Rendering reads from generated map data.
Pygame is no longer mixed into the generator data model.

## Phase 3 — Browser Prototype Spike

Goal: Prove the browser direction with a simple working prototype.

Recommended stack:

TypeScript
Vite
HTML Canvas
Plain module-based generator/rendering code

Tasks:

- Create a browser app folder.
- Add TypeScript/Vite project setup.
- Create a Canvas renderer.
- Draw solid-color hexes.
- Add pan and zoom.
- Add a hardcoded or imported map JSON sample.
- Confirm the browser renderer can display generated map data.

Completion criteria:

Browser app starts with a local dev command.
Canvas draws a hex map.
Pan and zoom work.
Map data is separate from rendering code.
The browser prototype can display exported data from the Python prototype.

## Phase 4 — Port or Rebuild Generator in TypeScript

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

Completion criteria:

Browser app can generate maps without Python.
Same seed produces the same map.
Terrain distribution is acceptable.
Output is visible immediately in the Canvas renderer.

## Phase 5 — Browser Controls

Goal: Let users interact with generation settings.

Tasks:

- Add seed input.
- Add random seed button.
- Add regenerate button.
- Add map size controls.
- Add basic terrain threshold controls.
- Add grid toggle.
- Add export image button.
- Add export JSON button.

Completion criteria:

User can generate a map from the browser UI.
User can copy or reuse a seed.
User can change basic settings.
User can export an image.
User can export JSON.

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

Maps have more believable climate/biome variation.
Lakes and rivers improve map readability.
Start-position scoring can identify reasonable player starts.
These systems are still data-driven and renderer-independent.

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

App runs from a public URL.
App works on desktop.
App is usable on mobile.
Users can generate and export maps.
The project has clear known limitations.
V1 is ready for feedback.

## Recommended Development Rules

### Work in small branches

Use branches like:
prep/browser-mapgen-foundation
feature/code-drawn-hexes
feature/json-export
feature/browser-prototype
feature/canvas-renderer

### Keep main stable

Only merge when:

Code runs.
Generated maps still display.
The change has a clear purpose.
The branch does not include accidental generated files.

### Do not commit generated files

Do not commit:

full_map.png
cache files
build folders
local environment files
temporary screenshots

### Avoid major rewrites without checkpoints

Large changes should be broken into steps. If a change takes the project from “working” to “broken,” it should be split smaller.

## Near-Term Next Steps

Immediate next steps:

Finish repository cleanup.
Add design and roadmap docs.
Commit and push docs.
Create a new branch for code-drawn hex rendering.
Replace tile image rendering with solid-color code-drawn hexes.
Confirm the prototype still runs.
Add JSON export.
Begin browser prototype.

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