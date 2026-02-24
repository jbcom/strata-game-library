# Strata Playwright Integration Tests

> **⚠️ Status: Temporarily Disabled**
>
> These tests are temporarily disabled in CI pending proper ES module bundling setup.
> The library has external dependencies (react, three, howler, etc.) that require a
> bundler like Vite or esbuild to resolve in browser environments.
>
> See: <https://github.com/jbcom/strata/issues/131>

This directory contains Playwright-based integration tests for the Strata library's public API.

## Purpose

These tests verify that Strata's public API works correctly in real browser environments:

- **Core API Functions**: SDF functions, noise, instancing algorithms
- **React Components**: Water, sky, instanced rendering, volumetrics
- **Presets**: Particles, billboards, decals, shadows, post-processing, reflections
- **Performance**: Ensure efficient handling of many instances

## Test Structure

```text
tests/integration-playwright/
├── README.md              # This file
├── fixtures/
│   └── test-server.html   # Base HTML page for tests
├── core-api.spec.ts       # Core algorithm tests (@S1)
├── components.spec.ts     # React component tests (@S2)
└── presets.spec.ts        # Preset API tests (@S3)
```

The Playwright configuration is at the project root: `playwright.config.ts`

## Running Tests

```bash
# Build the library first
pnpm run build

# Run all Playwright integration tests
pnpm run test:integration:playwright

# Run with UI mode (for development)
pnpm exec playwright test --ui

# Run specific test file
pnpm exec playwright test core-api.spec.ts

# Run specific browser
pnpm exec playwright test --project=chromium

# Debug mode
pnpm exec playwright test --debug
```

## Test Organization

Tests are organized using Testomat.io tags:

- `@S1` - Core API tests
  - `@S1.1` - SDF Functions
  - `@S1.2` - Instancing
  - `@S1.3` - Materials
- `@S2` - React Components
  - `@S2.1` - Water
  - `@S2.2` - Instanced Rendering
  - `@S2.3` - Sky
  - `@S2.4` - Performance
- `@S3` - Presets
  - `@S3.1` - Particle System
  - `@S3.2` - Billboard System
  - `@S3.3` - Decal System
  - `@S3.4` - Shadow System
  - `@S3.5` - Post-Processing
  - `@S3.6` - Reflection System

## Test Strategy

### Library Integration Tests vs E2E Tests

These are **library integration tests**, not end-to-end application tests:

- ✅ Test the Strata library's public API
- ✅ Test React components render correctly
- ✅ Test core functions work in browsers
- ✅ Capture screenshots for visual verification
- ❌ NOT testing full applications that use Strata
- ❌ NOT testing user flows or interactions
- ❌ NOT expecting specific UI with data-testid attributes

### What We Test

1. **Core Functions**: Verify SDF calculations, noise generation, instancing work in browser JavaScript environment
2. **React Components**: Verify components can be instantiated and render with React Three Fiber
3. **Materials**: Verify shader materials can be created with correct uniforms
4. **Performance**: Verify library can handle many instances efficiently
5. **Visual Output**: Capture screenshots to verify rendering output

## Reporters

Tests output to multiple formats:

1. **JUnit XML**: `test-results/junit.xml` for CI integration
2. **HTML Report**: `test-results/html/` for local viewing
3. **Screenshots**: `test-results/*.png` for visual verification
4. **Videos**: Captured on test failure for debugging

## CI Integration

In CI pipelines:

1. Build the library (`pnpm run build`)
2. Install Playwright browsers
3. Run Playwright integration tests
4. Upload test results and screenshots as artifacts
5. JUnit XML is available for Mergify merge protection

## Environment Variables

- `CI`: Automatically set by GitHub Actions, enables CI-specific behavior

## Development

### Adding New Tests

1. Create a new `.spec.ts` file or add to existing
2. Use appropriate Testomat.io tags (`@S1`, `@S2`, etc.)
3. Follow the pattern of loading React/Three.js dynamically
4. Capture screenshots for visual verification
5. Test actual library functionality, not mocks

### Test Server

Playwright's built-in `webServer` configuration automatically spins up a static file server using the `serve` package. This provides:

- Static file serving from project root
- Access to built library files (`/dist/*`)
- Test HTML pages (`/tests/integration-playwright/fixtures/*`)
- No custom server code to maintain

### Screenshot Guidelines

- Take screenshots at key verification points
- Use descriptive filenames: `water-component.png`, `instanced-grass.png`
- Screenshots are uploaded as CI artifacts
- Use for visual regression testing

## Debugging

```bash
# Run with browser UI visible
pnpm exec playwright test --headed

# Debug specific test
pnpm exec playwright test --debug core-api.spec.ts

# Generate trace
pnpm exec playwright test --trace on

# Show trace viewer
pnpm exec playwright show-trace trace.zip
```

## Differences from Previous E2E Tests

The previous E2E tests expected a full application server with:

- Specific routes (`/`, `/examples/comprehensive`)
- Data-testid attributes in rendered HTML
- Full user interaction flows

These new tests focus on the **library itself**:

- Test individual API functions and components
- Create minimal test scenarios programmatically
- Verify library works correctly in browsers
- No dependency on external applications

This approach is appropriate for a **library package**, not an application.

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Testomat.io](https://testomat.io/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [Strata Public API](../../PUBLIC_API.md)
