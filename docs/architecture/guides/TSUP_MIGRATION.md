# TypeScript Package Release: tsup Migration Guide

This guide documents how to migrate Strata packages from `tsc` to `tsup` for proper Node.js ESM support.

## Problem

Using `"moduleResolution": "bundler"` with plain `tsc` generates code that works with bundlers but **fails in pure Node.js ESM** because:

1. TypeScript doesn't add `.js` extensions to relative imports
2. Node.js ESM requires explicit extensions
3. Generated `.d.ts` files have the same issue

## Solution

Use **tsup** (powered by esbuild) to build packages with proper ESM output.

## Migration Steps

### 1. Install tsup

```bash
pnpm add -D tsup
```

### 2. Create tsup.config.ts

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  // Entry points matching package.json exports
  entry: {
    index: 'src/index.ts',
    // Add all subpath exports
    'core/index': 'src/core/index.ts',
    'components/index': 'src/components/index.ts',
    // ... etc
  },

  // ESM only (or ['esm', 'cjs'] for dual)
  format: ['esm'],

  // Generate .d.ts with correct extensions
  dts: true,

  // Clean before build
  clean: true,

  // Source maps
  sourcemap: true,

  // Don't split chunks
  splitting: false,

  // Target (match tsconfig)
  target: 'ES2022',

  // For React packages
  jsx: 'automatic',

  // External packages (don't bundle)
  external: [
    'react',
    'react-dom',
    'three',
    // ... all peer/external deps
  ],

  // Tree-shaking
  treeshake: true,

  // Don't minify (consumers can minify)
  minify: false,
});
```

### 3. Update package.json

```json
{
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch"
  }
}
```

### 4. Verify

```bash
# Build
pnpm run build

# Check with publint
npx publint

# Check with arethetypeswrong
npx @arethetypeswrong/cli --pack .
```

Expected output:
- `publint`: "All good!"
- `attw`: 🟢 for node16 (from ESM) and bundler

## Package-Specific Configs

### @strata-game-library/audio-synth

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'core/index': 'src/core/index.ts',
    'components/index': 'src/components/index.ts',
    'presets/index': 'src/presets/index.ts',
  },
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  target: 'ES2020',
  jsx: 'automatic',
  external: ['react', 'tone'],
});
```

### @strata-game-library/presets

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
  },
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  target: 'ES2022',
  external: ['@strata-game-library/core'],
});
```

### @strata-game-library/shaders

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'water/index': 'src/water/index.ts',
    'terrain/index': 'src/terrain/index.ts',
    // ... etc
  },
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  target: 'ES2022',
  // Shaders have no external deps
  external: [],
});
```

## Why tsup?

| Feature | tsc | tsup |
|---------|-----|------|
| ESM output | ❌ No extensions | ✅ Proper `.js` |
| Build speed | Slow | Fast (esbuild) |
| Tree-shaking | ❌ | ✅ |
| Multiple entry points | Manual | ✅ Built-in |
| Source maps | ✅ | ✅ |
| Declaration files | ✅ | ✅ |

## Validation Tools

```bash
# Check package with npx (no global installation needed)
npx publint             # Package.json validation
npx attw --pack .       # TypeScript resolution check
```

## Expected Results

After migration, `attw --pack .` should show:

```
node16 (from ESM): 🟢 (ESM)
bundler: 🟢
```

Note: `node10` (💀) and `node16 (from CJS)` (⚠️) warnings are expected for ESM-only packages.

## References

- [tsup documentation](https://tsup.egoist.dev/)
- [Are The Types Wrong?](https://arethetypeswrong.github.io/)
- [publint](https://publint.dev/)
- [GitHub Issue #128](https://github.com/strata-game-library/core/issues/128)
