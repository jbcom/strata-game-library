# Strata Test Suite

This directory contains all automated tests for Strata, organized by test type.

## Test Structure

```text
tests/
├── unit/                      # Unit tests for core algorithms (pure TypeScript)
├── integration/               # Integration tests for React components (Vitest)
└── integration-playwright/    # Integration tests with Playwright (browser-based)
```

## Running Tests

```bash
# Unit tests only
pnpm test

# Unit tests with coverage
pnpm run test:coverage

# Integration tests (Vitest)
pnpm run test:integration

# Integration tests (Playwright)
pnpm run test:integration:playwright

# All tests
pnpm run test:all
```

## Test Types

### Unit Tests (`tests/unit/`)

**Purpose**: Test individual functions in isolation

**Scope**:

- Core algorithms (SDF, marching cubes, instancing, etc.)
- Pure TypeScript functions (no React, no Three.js scene)
- Input validation
- Edge cases
- Mathematical correctness

**Example**:

```ts
// tests/unit/sdf.test.ts
import { sdSphere } from '@jbcom/strata/core';

test('sdSphere returns correct distance', () => {
  const result = sdSphere(
    new Vector3(0, 0, 0),
    new Vector3(0, 0, 0),
    1.0
  );
  expect(result).toBe(-1.0); // Inside sphere
});
```

**Tools**: Vitest

### Integration Tests (`tests/integration/`)

**Purpose**: Test React components with Three.js scene

**Scope**:

- Component rendering
- Props handling
- State management
- Material/geometry creation
- Resource disposal

**Example**:

```tsx
// tests/integration/Water.test.tsx
import { render } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';
import { Water } from '@jbcom/strata/components';

test('Water component renders', () => {
  render(
    <Canvas>
      <Water size={10} />
    </Canvas>
  );
  // Assert material created, uniforms set, etc.
});
```

**Tools**: Vitest + @testing-library/react + @react-three/test-renderer

### Playwright Integration Tests (`tests/integration-playwright/`)

**Purpose**: Test library public API in real browser environments

**Scope**:

- Core API functions (SDF, instancing, materials)
- React component rendering with React Three Fiber
- Preset systems (particles, billboards, decals, etc.)
- Cross-browser compatibility
- Performance metrics
- Visual verification with screenshots

**Example**:

```ts
// tests/integration-playwright/components.spec.ts
test('should render Water component', async ({ page }) => {
  await page.goto('/');
  // Load library and create scene
  await page.evaluate(() => {
    // Create React Three Fiber scene with Water component
  });
  await page.screenshot({ path: 'test-results/water-component.png' });
});
```

**Tools**: Playwright + JUnit XML reporter + Testomat.io integration

**Note**: These are **library integration tests**, not end-to-end application tests. They test that Strata's public API works correctly in browsers, not full applications using Strata.

## Test Data

- Use deterministic seeds for random functions
- Mock Three.js WebGL context for unit tests
- Use test fixtures for complex geometries
- Keep test data minimal and focused

## Coverage Goals

- **Unit tests**: 90%+ coverage of core functions
- **Integration tests (Vitest)**: 80%+ coverage of components
- **Integration tests (Playwright)**: All major public API features

## Continuous Integration

All tests run in CI:

- Unit tests: Fast, run on every commit
- Integration tests (Vitest): Medium speed, run on every commit
- Integration tests (Playwright): Slower, run on every commit with browser automation

## Writing Tests

### Unit Test Guidelines

1. Test one thing at a time
2. Use descriptive test names
3. Test edge cases (null, empty arrays, negative numbers)
4. Test input validation
5. Use fixtures for complex data

### Integration Test Guidelines

1. Test component props
2. Test material/geometry creation
3. Test resource cleanup
4. Mock external dependencies
5. Test error boundaries

### Playwright Integration Test Guidelines

1. Test library public API, not full applications
2. Create minimal test scenarios programmatically
3. Take screenshots for visual verification
4. Test core functions work in browser environment
5. Test React components can be instantiated
6. Test across multiple browsers (Chromium, Firefox, WebKit)
7. Use Testomat.io tags for organization (@S1, @S2, @S3)

## Examples vs Tests

**Examples** (`examples/`) are for:

- Documentation
- Learning
- Demonstrating features
- Not for automated verification

**Tests** (`tests/`) are for:

- Automated verification
- Regression prevention
- CI/CD integration
- Not for human reading

Keep them separate!
