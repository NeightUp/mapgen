# Map Lab Diagnostics And Review Spec

## Purpose

Map Lab is a developer-facing diagnostics and review workflow for improving Mapgen output through structured map data, seed/settings exports, generated metrics, and quick human review labels.

The goal is to avoid endless manual test/tweak/test loops where single seeds are judged by feel. Instead, Mapgen should be able to generate maps, collect useful diagnostics, let the developer quickly classify and rate the result, and export that review data for later analysis.

This system is not meant to replace procedural generation. It is meant to help tune the procedural generator with better evidence.

## Core Idea

Every generated map already has important information:

- Seed.
- Generator settings.
- Tile data.
- Terrain counts.
- Land/water percentage.
- Edge land percentage.
- Elevation/relief values.
- Future continent, biome, river, lake, and resource data.

Map Lab adds human judgment on top of that data:

- What kind of map does this look like?
- Is it a good example of that map type?
- Is the overall map good?
- What specific features worked or failed?
- Which seeds/settings consistently produce useful results?

This creates a feedback loop:

```text
generate map
↓
calculate diagnostics
↓
developer labels and rates map
↓
export review data
↓
analyze results
↓
tune generator settings and logic
↓
repeat
```

## Why This Matters

The map is the foundation of the future strategy game. If the maps are weak, the later game systems will be built on weak ground.

Mapgen needs a reliable way to discover:

- Which settings produce good pangaea maps.
- Which settings produce good balanced-continent maps.
- Which settings produce unbalanced but interesting continent layouts.
- Which settings produce useful archipelago maps.
- Which seeds produce bad maps that should be filtered out.
- Which generator changes improve results across many seeds instead of only improving one visible example.

The long-term goal is to make bad outputs rare, not just manually regenerate until a good seed appears.

## Map Lab Is

Map Lab is:

- A developer diagnostics workflow.
- A map review and labeling tool.
- A dataset export tool.
- A way to compare generator settings across many seeds.
- A way to preserve good and bad examples for later analysis.
- A foundation for future map-quality scoring.
- A possible foundation for future lightweight machine-learning experiments.

## Map Lab Is Not

Map Lab is not, for the early implementation:

- A public user-facing feature.
- A required part of V1.
- A full AI map generator.
- A replacement for the procedural generator.
- A finished data-science dashboard.
- A cloud review service.
- A user account or community voting system.

Early Map Lab work should stay simple and local.

## Initial Map Type Labels

The first review UI should allow the developer to classify the observed map type.

Recommended initial map type options:

```text
unreviewed
pangaea
balanced_continents
unbalanced_continents
two_continents
archipelago
island_chains
fractured_world
bad_output
other
```

These are observed labels, not necessarily requested presets.

For example, a map generated with default settings may be labeled `archipelago` if that is what it actually resembles.

This distinction is important because later analysis should be able to compare:

```text
requested preset
vs.
observed map type
vs.
human quality rating
```

## Initial Rating Fields

The first version should keep ratings fast enough to use repeatedly.

Recommended ratings:

```text
overall_rating: 1-10
type_fit_rating: 1-10
land_shape_rating: 1-10
elevation_rating: 1-10
```

Meanings:

- `overall_rating`: How much the developer likes the map overall.
- `type_fit_rating`: How well the map fits the selected observed map type.
- `land_shape_rating`: How good the landmass shapes, coastlines, islands, and continent layout are.
- `elevation_rating`: How good the hills, mountains, highlands, basins, and relief structure are.

Ratings should allow an unrated/null state so a map can be exported without full review.

## Quick Review Flags

The review panel should include quick toggle buttons for common observations.

Recommended positive flags:

```text
looks_natural
good_continent_spacing
good_coastlines
good_island_distribution
good_pangaea_candidate
good_archipelago_candidate
good_balanced_continent_candidate
interesting_world
good_strategy_map
keep_seed
```

Recommended negative flags:

```text
too_blobby
too_noisy
too_much_land
not_enough_land
too_many_tiny_islands
not_enough_islands
continents_too_connected
continents_too_separated
edge_ocean_too_obvious
mountains_too_dense
mountains_too_sparse
mountains_too_random
mountains_too_coastal
bad_output
reject_seed
```

These flags should be stored as simple strings.

## Notes Field

The review UI should include a freeform notes field.

Example:

```text
Good balanced continent candidate. Nice west/east separation, but mountain coverage is too heavy and the southern island chain feels noisy.
```

Notes are useful for human memory and later analysis, but the core dataset should not depend on notes being filled out.

## Diagnostic Data To Export

Each reviewed map should export:

```text
schema_version
created_at
seed
source
generator_settings
requested_preset
observed_map_type
ratings
flags
notes
summary_metrics
terrain_counts
layer_stats
topology_metrics
```

Early versions do not need every future field. The schema should be designed so new diagnostic fields can be added later without breaking older exports.

## Suggested Export Shape

```json
{
  "schema_version": 1,
  "created_at": "2026-05-11T00:00:00.000Z",
  "source": "browser_generator",
  "seed": 123456,
  "requested_preset": "default",
  "observed_map_type": "balanced_continents",
  "generator_settings": {
    "seaLevel": 0.05,
    "mountainAmount": 1,
    "roughness": 1
  },
  "ratings": {
    "overall": 8,
    "typeFit": 9,
    "landShape": 8,
    "elevation": 6
  },
  "flags": [
    "good_continent_spacing",
    "good_coastlines",
    "mountains_too_dense"
  ],
  "notes": "Good balanced continent candidate, but mountain bands are too heavy.",
  "summary_metrics": {
    "rows": 45,
    "cols": 85,
    "totalTiles": 3825,
    "landTiles": 1720,
    "waterTiles": 2105,
    "landPercent": 44.97,
    "waterPercent": 55.03,
    "edgeLandTiles": 0,
    "edgeLandPercent": 0
  },
  "terrain_counts": {
    "deep_ocean": 1000,
    "ocean": 1105,
    "plains": 820,
    "hills": 510,
    "mountain": 260,
    "high_mountain": 80,
    "tundra": 35,
    "ice": 15
  },
  "layer_stats": {
    "landShapeValue": null,
    "adjustedLandValue": null,
    "reliefValue": null
  },
  "topology_metrics": {
    "landmassCount": null,
    "majorLandmassCount": null,
    "largestLandmassPercentOfLand": null,
    "tinyIslandCount": null,
    "coastlineTileCount": null
  }
}
```

Null values are acceptable for fields that are planned but not implemented yet.

## Lightweight Vs Full Export

Map Lab should support two export levels.

### Lightweight Review Export

Used for batch analysis.

Includes:

- Seed.
- Settings.
- Ratings.
- Flags.
- Notes.
- Terrain counts.
- Summary metrics.
- Topology metrics when available.
- Layer statistics when available.

Does not include the full tile array unless needed.

### Full Diagnostic Export

Used for deep inspection of specific good or bad seeds.

Includes everything from the lightweight export plus:

- Full tile data.
- Per-tile land-shape values.
- Per-tile adjusted land values.
- Per-tile relief values.
- Future continent IDs.
- Future distance-to-coast.
- Future river/lake/biome/resource fields.

The full export can become large, so it should not be the default for every reviewed map.

## Metrics To Add Over Time

### Existing Or Near-Term Metrics

The current app already tracks basic map statistics. Map Lab should preserve and expand this direction.

Early metrics:

```text
total tiles
land tiles
water tiles
land percent
water percent
edge land tiles
edge land percent
terrain counts
land balance label
edge status label
```

### Landmass And Topology Metrics

After continent detection exists:

```text
landmass count
major landmass count
minor island count
tiny island count
one-tile island count
largest landmass tile count
largest landmass percent of total land
top 3 landmass sizes
coastline tile count
coastline-to-land ratio
average land distance from coast
```

### Elevation And Relief Metrics

After separate relief exists:

```text
relief min
relief max
relief mean
relief median
relief percentiles
plains percent of land
hills percent of land
mountain percent of land
high mountain percent of land
mountain cluster count
largest mountain cluster size
average mountain distance from coast
local high point count
local low basin count
slope distribution
```

### Preset Accuracy Metrics

After requested map presets exist:

```text
requested preset
observed map type
type fit rating
preset success rate
average rating by preset
average rating by setting range
common failure flags by preset
```

## Review Session Export

Map Lab should eventually support a review session export.

A review session is a collection of reviewed maps generated during one tuning pass.

Example:

```json
{
  "schema_version": 1,
  "session_id": "2026-05-11-balanced-pass-a",
  "created_at": "2026-05-11T00:00:00.000Z",
  "branch": "feature/continent-separation-pressure",
  "notes": "Testing current continent separation behavior before relief tuning.",
  "reviews": []
}
```

This lets the developer generate and review many seeds, then export one dataset file for analysis.

## Human Review Workflow

Initial workflow:

1. Generate a map.
2. Inspect the map visually.
3. Choose observed map type from dropdown.
4. Set quick ratings.
5. Toggle any relevant flags.
6. Add optional notes.
7. Save review to current session.
8. Continue generating maps.
9. Export review session JSON.

This should be fast. The review panel should not turn into a slow form.

## Future Batch Generation Workflow

Later workflow:

1. Choose generator settings or preset.
2. Choose seed count.
3. Generate many maps.
4. Save lightweight diagnostics for each map.
5. Optionally review thumbnails manually.
6. Export combined diagnostics.
7. Analyze which settings produced the best maps.

Possible future command:

```text
npm run diagnostics -- --count 250 --preset balanced_continents --out diagnostics/balanced-250.json
```

This is not required for the first Map Lab implementation, but the data model should make it possible.

## Future Candidate Selection

Eventually, Mapgen may generate several internal candidates and choose the best one based on diagnostic scores.

Example:

```text
Generate 20 candidate maps.
Score each against the selected preset target.
Show the highest-scoring result.
```

This would make the generator feel much smarter without replacing the procedural system.

## Future Lightweight Machine Learning Possibility

Map Lab may eventually produce enough reviewed examples to train a small quality predictor.

This should be treated as a future experiment, not a near-term requirement.

A possible first machine-learning target would be:

```text
Input:
- seed/settings
- land/water metrics
- terrain distribution
- landmass metrics
- relief metrics
- review flags

Output:
- predicted overall rating
- predicted map type
- likely failure flags
```

This model would judge maps, not generate them.

The procedural generator would remain the source of maps.

## Implementation Phases

### Phase A — Documentation

Add this spec and cross-link it from:

```text
README.md
docs/design.md
docs/roadmap.md
docs/filemap.md
```

No code changes in this phase.

### Phase B — Review Data Types

Add TypeScript types for map reviews and diagnostic exports.

Possible files:

```text
web/src/mapReviewTypes.ts
web/src/mapDiagnostics.ts
```

Keep these data-focused and independent from rendering.

### Phase C — Single Map Diagnostics Export

Add a button to export diagnostics for the current map.

This should include:

- Current map seed.
- Current generator settings.
- Existing map stats.
- Terrain counts.
- Placeholder/null fields for future diagnostics.

### Phase D — Review Panel

Add a developer review panel with:

- Observed map type dropdown.
- Ratings.
- Quick flags.
- Notes.
- Save review button.
- Export current review button.

### Phase E — Review Session Storage

Allow multiple reviews to be collected during a session and exported as one JSON file.

Local-only storage is enough for early versions.

### Phase F — Batch Diagnostics

Add a script or dev-only workflow to generate many maps and export diagnostics in one file.

### Phase G — Analysis And Scoring

Use exported datasets to tune generator settings and eventually define preset scoring rules.

## Success Criteria

Map Lab is successful when it helps answer questions like:

- Which settings most reliably produce balanced continents?
- Which settings most reliably produce archipelago maps?
- What metrics are common in maps rated 8/10 or higher?
- What metrics are common in rejected maps?
- Which generator changes improved average map quality?
- Which generator changes only improved one seed but hurt the broader output?
- Can Mapgen reduce bad outputs before the user ever sees them?

The core test:

```text
Can we use generated data and quick human review to make better maps with less blind tweaking?
```

If yes, Map Lab is doing its job.
