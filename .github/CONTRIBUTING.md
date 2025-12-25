# Contributing to Strata

Thank you for your interest in contributing to Strata! This guide will help you get started.

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm 9+

### Setup

```bash
# Clone the repository
git clone https://github.com/jbcom/nodejs-strata.git
cd strata

# Install dependencies
pnpm install

# Build the library
pnpm run build

# Run tests
pnpm run test
```

## Development Workflow

### 1. Find or Create an Issue

Before starting work, check if an issue exists for what you want to work on. If not, create one describing your proposal.

### 2. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 3. Make Your Changes

Follow the project structure and code style guidelines below.

### 4. Test Your Changes

```bash
# Run unit tests
pnpm run test

# Run integration tests
pnpm run test:integration

# Run E2E tests
pnpm run test:e2e

# Run all tests
pnpm run test:all
```

### 5. Lint and Format

```bash
# Lint code
pnpm run lint

# Fix lint issues
pnpm run lint:fix

# Format code
pnpm run format

# Check formatting
pnpm run format:check

# Run all checks and fixes
pnpm run check:fix
```

### 6. Commit Your Changes

We use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Features (minor version bump)
git commit -m "feat(terrain): add new erosion algorithm"

# Bug fixes (patch version bump)
git commit -m "fix(water): correct reflection calculations"

# Refactoring (patch version bump)
git commit -m "refactor(shaders): optimize cloud rendering"

# Documentation (no version change)
git commit -m "docs: update API documentation"

# Tests (no version change)
git commit -m "test: add unit tests for pathfinding"
```

### 7. Push and Create a Pull Request

```bash
git push origin your-branch-name
```

Then create a PR on GitHub. Your PR will be automatically reviewed by `@agentic/triage` CLI.

## Project Structure

```
src/
├── core/           # Pure TypeScript algorithms (NO React)
│   ├── terrain/
│   ├── water/
│   └── ...
├── components/     # React Three Fiber components
│   ├── Terrain.tsx
│   ├── Water.tsx
│   └── ...
├── shaders/        # GLSL shaders (use /* glsl */ template literals)
│   ├── water.ts
│   ├── terrain.ts
│   └── ...
├── presets/        # Ready-to-use configurations
│   ├── background/
│   ├── midground/
│   └── foreground/
├── hooks/          # React hooks
├── utils/          # Utility functions
└── __tests__/      # Unit tests
```

### Architecture Principles

1. **Core algorithms are pure TypeScript** - No React dependencies in `src/core/`
2. **Components wrap core** - React components in `src/components/` use core algorithms
3. **Shaders are separate** - GLSL code lives in `src/shaders/`
4. **Presets are configurations** - Pre-built setups in `src/presets/`

## Code Style

### TypeScript

- Use strict TypeScript
- All public APIs must have JSDoc comments
- Prefer interfaces over types for object shapes
- Use `readonly` for immutable properties
- Avoid `any` - use proper types or `unknown`

```typescript
// Good
interface TerrainOptions {
  readonly size: number;
  readonly resolution: number;
  readonly seed?: number;
}

/**
 * Generates terrain mesh using marching cubes algorithm.
 * @param options - Terrain generation options
 * @returns THREE.BufferGeometry with terrain mesh
 */
export function generateTerrain(options: TerrainOptions): THREE.BufferGeometry {
  // Implementation
}

// Bad
export function generateTerrain(options: any) {
  // No types, no docs
}
```

### React Components

- Functional components only
- Use React.forwardRef for ref forwarding
- Props interfaces should be named `{ComponentName}Props`
- Clean up resources in useEffect

```typescript
// Good
interface TerrainProps {
  size?: number;
  resolution?: number;
  onGenerated?: (geometry: THREE.BufferGeometry) => void;
}

export const Terrain = React.forwardRef<THREE.Mesh, TerrainProps>(
  ({ size = 100, resolution = 128, onGenerated }, ref) => {
    useEffect(() => {
      // Setup
      return () => {
        // Cleanup
      };
    }, []);

    return <mesh ref={ref}>{/* ... */}</mesh>;
  }
);
```

### Shaders

- Use `/* glsl */` template literal tag for syntax highlighting
- Export as `{name}VertexShader` and `{name}FragmentShader`
- Include comments for complex shader logic

```typescript
export const waterVertexShader = /* glsl */ `
  uniform float time;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 pos = position;
    // Wave calculation
    pos.z += sin(pos.x * 2.0 + time) * 0.1;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;
```

## Testing Guidelines

### Unit Tests

- Test pure functions and algorithms
- Use Vitest as the test runner
- Place tests in `src/__tests__/` or `src/core/**/__tests__/`
- Aim for high coverage of public APIs

```typescript
import { describe, it, expect } from 'vitest';
import { generateTerrain } from '../core/terrain';

describe('generateTerrain', () => {
  it('should generate terrain with specified size', () => {
    const geometry = generateTerrain({ size: 100, resolution: 64 });
    expect(geometry).toBeDefined();
    expect(geometry.attributes.position).toBeDefined();
  });

  it('should handle invalid input', () => {
    expect(() => generateTerrain({ size: -1, resolution: 64 })).toThrow();
  });
});
```

### Integration Tests

- Test component interactions
- Use `@testing-library/react`
- Place tests in `tests/integration/`

### E2E Tests

- Test full user workflows
- Use Playwright
- Place tests in `tests/e2e/`

## Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/) for automatic versioning:

### Types

- `feat`: New feature (minor version bump)
- `fix`: Bug fix (patch version bump)
- `refactor`: Code refactoring (patch version bump)
- `perf`: Performance improvement (patch version bump)
- `docs`: Documentation only (no version change)
- `test`: Test only (no version change)
- `chore`: Build/tooling changes (no version change)
- `style`: Code style changes (no version change)

### Scopes

Use the component or area being changed:

- `terrain`, `water`, `vegetation`, `character`, `sky`, `fur`
- `shaders`, `core`, `components`, `presets`, `hooks`
- `ci`, `build`, `docs`

### Examples

```bash
feat(terrain): add hydraulic erosion algorithm
fix(water): correct caustics rendering in shallow areas
refactor(shaders): extract common noise functions
perf(vegetation): optimize GPU instancing for grass
docs(api): add examples for Water component
test(core): add unit tests for pathfinding
```

### Breaking Changes

If your change breaks the public API, add `BREAKING CHANGE:` in the commit body:

```bash
feat(terrain)!: change terrain generation API

BREAKING CHANGE: generateTerrain now requires options object instead of individual parameters
```

This triggers a major version bump.

## Labels Reference

Our issue and PR labels:

| Label | Description |
|-------|-------------|
| `bug` | Something isn't working |
| `enhancement` | New feature or request |
| `documentation` | Documentation improvements |
| `performance` | Performance improvements |
| `shader` | Shader-related changes |
| `physics` | Physics system changes |
| `audio` | Audio system changes |
| `good-first-issue` | Good for newcomers |
| `help-wanted` | Extra attention needed |
| `needs-triage` | Needs initial assessment |
| `needs-planning` | Needs project plan |
| `needs-tests` | Needs test coverage |
| `ready-for-aider` | Ready for AI development |
| `automated-pr` | PR created by automation |
| `dependencies` | Dependency updates |

## Pull Request Process

1. **Create PR** - Fill out the PR template with all required information
2. **Automated Review** - `@agentic/triage` CLI will automatically review your PR
3. **Address Feedback** - Respond to review comments and make changes
4. **Tests Pass** - Ensure all CI checks pass
5. **Approval** - Wait for maintainer approval
6. **Merge** - Maintainer will merge when ready

## Code of Conduct

Be respectful and inclusive. See [CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md) for details.

## Questions?

- 📚 Check the [documentation](https://github.com/jbcom/nodejs-strata/tree/main/docs)
- 💬 Start a [discussion](https://github.com/jbcom/nodejs-strata/discussions)
- 🐛 Report a [bug](https://github.com/jbcom/nodejs-strata/issues/new?template=bug_report.md)
- ✨ Request a [feature](https://github.com/jbcom/nodejs-strata/issues/new?template=feature_request.md)

Thank you for contributing to Strata! 🎮✨
