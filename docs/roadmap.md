# Mapgen Roadmap

## Roadmap Purpose

This roadmap keeps the project focused while it moves from the Python/Pygame prototype toward a browser-based map generator.

Each stage should leave the project in a working state. The Python version is the preserved reference. The browser version is the release target.

## Current Status

The project has two working paths:

- A preserved Python/Pygame prototype that generates maps, draws solid-color hexes, and exports map data as JSON to `exports/map_data.json`.
- A browser prototype in `web/` using Vite, TypeScript, and HTML Canvas.

The browser prototype currently:

- Loads tracked sample map data from `web/public/sample-map.json`.
- Renders hex maps on Canvas using solid terrain colors.
- Supports pan, wheel zoom, zoom buttons, reset view, and resize-safe layout.
- Supports grid toggling, terrain legend, metadata display, current-map JSON download, and visible-canvas PNG download.
- Supports seed input, random seed, Generate from Seed, and Load Sample JSON.
- Includes generator controls for Sea Level, Mountain Amount, Roughness, and Reset Generator Settings.

The browser generator is functional and structured after the Python generator, but it is not yet equivalent to the Python output. It still needs generator-quality work before the browser app should be considered a finished map generator.

## Development Flow

Use short-lived feature branches for focused work. Until `main` is updated with the browser-mapgen foundation, feature branches should usually branch from `prep/browser-mapgen-foundation`.

Prefer branches named for the work being done, such as:

- `feature/land-shape-pipeline`
- `feature/generator-quality-pass`
- `feature/continent-separation`
- `feature/map-size-controls`

Do not rely on roadmap text to identify the active temporary branch. Check Git directly when needed.

## Next Planned Work

The immediate next coding focus is land-shape pipeline implementation and refinement, guided by `docs/land-shape-pipeline.md`.

Near-term generator priorities:

- Clarify and rename overloaded elevation concepts.
- Separate land-shape value from relief/elevation.
- Preserve the current coastline character.
- Improve edge ocean pressure.
- Tune and review the initial continent separation pressure pass.
- Later add land cleanup and continent detection.

The key design principle is: land shape is not elevation.

After land shape is more reliable, later generator work can move into separate internal relief, mountain ranges, basins, lakes, rivers, moisture, temperature, and biome layers.

Map Lab is a planned developer-support path that should help tune this work across many seeds and settings. It is not a V1 user-facing requirement.

## Phase 0 - Repository Cleanup

Status: Complete

Goal: Make the repository clean enough to work from safely.

Tasks:

- Add `.gitignore`.
- Stop tracking generated output files such as `full_map.png`.
- Stop tracking Python cache files.
- Add `requirements.txt`.
- Update README so it matches the actual project state.
- Add `docs/design.md`.
- Add `docs/roadmap.md`.
- Preserve the current prototype as a known working baseline.

Completion criteria:

- Git status is clean.
- Generated map images are ignored.
- Cache files are ignored.
- The README is accurate.
- Design and roadmap docs exist.
- The current prototype still runs.

## Phase 1 - Simplify Current Renderer

Status: Complete

Goal: Remove image tile dependency from the current prototype display path.

The renderer now draws solid-color hexes directly in code. Tile art can return later after the map data, geometry, zoom, pan, export, and browser pipeline are stable.

Tasks:

- Keep the current generator behavior.
- Add terrain color mapping in code.
- Draw filled hex polygons instead of loading tile images.
- Draw optional grid borders in code.
- Keep the map visually similar enough to confirm generation still works.
- Keep `full_map.png` generation if useful, but do not track the file in Git.
- Remove or isolate tile image loading from the main display path.

Completion criteria:

- The map displays without tile image assets.
- The generated map still looks recognizable and useful.
- Terrain colors are clear.
- Hex alignment is controlled by code.
- The app still runs after the change.

## Phase 2 - Separate Generator Data From Display

Status: Complete

Goal: Make the generator output clean map data that can be used by a browser renderer.

Tasks:

- Keep generator logic separate from rendering code.
- Define a basic tile data model.
- Define a basic map data model.
- Make map generation return plain data.
- Avoid Pygame-specific objects in generated map data.
- Add a JSON export function.
- Add a simple JSON output file for generated maps.

Suggested early JSON shape:

```json
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
```

Completion criteria:

- Generator output can be saved as JSON.
- JSON can represent the full map.
- Rendering reads from generated map data.
- Pygame is no longer mixed into the generator data model.

## Phase 3 - Browser Prototype Spike

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

## Phase 4 - Port Or Rebuild Generator In TypeScript

Status: In progress

Goal: Move the generator into the browser app and improve generated map quality.

Recommended path:

Use the Python prototype as reference, but implement the browser generator cleanly in TypeScript.

Current state:

- A browser-side generator exists and is deterministic by seed.
- It uses the same map size and terrain thresholds as the Python prototype.
- It mirrors the Python helper flow for elevation, ocean edges, polar bands, and terrain classification.
- It uses dependency-free deterministic value noise instead of Python Perlin noise.
- It exposes basic generation settings through the browser UI.
- It includes an initial soft continent separation pressure pass that still needs tuning and review.
- It includes a first proof pass where land/water classification is separated from land terrain relief.

Known generator-quality gaps:

- Landmass variety needs improvement.
- Coastal mountain-ring behavior needs reduction.
- Terrain distribution needs tuning.
- The browser generator does not yet match Python output.
- The separate relief proof still needs tuning and is not yet final topology.
- Moisture, temperature, biome, lakes, and rivers are not implemented yet.

Current detailed design guide:

- `docs/land-shape-pipeline.md`
- `docs/filemap.md` is the repo navigation aid for understanding current files and folders before planning structural changes.

Completion criteria:

- Browser app can generate maps without Python.
- Same seed produces the same map.
- Terrain distribution is acceptable.
- Land shape is represented separately from internal relief/elevation.
- Output is visible immediately in the Canvas renderer.

## Phase 5 - Browser Controls

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

## Developer Support Path - Map Lab

Map Lab is the planned diagnostics and review workflow described in `docs/map-lab-diagnostics.md`. It should support generator tuning by exporting seed/settings data, map metrics, human map-type labels, ratings, flags, and notes. It does not replace procedural generation and should not be treated as a public V1 feature.

### Map Lab Documentation

Status: Complete

Goal: Add the Map Lab spec to the project documentation plan.

Tasks:

- Add `docs/map-lab-diagnostics.md`.
- Cross-link Map Lab from `README.md`, `docs/design.md`, `docs/roadmap.md`, and `docs/filemap.md`.
- Keep this phase documentation-only.

Completion criteria:

- The project docs describe Map Lab as planned developer support tooling.
- No source code, package files, generated files, or sample map JSON are changed for this phase.

### Map Lab Data Types / Diagnostics

Status: Not started

Goal: Define review/diagnostic data structures and calculate diagnostics independently from rendering.

Tasks:

- Add review and diagnostic data types.
- Add a diagnostics calculator that does not depend on Canvas rendering.
- Export current seed, generator settings, and basic map metrics.

Completion criteria:

- Current map diagnostics can be represented as structured data.
- Existing map stats can be exported without requiring a rendered screenshot.

### Map Lab Review Panel

Status: Not started

Goal: Add a developer review workflow for the current generated map.

Tasks:

- Add observed map type dropdown.
- Add ratings.
- Add quick flags.
- Add notes.
- Save/export the current review.

Completion criteria:

- A developer can quickly label and rate one generated map.
- The review export includes seed, settings, diagnostics, labels, ratings, flags, and notes.

### Review Sessions

Status: Not started

Goal: Collect multiple reviewed maps from one tuning pass.

Tasks:

- Save multiple reviews in a local session.
- Export session JSON.
- Preserve enough metadata to compare review passes over time.

Completion criteria:

- A developer can review multiple maps and export one combined review-session file.

### Batch Diagnostics

Status: Not started

Goal: Generate many maps from selected settings or presets and export a lightweight diagnostics dataset.

Tasks:

- Generate multiple maps from a seed count and settings/preset.
- Calculate lightweight diagnostics for each map.
- Export a combined diagnostics dataset.
- Use exported data to tune generator settings.

Completion criteria:

- Generator changes can be evaluated across many seeds without manually inspecting every map first.

### Scoring / Candidate Selection

Status: Future optional goal

Goal: Use diagnostics to score generated candidates against a target preset/profile.

Tasks:

- Define simple scoring rules for target map profiles.
- Generate multiple candidate maps.
- Score each candidate against the selected target.
- Select the best candidate while keeping procedural generation as the source of maps.

Completion criteria:

- Candidate selection can reduce bad outputs before the user sees a final map.
- Any scoring or lightweight ML experiments remain optional later work, not a near-term requirement.

## Phase 6 - Better World Layers

Goal: Improve the usefulness of generated maps.

Tasks:

- Add separate internal relief.
- Add mountain range generation.
- Add temperature layer.
- Add moisture layer.
- Add biome classification.
- Add inland lakes.
- Add basic river generation.
- Add continent/region detection.
- Add optional resource placeholders.
- Add start-position scoring.

Completion criteria:

- Maps have more believable physical structure and climate/biome variation.
- Lakes and rivers improve map readability.
- Start-position scoring can identify reasonable player starts.
- These systems are data-driven and renderer-independent.

## Phase 7 - V1 Release Prep

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

## Documentation Maintenance

After meaningful changes, update the relevant docs before merging:

- Update `README.md` if setup, commands, or project structure changes.
- Update `docs/filemap.md` if files are added, removed, renamed, or significantly repurposed.
- Update `docs/roadmap.md` if project status or next steps change.
- Update `docs/design.md` if project direction or principles change.
- Update focused design docs like `docs/land-shape-pipeline.md` or `docs/map-lab-diagnostics.md` if implementation decisions affect those systems.

Codex and other AI-assisted development should read `README.md`, `docs/design.md`, `docs/roadmap.md`, `docs/filemap.md`, and any relevant focused spec before editing code.

## Recommended Development Rules

### Work In Small Branches

Use focused branches with clear names. Avoid mixing code, docs, generated files, and unrelated cleanup in the same change.

### Keep Main Stable

Only merge when:

- Code runs.
- Generated maps still display.
- The change has a clear purpose.
- The branch does not include accidental generated files.
- Relevant docs are updated.

### Do Not Commit Generated Files

Do not commit:

- `full_map.png`
- `exports/`
- Cache files
- Build folders
- Local environment files
- Temporary screenshots
- `node_modules/`
- `web/dist/`

The tracked sample map is `web/public/sample-map.json`.

### Avoid Major Rewrites Without Checkpoints

Large changes should be broken into steps. If a change takes the project from working to broken, it should be split smaller.

## Near-Term Next Steps

Immediate next steps:

- Implement the first land-shape pipeline cleanup from `docs/land-shape-pipeline.md`.
- Clarify current `elevation` usage and separate land-shape concepts from future relief concepts.
- Preserve current coastline character while improving map-edge ocean behavior.
- Tune and review the initial continent separation pressure pass.
- Review terrain and land/water distributions across several seeds.
- Use the planned Map Lab workflow later to make this review more systematic.
- Add land cleanup and continent detection after the initial land/water split is stable.
- Keep the Python prototype preserved as a reference.

## Long-Term Direction

The long-term direction is:

```text
Python/Pygame prototype
  -> clean generator data model
  -> solid-color code-rendered hexes
  -> JSON export
  -> TypeScript browser prototype
  -> Canvas renderer
  -> browser-native generator
  -> land-shape pipeline
  -> developer Map Lab diagnostics/review support
  -> relief, water, climate, and biome layers
  -> public V1 map generator
```
