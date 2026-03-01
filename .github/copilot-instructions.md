# GitHub Copilot Instructions -- Strata Game Library

> For comprehensive project reference, see [/AGENTS.md](/AGENTS.md).

## Strata-Specific Patterns

### Import Organization

```typescript
// 1. Node built-ins
import path from 'node:path';

// 2. External packages
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// 3. Workspace packages
import { createECS } from '@strata-game-library/core';
import { terrainShader } from '@strata-game-library/shaders/terrain';

// 4. Relative imports
import { helper } from './helper';
```

### Type Patterns

- Strict mode, no `any`
- Use proper interfaces from `@strata-game-library/core`
- ForwardRef pattern for R3F components
- Export types explicitly with `export type { ... }`

### The Core Rule

`packages/core/` is pure TypeScript -- NO React imports. All React components and hooks live in `adapters/r3f/`.

### Testing

- **Vitest**, not Jest
- `describe`/`it`/`expect` pattern
- Mock with `vi.mock()` and `vi.fn()`
- Import from `vitest`, not `@jest/globals`

### Linting

- **Biome**, not ESLint
- Run: `pnpm run lint` / `pnpm run lint:fix`

### Shaders

Use tagged template literals for GLSL:

```typescript
const shader = /* glsl */ `
  void main() { ... }
`;
```

## See Also

- [/AGENTS.md](/AGENTS.md) -- Primary project reference
- [/docs/AGENTS.md](/docs/AGENTS.md) -- Documentation architecture
