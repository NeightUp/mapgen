# Mapgen

Mapgen is a procedural hex-map generator for strategy-game prototyping, worldbuilding, tabletop planning, and future Rift and Reign development.

The repository currently contains two working paths:

- A preserved Python/Pygame prototype at the repo root.
- A browser app in `web/` built with Vite, TypeScript, and HTML Canvas.

The browser app is the release target. The Python prototype remains a working reference for generator behavior and map export.

## Current Status

The Python prototype:

- Generates procedural maps.
- Draws solid-color hexes.
- Exports structured JSON to `exports/map_data.json`.
- Saves `full_map.png` as a local preview output.

The browser app:

- Loads tracked sample JSON from `web/public/sample-map.json`.
- Renders hex maps on Canvas using solid terrain colors.
- Supports pan, zoom, reset view, resize-safe layout, grid toggle, terrain legend, metadata, JSON download, and PNG download.
- Supports seed input, random seed, Generate from Seed, Load Sample JSON, Sea Level, Mountain Amount, Roughness, and Reset Generator Settings.

The browser generator is functional, but it still needs generator-quality refinement. The current development focus is the next land-shape pipeline: land shape is not elevation.

## Repo Layout

```text
.
|-- main.py                      Python/Pygame prototype entry point
|-- generator.py                 Python map generation logic
|-- map.py                       Python map assembly/rendering support
|-- tile.py                      Python tile model/drawing support
|-- world.py                     Python world/map container support
|-- settings.py                  Python prototype settings
|-- requirements.txt             Python dependencies
|-- docs/
|   |-- design.md                High-level project design
|   |-- roadmap.md               Development phases and next work
|   |-- land-shape-pipeline.md   Detailed landmass generation spec
|   `-- filemap.md               Project file navigation map
`-- web/
    |-- src/                     Browser app source
    |-- public/sample-map.json   Tracked browser sample map
    |-- package.json             Browser app scripts/dependencies
    `-- index.html               Browser app entry HTML
```

## Python Prototype

Run from the repository root:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python main.py
```

Expected local outputs:

- `full_map.png`
- `exports/map_data.json`

These files are generated locally and ignored by Git.

## Browser App

Run from `web/`:

```powershell
cd web
npm install
npm run dev
```

Build from `web/`:

```powershell
npm run build
```

The browser app uses the tracked sample file at `web/public/sample-map.json` for the Load Sample JSON workflow. This file is intentionally committed.

## Generated And Ignored Files

Do not commit generated or local dependency files:

- `full_map.png` is generated locally and ignored.
- `exports/` is generated locally and ignored.
- `node_modules/` is local dependency output and should not be committed.
- `web/dist/` is build output and should not be committed.

`web/public/sample-map.json` is tracked intentionally because the browser app uses it as a stable sample map.

## Important Commands

Python prototype:

```powershell
python main.py
```

Browser development server:

```powershell
cd web
npm run dev
```

Browser production build:

```powershell
cd web
npm run build
```

## Documentation

- [Project design](docs/design.md)
- [Roadmap](docs/roadmap.md)
- [Project file map](docs/filemap.md)
- [Land shape pipeline](docs/land-shape-pipeline.md)

The high-level design doc explains the project direction. The roadmap tracks phases and next work. The file map explains what each area of the repo does. The land-shape pipeline is the detailed design spec for the next generator phase.

## Current Development Focus

The next coding focus is land-shape pipeline implementation and refinement:

- Clarify overloaded elevation concepts.
- Separate land-shape value from relief/elevation.
- Preserve the current coastline character.
- Improve edge ocean pressure.
- Add continent separation pressure.
- Later add cleanup and continent detection.

Detailed generator shaping work should follow `docs/land-shape-pipeline.md`.

## Documentation Maintenance

After meaningful changes, update the relevant docs before merging:

- Update `README.md` if setup, commands, or project structure changes.
- Update `docs/filemap.md` if files are added, removed, renamed, or significantly repurposed.
- Update `docs/roadmap.md` if project status or next steps change.
- Update `docs/design.md` if project direction or principles change.
- Update focused design docs like `docs/land-shape-pipeline.md` if implementation decisions affect that system.

## Notes For Codex And AI-Assisted Development

Before editing code, read:

- `README.md`
- `docs/design.md`
- `docs/roadmap.md`
- `docs/filemap.md`
- Any focused spec relevant to the work, especially `docs/land-shape-pipeline.md` for generator changes.

Keep changes scoped. Do not change code, package files, generated files, or sample data during documentation-only tasks.
