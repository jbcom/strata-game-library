# Developer Contract

## API Stability Guarantees

### Core API (`@jbcom/strata/core`)
- **Stable**: All SDF primitives, operations, noise functions
- **Stable**: Marching cubes functions
- **Stable**: Core instancing, water, raymarching material factories
- **Breaking changes**: Only in major versions

### React Components (`@jbcom/strata/components`)
- **Stable**: Component props and behavior
- **May change**: Internal implementation details
- **Breaking changes**: Only in major versions

### Shaders (`@jbcom/strata/shaders`)
- **Stable**: Shader string exports
- **Stable**: Uniform factory function signatures
- **May change**: Internal shader implementation (as long as output matches)
- **Breaking changes**: Only in major versions

## Type Safety

- All public APIs are fully typed
- TypeScript definitions are included in package
- No `any` types in public API
- All functions have JSDoc comments

## Performance Guarantees

- SDF functions: O(1) complexity
- Marching cubes: O(resolution³) complexity
- Noise functions: Deterministic, cacheable
- Instancing: GPU-accelerated via drei

## Error Handling

- SDF functions: Never throw (return numbers)
- Marching cubes: May return empty geometry if no surface found
- Instance generation: Returns fewer instances if constraints can't be met
- All functions validate inputs and provide clear errors

## Dependencies

### Required
- `three`: >=0.150.0
- For React components: `@react-three/fiber` >=8.0.0, `@react-three/drei` >=9.0.0

### Optional
- React components only work with React >=18.0.0
- Core API works with any framework or vanilla JS

## Testing

- All core functions have unit tests
- Tests verify API contract, not implementation
- Test coverage: >80% for core functions
- Run tests: `pnpm test`

## Versioning

- **Semantic Versioning** (semver)
- **Major**: Breaking API changes
- **Minor**: New features, backward compatible
- **Patch**: Bug fixes, no API changes
