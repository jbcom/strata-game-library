Add a new shader named "$ARGUMENTS" to the shader library.

## Context

Read the existing shader patterns before creating files:

1. Look at `packages/shaders/src/water.ts` for the canonical shader pattern
2. Check `packages/shaders/src/types.ts` for the `IUniforms` interface
3. Read `packages/shaders/src/index.ts` for existing exports

## Steps

### 1. Determine Structure

Shaders in this project use `/* glsl */` template literal strings in TypeScript files.
Each shader file exports vertex and fragment shader strings plus a material factory function.

Check if this shader fits an existing domain or needs a new file:

- `terrain.ts` - terrain generation/rendering
- `water.ts` - water surfaces
- `sky.ts` - atmospheric/sky rendering
- `fur.ts` - fur/hair rendering
- `clouds.ts` - cloud rendering
- `volumetrics.ts` - volumetric effects
- `godRays.ts` - god ray effects
- `raymarching.ts` - raymarching utilities
- `instancing-wind.ts` - instanced vegetation with wind
- `materials/` - material shaders

### 2. Create Shader File

Create `packages/shaders/src/[name].ts`:

```typescript
import * as THREE from 'three';
import type { IUniforms } from './types.js';

/**
 * [Name] shader - [brief description]
 *
 * @module shaders/[name]
 */

export const [name]VertexShader = /* glsl */ `
  // Vertex shader GLSL code
`;

export const [name]FragmentShader = /* glsl */ `
  // Fragment shader GLSL code
`;

/** Uniform definitions for the [name] shader */
export interface [Name]Uniforms extends IUniforms {
  time: { value: number };
  // Add shader-specific uniforms
}

/** Default uniform values for the [name] shader */
export const [name]DefaultUniforms: [Name]Uniforms = {
  time: { value: 0 },
};

/**
 * Create a [name] material with the shader applied.
 *
 * @param options - Configuration options
 * @returns A configured ShaderMaterial
 */
export function create[Name]Material(
  options?: Partial<Record<string, unknown>>
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: [name]VertexShader,
    fragmentShader: [name]FragmentShader,
    uniforms: THREE.UniformsUtils.clone([name]DefaultUniforms),
    // Set additional material properties
  });
}
```

### 3. Add Type Definitions

If the shader introduces new uniform types, extend `packages/shaders/src/types.ts`.

### 4. Export from Index

Add exports to `packages/shaders/src/index.ts`:

```typescript
export {
  [name]VertexShader,
  [name]FragmentShader,
  create[Name]Material,
  [name]DefaultUniforms,
} from './[name].js';
export type { [Name]Uniforms } from './[name].js';
```

### 5. Create Test

Create `packages/shaders/tests/[name].test.ts`:

- Verify shader strings are non-empty and contain expected GLSL keywords
- Test material factory returns a valid `THREE.ShaderMaterial`
- Test default uniforms are correctly set
- Test custom options override defaults

### 6. Validate

```bash
pnpm nx run shaders:build
pnpm nx run shaders:test
pnpm nx run shaders:typecheck
```

## Conventions

- Always use `/* glsl */` template literals for syntax highlighting
- Import THREE types, not runtime objects, where possible
- Export both raw shader strings AND a material factory function
- All uniforms must have TypeScript type definitions
- Use `.js` extension in relative imports (ESM)
- Commit with: `feat(shaders): add [name] shader`
