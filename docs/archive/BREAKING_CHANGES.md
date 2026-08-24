# Breaking Changes - Strata 2.0

## Package Export Reorganization

Strata 2.0 introduces a **clean modular export structure**. This is a **breaking change** from 1.x.

### Design Principles

1. **No duplicate paths** - Each export path serves ONE purpose
2. **Optional modules are separate** - Heavy dependencies (AI, Physics, State) are opt-in
3. **Clear hierarchy** - Core → React → Optional modules
4. **Tree-shakeable** - Import only what you need

### Export Structure

| Path | Purpose | Dependencies |
|------|---------|--------------|
| `@jbcom/strata` | Core algorithms (pure TypeScript, NO React) | three |
| `@jbcom/strata/react` | React Three Fiber components | react, @react-three/fiber |
| `@jbcom/strata/ai` | AI & pathfinding components | yuka (optional peer) |
| `@jbcom/strata/state` | State management components | zustand (optional peer) |
| `@jbcom/strata/physics` | Physics components | @react-three/rapier (optional peer) |
| `@jbcom/strata/shaders` | Raw GLSL shaders & materials | three |
| `@jbcom/strata/presets` | Ready-made configurations | varies |

### Migration from 1.x

```typescript
// ❌ OLD (1.x) - Will NOT work in 2.0
import { Terrain, Water } from '@jbcom/strata/components';
import { createNoise2D } from '@jbcom/strata/utils';

// ✅ NEW (2.0) - Correct imports
import { Terrain, Water } from '@jbcom/strata/react';
import { createNoise2D } from '@jbcom/strata';  // Core exports
```

### Removed Paths

| Removed Path | Replacement | Reason |
|--------------|-------------|--------|
| `./components` | `./react` | Renamed for clarity |
| `./utils` | `.` (main) | Merged into core |

### Why This Structure?

1. **`./react` not `./components`**: Clearer that these are React-specific
2. **Separate AI/State/Physics**: These pull in heavy optional dependencies
3. **`./shaders` stays separate**: Advanced users need raw GLSL access
4. **No `./utils`**: Small utilities belong in core

---

## Agent Instructions

**DO NOT** add backward-compatible aliases like `./components` pointing to `./react`.

**DO NOT** create duplicate export paths.

**DO** update imports in the codebase to use the new paths.

**DO** document any new export paths in this file.

---

## Version History

- **2.0.0**: Initial modular export structure (this document)
