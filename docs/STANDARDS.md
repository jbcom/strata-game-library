---
title: "Strata Development Standards"
description: "Code organization, JSDoc, testing, and quality standards for all Strata library code"
status: active
implementation: 100
last_updated: 2026-03-01
area: standards
---

# Strata Development Standards

All code in the Strata library MUST follow these standards. No exceptions.

## Code Organization

### File Size Limits

- **Maximum**: 400 lines of code per file
- **Preferred**: ≤300 lines per file
- **Action**: Split file when exceeding limit or handling multiple responsibilities

### Directory Structure

```
src/core/<domain>/
├── index.ts           # Public exports only
├── types.ts           # Type definitions (≤200 LOC)
├── <feature>.ts       # Feature implementation
├── adapters/
│   ├── web/          # Web platform adapters
│   ├── capacitor/    # Capacitor mobile adapters
│   └── native/       # React Native stubs
└── __tests__/
    ├── <feature>.test.ts      # Unit tests
    └── <feature>.integration.ts # Integration tests
```

### Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Files | kebab-case | `game-store.ts` |
| Classes | PascalCase | `AudioManager` |
| Interfaces | PascalCase | `StoreConfig` |
| Types | PascalCase | `GameState` |
| Functions | camelCase | `createGameStore` |
| Variables | camelCase | `currentState` |
| Constants | SCREAMING_SNAKE | `DEFAULT_CONFIG` |

### Module Rules

1. One responsibility per module
2. Export through barrel files (`index.ts`) only
3. No circular dependencies
4. Adapters implement contracts defined in types.ts

---

## JSDoc Documentation

### Required Tags

Every exported symbol MUST have:

```typescript
/**
 * Brief description of what this does.
 * 
 * @module core/state
 * @public
 * 
 * @param config - Configuration options
 * @param config.initialState - Starting state value
 * @returns The created store instance
 * 
 * @throws {Error} When initialState is undefined
 * 
 * @example
 * ```typescript
 * const store = createGameStore({
 *   player: { health: 100, position: [0, 0, 0] }
 * });
 * 
 * store.getState().player.health; // 100
 * store.setState({ player: { health: 50 } });
 * store.undo(); // health back to 100
 * ```
 */
export function createGameStore<T>(config: StoreConfig<T>): GameStore<T> {
```

### Documentation Checklist

- [ ] All exported functions have JSDoc
- [ ] All exported classes have JSDoc
- [ ] All exported interfaces have JSDoc with property descriptions
- [ ] All exported types have JSDoc
- [ ] All hooks have JSDoc with usage examples
- [ ] Platform-specific code documents constraints
- [ ] Internal helpers have summary comments if non-trivial

---

## Testing Requirements

### Coverage Targets

- **Minimum**: 90% statement coverage
- **Minimum**: 90% branch coverage
- **Goal**: 100% for core business logic

### Test Case Categories

Every function/class MUST have tests for:

1. **Ideal Case** - Happy path with valid inputs
2. **Normal Case** - Typical real-world usage patterns
3. **Edge Cases** - Boundary conditions, empty inputs, limits
4. **Error Cases** - Invalid inputs, thrown exceptions, failures

### Test File Structure

```typescript
// src/core/state/__tests__/store.test.ts

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createGameStore } from '../store';

describe('createGameStore', () => {
  describe('ideal case', () => {
    it('creates store with initial state', () => {
      // ...
    });
  });

  describe('normal usage', () => {
    it('updates state via setState', () => {});
    it('supports undo after state change', () => {});
    it('supports redo after undo', () => {});
  });

  describe('edge cases', () => {
    it('handles empty initial state', () => {});
    it('handles deeply nested state updates', () => {});
    it('limits undo stack to maxSize', () => {});
  });

  describe('error cases', () => {
    it('throws when initialState is undefined', () => {});
    it('handles storage errors gracefully', () => {});
  });
});
```

### Integration Tests

- Test adapter implementations against shared contract fixtures
- Test library wrapper behavior matches underlying library
- Use real library instances, not mocks, for integration tests

### Mocking Strategy

```typescript
// Mock external libraries with typed facades
vi.mock('howler', () => ({
  Howl: vi.fn().mockImplementation(() => ({
    play: vi.fn(),
    stop: vi.fn(),
    volume: vi.fn(),
  })),
}));
```

---

## Library Alignment

### Version Policy

- Pin exact versions in package.json (no `^` or `~`)
- Update versions deliberately with changelog review
- Run contract tests before version bumps

### Wrapper Strategy

**DO**: Thin wrappers that add Strata-specific behavior only

```typescript
// Good: Re-export with minimal wrapper
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';

export { useFrame, useTexture };

export function useWaterAnimation(ref: RefObject<Mesh>) {
  useFrame((state) => {
    if (ref.current) {
      ref.current.material.uniforms.time.value = state.clock.elapsedTime;
    }
  });
}
```

**DON'T**: Duplicate library functionality

```typescript
// Bad: Reimplementing what @react-three/fiber already does
export function useCustomFrame(callback: () => void) {
  useEffect(() => {
    const interval = setInterval(callback, 16);
    return () => clearInterval(interval);
  }, []);
}
```

### Re-export Rules

1. Re-export vendor types directly when possible
2. Mirror vendor APIs, don't reinvent them
3. Add Strata-specific convenience methods as extensions
4. Document which features come from which library

### Contract Tests

```typescript
// Ensure our wrapper matches underlying library behavior
describe('three.js contract', () => {
  it('createWaterMaterial() returns a ShaderMaterial', () => {
    const material = createWaterMaterial();
    expect(material).toBeInstanceOf(ShaderMaterial);
  });
});
```

---

## Cleanup Protocol

### Forbidden Patterns

- ❌ Commented-out code
- ❌ `console.log` statements (use proper logging)
- ❌ `any` type without justification
- ❌ Unused imports
- ❌ Dead code paths
- ❌ TODO comments without issue references

### Cleanup Actions

1. Delete superseded legacy files with each module delivery
2. Run `pnpm run lint` before committing
3. Run `pnpm run format:check` before committing
4. Run `pnpm run test:coverage` to verify coverage

### Dead Code Detection

```bash
# Run ts-prune to find unused exports
npx ts-prune

# ESLint catches unused variables
pnpm run lint
```

### Legacy Code Handling

- If code must be temporarily retained, move to `src/legacy/`
- Add removal deadline in comment: `// REMOVE BY: 2025-01-15`
- Create GitHub issue tracking removal

---

## Pre-Commit Checklist

Before any code is considered complete:

- [ ] File size ≤400 LOC
- [ ] All exports have JSDoc with @example
- [ ] Unit tests cover ideal/normal/edge/error cases
- [ ] ≥90% coverage for new code
- [ ] No commented-out code
- [ ] No `console.log` statements
- [ ] No `any` without justification
- [ ] `pnpm run lint` passes
- [ ] `pnpm run format:check` passes
- [ ] `pnpm run test` passes
- [ ] Old/superseded code deleted
