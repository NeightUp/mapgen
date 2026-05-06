# Mapgen

A procedural hex-map generator prototype for the future browser-based map generator utility.

Current state:
- Python/Pygame prototype
- Root-level modules
- Generates terrain from layered Perlin noise
- Saves `full_map.png` as a local preview output

Near-term goal:
- Separate map-generation logic from rendering
- Document the data model
- Prepare the generator for a browser-based UI