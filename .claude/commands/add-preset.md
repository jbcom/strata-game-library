Add a new preset configuration named "$ARGUMENTS" to the presets package.

## Context

Read the existing preset patterns before creating files:

1. Look at `packages/presets/src/water/index.ts` for a canonical preset pattern
2. Check `packages/presets/src/` for existing domain directories
3. Presets import component prop types from `@strata-game-library/r3f`

## Steps

### 1. Determine Domain

Identify the correct domain from existing preset directories:
`ai`, `animation`, `audio`, `billboards`, `camera`, `clouds`, `collectibles`,
`creatures`, `decals`, `equipment`, `fur`, `input`, `lighting`, `lod`, `molecular`,
`obstacles`, `particles`, `physics`, `postprocessing`, `reflections`, `shaders`,
`shadows`, `state`, `structures`, `terrain`, `ui`, `vegetation`, `vehicles`, `water`, `weather`

If no existing domain fits, create a new domain directory.

### 2. Create Preset File

Create `packages/presets/src/[domain]/index.ts` (or add to existing):

```typescript
/**
 * [Domain] presets for Strata components.
 *
 * @module presets/[domain]
 * @category Presets
 */

/** Configuration for [preset name] */
export interface [Name]Preset {
  /** Description of this property. Default: value */
  property: type;
}

/** [Brief description of this preset] */
export const [name]Preset: [Name]Preset = {
  property: defaultValue,
};

/** All [domain] presets */
export const [domain]Presets = {
  [name]: [name]Preset,
} as const;
```

### 3. Export from Package

Add to `packages/presets/src/index.ts`:

```typescript
export { [domain]Presets, [name]Preset } from './[domain]/index.js';
export type { [Name]Preset } from './[domain]/index.js';
```

### 4. Create Tests

Create `packages/presets/src/[domain]/__tests__/[domain].test.ts`:

- Verify preset values are within valid ranges
- Test all required properties are defined
- Test preset can be spread/merged with overrides
- Test type compatibility with target component props

### 5. Validate

```bash
pnpm nx run presets:build
pnpm nx run presets:test
pnpm nx run presets:typecheck
```

## Conventions

- Presets are plain objects with TypeScript interfaces (no classes)
- All preset properties must have JSDoc with default values documented
- Group related presets using `as const` objects
- Use descriptive names: `oceanWaterPreset`, not `preset1`
- Presets should be composable: users can spread and override individual values
- Commit with: `feat(presets): add [name] preset`
