# World Topology Example

This example demonstrates the **World Topology System** (RFC-003) in Strata.

## Features

- **WorldGraph**: Defines regions (Marsh, Forest, Mountain) and connections.
- **RegionSystem**: Tracks the player's position and updates the current region.
- **ConnectionSystem**: Handles traversal between regions via paths and portals.
- **SpawnSystem**: Populates regions with entities based on spawn tables.

## Running the Example

```bash
pnpm install
pnpm dev
```

Navigate to `http://localhost:5173` to see the demo.
