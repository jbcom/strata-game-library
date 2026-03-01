Add a new Strata component named "$ARGUMENTS" to the library.

## Context

Read the existing component patterns before creating files:

1. Look at `adapters/r3f/src/components/water/Water.tsx` for the canonical R3F component pattern
2. Check `adapters/r3f/src/components/` for the list of existing domain directories
3. Read `AGENTS.md` for development standards

## Steps

### 1. Determine Domain

Identify the correct domain directory for this component from the existing domains:
`ai`, `animation`, `audio`, `camera`, `clouds`, `decals`, `input`, `instancing`,
`lod`, `parallax`, `particles`, `physics`, `postprocessing`, `shaders`, `sky`,
`state`, `ui`, `volumetrics`, `water`, `weather`

If the component belongs to a new domain, create the domain directory and its `__tests__/` subdirectory.

### 2. Create Component File

Create `adapters/r3f/src/components/[domain]/[Name].tsx`:

- Use functional component with `forwardRef` when the component wraps a Three.js object
- Add JSDoc header with `@module components/[domain]` and `@category` tag
- Define a typed props interface `[Name]Props` with JSDoc on each property
- Use `useMemo` for geometries/materials (never create in render loop)
- Use `useEffect` for cleanup/disposal
- Set `displayName` on the component
- Import core logic from `@strata-game-library/core`, NOT inline

### 3. Create Test File

Create `adapters/r3f/src/components/[domain]/__tests__/[name].test.tsx`:

- Import from `vitest` (`describe`, `it`, `expect`, `vi`)
- Mock `@react-three/fiber` and `three` as needed
- Test: renders without crashing, applies default props, accepts custom props
- Test: disposes resources on unmount
- Test: handles edge cases (zero size, undefined optional props)

### 4. Export the Component

- Add export to `adapters/r3f/src/components/[domain]/index.ts` (create if needed)
- Add re-export to `adapters/r3f/src/index.ts`

### 5. Reactylon Equivalent (if applicable)

If the component has a Babylon.js equivalent:

- Create `adapters/reactylon/src/components/[Name].tsx`
- Follow Reactylon patterns from existing components
- Add test in `adapters/reactylon/tests/`

### 6. Preset Configuration (if configurable)

If the component has tunable parameters:

- Add preset type to `packages/presets/src/[domain]/index.ts`
- Add default preset values
- Add preset test

### 7. Validate

```bash
pnpm nx run r3f:build
pnpm nx run r3f:test
pnpm nx run r3f:typecheck
pnpm run lint
```

## Conventions

- All components must be functional (no class components)
- Use `forwardRef` when the component renders a Three.js mesh/group
- Props interfaces must be exported and fully documented with JSDoc
- Commit with: `feat(r3f): add [Name] component`
