# Land Shape Pipeline Design Spec

## Purpose

This document defines the intended direction for Mapgen’s world-shape and land-generation system.

The goal is to preserve the current generator’s strongest quality: interesting, irregular, believable land silhouettes. The next step is to add enough structure and configurability to turn those shapes into useful game and worldbuilding maps without replacing the current land-shape character with boring procedural blobs.

This plan focuses on land shape, continent separation, map edge behavior, and the relationship between land silhouettes and later topology/features.

It is not a full biome, river, resource, or game-simulation design. Those systems should build on top of the land-shape pipeline after the basic world structure is solid.

This is the focused design spec for the next generator phase. Keep `docs/design.md` broad, keep `docs/roadmap.md` current for phase/status tracking, and update this document when implementation decisions change the land-shape pipeline.

---

## Current Situation

The project currently has a browser-based Mapgen prototype with:

- Seed-based generation.
- A canvas hex renderer.
- Solid-color terrain rendering.
- Pan and zoom.
- Grid toggle.
- JSON export.
- PNG export.
- Sea level, mountain amount, and roughness sliders.
- A terrain legend.
- A sample JSON loader.
- A TypeScript browser generator.

The current browser generator already uses a hybrid approach:

- Layered seeded noise.
- A fixed continent-shape mask.
- Sea level adjustment.
- Roughness adjustment.
- Mountain threshold adjustment.
- Ocean edge correction.
- Polar bands.
- Terrain classification.

This is a strong foundation. The next step is to make the land-shaping system more deliberate, configurable, and expandable without losing the visual character of the current maps.

---

## Core Problem

The current generator produces promising land shapes, but one core value is still doing too many jobs.

At the moment, the generated value is effectively used for:

- Land/water decisions.
- Coastline shape.
- Plains, hills, mountains, and high mountains.
- Broad elevation feel.
- Some map-edge ocean correction.
- Some polar terrain classification.

This causes a major problem:

> The same value that creates the landmass silhouette also tends to create the internal elevation pattern.

As a result, large landmasses can feel like giant volcanic islands, where elevation builds too directly from the same field that created the land. Mountains become high-value patches instead of believable mountain systems, ridges, ranges, basins, valleys, and internal relief.

The generator’s land shapes are worth preserving. The fix is not to replace the current generator with boring continent blobs. The fix is to separate land shape from internal topology.

---

## Main Design Principle

### Land shape is not elevation.

The generator should treat landmass creation and internal terrain detail as separate layers.

The current noise/mask system should primarily generate:

- Land silhouettes.
- Coastline shapes.
- Ocean/land distribution.
- Large-scale landmass identity.
- Continent/island structure.

A later, separate pass should generate:

- Internal relief.
- Mountain ranges.
- Hills.
- Plateaus.
- Basins.
- River valleys.
- Lake basins.
- Terrain features.
- Biome support data.

This preserves the current generator’s strongest visual quality while allowing more believable world detail later.

---

## Target Mental Model

The generator should move toward this conceptual pipeline:

```text
seed
  ↓
large-scale world-shape mask
  ↓
noisy land-silhouette field
  ↓
edge ocean pressure
  ↓
continent/ocean separation pressure
  ↓
sea-level threshold
  ↓
land/water mask
  ↓
land cleanup and continent detection
  ↓
separate internal relief generation
  ↓
mountain range / basin / lake / river feature passes
  ↓
climate and biome classification
  ↓
render/export
```

The early focus should be the upper half of this pipeline:

```text
world-shape mask
land-silhouette field
edge pressure
continent separation
sea level
land cleanup
continent detection
```

Biome, rivers, and detailed topology should come after land shaping is reliable.

---

## Key Terms

### Land Shape Value

A numeric value representing how strongly a tile wants to be land or water.

This is the field that produces the coastline and landmass outline.

It should not directly determine final mountains, hills, or detailed elevation.

### Land Mask

A boolean or classified result of the land-shape value after sea level and shaping pressures are applied.

Example:

```text
land_shape_value > sea_level = land
land_shape_value <= sea_level = water
```

### Relief Value

A separate numeric value generated after the land mask exists.

This controls internal topology:

- Lowlands.
- Highlands.
- Hills.
- Mountains.
- Basins.
- Plateaus.

### World-Shape Mask

A large-scale influence layer that encourages the broad world layout.

Examples:

- One large pangaea mass.
- Two major continents.
- Several balanced continents.
- Island chains.
- Archipelago.
- Fractured land.

The current browser generator already has a simple hard-coded version of this idea. Long-term, it should become seed-driven and preset/config driven.

### Edge Ocean Pressure

A shaping value that nudges tiles near the east/west borders toward ocean.

This replaces hard visible ocean strips with smoother, configurable edge behavior.

### Continent Separation Pressure

A shaping value that encourages ocean channels, straits, and separation between landmasses.

This should help turn almost-separated landmasses into true continents without making every map artificially divided.

---

## What We Want To Preserve

The current generator is valuable because it can create:

- Irregular land outlines.
- Natural-looking coastlines.
- Bays and peninsulas.
- Large continents.
- Medium landmasses.
- Islands.
- Non-boring silhouettes.

The project should not move back toward simple oval blobs or overly clean procedural continents.

Any new shaping system should be judged by this rule:

> Does this preserve or improve the current generator’s natural land-shape character?

If a change makes maps cleaner but more boring, it is probably the wrong direction.

---

## What We Want To Improve

The next generation improvements should target:

- Better ocean separation between major landmasses.
- Less obvious east/west ocean boundary logic.
- Better control over pangaea vs continents vs islands.
- Configurable land amount.
- Configurable coast roughness.
- Configurable continent separation.
- Configurable island amount.
- Separate internal relief from land silhouette generation.
- Future support for mountain ranges, basins, lakes, rivers, and biomes.

---

## Recommended Land Shape Pipeline

### 1. Generate Large-Scale World Shape

Create a broad map-shaping field before detailed noise is applied.

This can be generated from presets such as:

- `balanced_continents`
- `pangaea`
- `two_continents`
- `island_chains`
- `archipelago`
- `fractured_world`

Each preset can control:

- Number of major land influence areas.
- Their approximate centers.
- Their radius/scale.
- Their strength.
- Their separation.
- Their tendency to create islands.
- Their roughness.
- Their edge behavior.

Important: these should be soft influence fields, not hard rectangular map regions.

Avoid obvious map partitions.

---

### 2. Generate Noisy Land-Silhouette Field

Use the current generator’s strength: layered noise that creates interesting land outlines.

This field should provide coastline personality and local variation.

The noise should remain seed-based and reproducible.

Future controls may include:

- Coast roughness.
- Landmass scale.
- Island noise.
- Detail scale.
- Noise weighting.

The goal is to let the broad world-shape mask say “land is generally likely here,” while the noisy silhouette field decides the organic coast.

---

### 3. Apply Sea Level

Sea level is one of the most important shaping controls.

Higher sea level should:

- Reduce land amount.
- Break narrow land bridges.
- Create more islands.
- Increase separation.

Lower sea level should:

- Increase land amount.
- Merge nearby landmasses.
- Create larger continents or pangaea-like worlds.

Sea level should remain a primary user-facing slider.

---

### 4. Apply Edge Ocean Pressure

The project needs clean east/west map edges so landmasses do not wrap awkwardly offscreen.

The current hard edge correction should eventually be replaced with a smoother pressure field.

Desired behavior:

- East/west outer borders can be guaranteed ocean.
- The ocean influence fades inward smoothly.
- The fade should be noise-warped or uneven enough to avoid visible vertical strips.
- Islands near the edge can be allowed or disallowed depending on settings.
- The map should not look like the edge was manually carved.

Potential user-facing setting:

```text
East/West Edge Ocean:
Off / Soft / Strong / Guaranteed
```

---

### 5. Apply Continent Separation Pressure

Add a shaping layer whose job is to encourage ocean channels and continent separation.

This should not be a hard dividing line.

Instead, it should be a broad, organic, seed-driven field that subtracts from the land-shape value in certain areas, making weak land connections more likely to become water.

Potential user-facing setting:

```text
Continent Separation:
Low / Balanced / High
```

Behavior:

- Low: more connected landmasses, pangaea-friendly.
- Balanced: some major separation, useful default.
- High: stronger continents, straits, island chains, and divided landmasses.

This is likely one of the most important future customization controls.

Implementation note: the first pressure-only approach was too subtractive and
could dent landmasses instead of producing natural separation. The browser
generator now makes the broad continent mask more separation-aware with less
overlap between major land supports, weaker offset middle islands, and a subtle
curved separation valley. Continent separation pressure remains as a mild
assistive pass for weak bridges. This is not continent detection, cleanup, or a
complete continent system; those remain future work.

---

### 6. Classify Land/Water

After world-shape, noise, sea level, edge pressure, and separation pressure are combined, classify tiles as land or water.

At this stage, the generator should only decide:

- Deep ocean.
- Ocean.
- Land.

It should not yet decide mountains, hills, tundra, forests, deserts, etc.

This keeps land-shape generation clean.

---

### 7. Run Land Cleanup

After the first land/water mask is created, run cleanup passes.

Possible cleanup tasks:

- Remove ugly one-tile speckles.
- Preserve meaningful islands.
- Smooth obviously broken single-tile artifacts.
- Optionally widen narrow water channels.
- Optionally break weak narrow land bridges.
- Prevent tiny inland oddities unless intentional.
- Make sure the edge ocean rule is respected.

Cleanup should be careful. Over-cleaning can destroy the interesting roughness of the generator.

The goal is not “perfectly smooth.” The goal is “playable and believable.”

---

### 8. Detect Continents and Islands

After land/water cleanup, run a flood-fill pass to detect connected landmasses.

Each landmass can receive:

```text
continent_id
tile_count
bounding area
coastline count
major/minor classification
```

This enables later systems:

- Start-position scoring.
- Continent-aware resources.
- Region labels.
- Old World / New World presets.
- Island cleanup.
- Minimum viable continent checks.
- Player distribution.

This should be a post-process detection step, not something manually assigned during tile generation.

---

## Internal Relief Comes Later

After the land shape is captured, generate internal relief separately.

This should use a new field or fields, not the original land-shape field.

Possible relief layers:

- Base relief noise.
- Ruggedness noise.
- Ridge noise.
- Basin noise.
- Plateau masks.
- Mountain range masks.

This would allow a continent to have:

- Low inland basins.
- Coastal mountains.
- Inland mountain chains.
- Flat interiors.
- Broken highlands.
- Valleys.
- Lakes.
- River sources.

This solves the current problem where mountains are too directly tied to the land-shape value.

Implementation note: the browser generator now has a first proof pass for
separate relief. The shaped land value still decides deep ocean, ocean, and land,
while a separate seeded relief noise field classifies land tiles. During the
separate-relief proof branch, land relief is temporarily displayed as multiple
`relief_*` bands so the value ranges are easier to tune. These bands are debug
visualization, not final terrain or biome types. This is not final topology,
mountain range generation, lakes, rivers, cleanup, continent detection, or biome
work.

---

## Mountain Ranges

Mountains should eventually become feature masks rather than simply “highest land-shape values.”

Early approach:

1. Detect landmasses.
2. Pick mountain range start/end areas within land.
3. Draw noisy curved influence paths.
4. Apply ridged noise around those paths.
5. Classify nearby high-relief tiles as hills/mountains/high mountains.

This creates mountain systems instead of isolated mountain blobs.

Mountain controls can include:

```text
Mountain Amount
Mountain Range Length
Mountain Ruggedness
High Mountain Frequency
```

The current `mountainAmount` slider can remain, but eventually it should influence the relief/mountain pass, not the original land-shape threshold.

---

## Lakes and Basins

Lakes should be generated after land shape and relief exist.

Basic lake logic:

- Find low-relief land areas.
- Prefer enclosed or semi-enclosed basins.
- Reject tiles too close to ocean unless creating coastal wetlands later.
- Reject tiny ugly candidates unless small lakes are enabled.
- Place lake tiles.
- Optionally lower surrounding relief slightly.
- Later, allow rivers to flow into or out of lakes.

Lake controls can include:

```text
Lake Frequency
Lake Size
Basin Strength
```

---

## Rivers

Rivers should wait until land shape, relief, and lakes are stable.

Simple future river model:

1. Pick river sources from highland/mountain regions.
2. Flow downhill or toward lower neighboring tiles.
3. Prefer routes toward ocean or lakes.
4. Stop at ocean, lake, or basin.
5. Avoid excessive river overlap.
6. Mark river edges or river paths in tile data.

Rivers should influence later moisture and biome classification.

---

## Climate and Biomes

Climate and biome classification should happen after the physical map is believable.

Inputs should eventually include:

- Latitude.
- Elevation/relief.
- Distance to ocean.
- Distance to lakes/rivers.
- Moisture noise.
- Temperature noise.
- Rain shadow effects later if desired.
- Polar strength.
- Global wet/dry setting.
- Global hot/cold setting.

Biomes should not be forced too early.

The land needs to be structurally good before decorating it.

---

## User-Facing Controls

Early controls should stay understandable. Do not expose every internal value immediately.

Recommended land-shape controls:

```text
World Type
Water Level
Landmass Scale
Continent Separation
Coast Roughness
Island Amount
East/West Edge Ocean
```

Recommended topology controls later:

```text
Mountain Amount
Relief Roughness
Hill Amount
Basin Frequency
Lake Frequency
River Frequency
```

Recommended climate controls later:

```text
Climate
Temperature
Moisture
Polar Strength
Desert Strength
Forest Strength
```

The UI should offer simple controls first and advanced controls later.

---

## Preset Philosophy

Presets should be the main way users shape the map.

Sliders should refine the preset.

Example presets:

### Balanced Continents

Default strategy-map world.

- Several landmasses.
- Moderate ocean separation.
- Moderate islands.
- Moderate coast roughness.

### Pangaea

One dominant connected landmass.

- Lower continent separation.
- Lower sea level.
- Fewer ocean channels.
- Larger landmass scale.

### Two Continents

Two major separated landmasses.

- Stronger separation.
- Larger continent masks.
- Fewer small islands.

### Island Chains

Several medium and small landmasses.

- Higher island amount.
- Higher coast roughness.
- Moderate/high sea level.

### Archipelago

Many islands and small landmasses.

- High sea level.
- High island amount.
- Smaller landmass scale.
- Stronger separation.

### Fractured World

Ragged continents with many bays, channels, and peninsulas.

- High coast roughness.
- Medium/high separation.
- More straits.
- More irregular land.

---

## What Not To Do

Avoid these traps:

### Do Not Replace The Current Land Feel With Simple Blobs

The current generator’s irregular land shapes are the main asset.

Any new system must preserve that.

### Do Not Use Hard Rectangular Continent Sections

If continent influence areas are used, they should be soft, organic, and seed-driven.

Hard sections risk visible artificial layout.

### Do Not Let One Noise Field Control Everything

Land silhouette, relief, climate, and features should become separate layers.

### Do Not Add Biomes Before Land Shape Is Stable

Biome work should not cover up weak land generation.

### Do Not Over-Clean The Map

Some roughness, islands, peninsulas, and odd coastlines are good.

The goal is believable/playable, not sterile.

---

## Suggested Implementation Phases

### Phase A — Name and Preserve Current Concepts

Before major changes, clarify the current generator concepts in code/docs.

Current `elevation` is really acting more like a mixed land-shape/elevation value.

Future naming should distinguish:

```text
landShapeValue
reliefValue
adjustedLandValue
terrain
biome
features
```

The existing visual result should be preserved while concepts are renamed or separated carefully.

---

### Phase B — Separate Land/Water From Terrain Detail

Change the early generator so the first major output is a land/water mask.

The generator should classify:

```text
deep_ocean
ocean
land
```

Then a temporary terrain pass can still assign plains/hills/mountains for display, but the long-term structure should treat that as a later step.

---

### Phase C — Replace Hard Edge Ocean Logic

Replace banded east/west ocean adjustment with a smooth pressure function.

Requirements:

- Configurable strength.
- Configurable width.
- Optional guaranteed border ocean.
- No obvious vertical strip appearance.
- Seeded/noisy variation if needed.

---

### Phase D — Add Continent Separation Pressure

Add a new shaping layer that encourages organic ocean channels.

Requirements:

- Configurable strength.
- Seeded behavior.
- Works with sea level.
- Does not create obvious straight lines.
- Can be dialed down for pangaea worlds.
- Can be dialed up for continent/island worlds.

---

### Phase E — Add Land Cleanup and Continent Detection

After land/water classification:

- Remove ugly speckles.
- Preserve meaningful islands.
- Optionally carve weak land bridges.
- Flood-fill landmasses.
- Add `continent_id` or equivalent.
- Track major/minor landmasses.

---

### Phase F — Add Separate Relief

Generate internal topology after land shape.

Requirements:

- Does not alter coastline unless explicitly allowed.
- Creates local variation inside continents.
- Supports hills, mountains, basins, and future rivers/lakes.
- Eventually replaces mountain classification from land-shape values.

---

### Phase G — Add Feature Passes

After relief is stable:

- Mountain ranges.
- Basins.
- Lakes.
- Rivers.
- Moisture support.
- Climate/biome classification.

---

## Data Model Direction

The map tile model should gradually move toward supporting these fields:

```text
row
col
is_land
terrain
elevation
land_shape_value
relief_value
adjusted_land_value
temperature
moisture
biome
features
river_edges
continent_id
start_score
```

Not all fields need to be active immediately.

The important part is to avoid tying all future systems to one overloaded `elevation` number.

---

## Success Criteria

The land-shape pipeline is successful when Mapgen can produce:

- Interesting, irregular landmasses like the current generator.
- Configurable pangaea/continent/island behavior.
- Clean east/west map edges without obvious artificial strips.
- Better separation between major landmasses.
- Preserved rough coastlines and natural silhouettes.
- Land masks that can support later relief, mountain, lake, river, climate, and biome passes.
- Reproducible maps from seeds.
- User-facing sliders that meaningfully change the map without breaking it.

The key test:

> Can we generate maps that still feel like the current promising examples, but with more control, cleaner separation, and better support for future world detail?

If yes, the project is moving in the right direction.

---

## Final Direction

Mapgen should not become a generic clean continent-blob generator.

It should become a layered procedural world generator where:

- The current noisy generator provides the soul of the coastline.
- World-shape masks provide broad structure.
- Sea level controls land amount.
- Edge pressure keeps map borders clean.
- Separation pressure creates useful continents and straits.
- Cleanup makes maps playable.
- Later relief and feature passes turn the land shapes into believable worlds.

In short:

```text
Generate the land shape first.
Preserve what makes it interesting.
Shape it gently.
Then build the world on top of it.
```
