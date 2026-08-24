---
title: Repository structure
updated: 2026-08-23
status: current
domain: technical
---

# Strata Structure

This document clearly delineates the structure of Strata, separating examples, tests, and the public API.

## Directory Structure

```
strata/
├── src/                    # Source code
│   ├── core/              # Pure TypeScript algorithms (public API)
│   ├── presets/           # Organized game primitives (public API)
│   ├── components/        # React Three Fiber components (public API)
│   ├── shaders/          # GLSL shader code (public API)
│   ├── utils/            # Utility functions (public API)
│   └── index.ts          # Main export (public API)
│
├── examples/              # Documentation and demos (NOT tests)
│   ├── basic/            # Simple, single-feature examples
│   ├── advanced/         # Complex, multi-feature examples
│   └── comprehensive/    # Full game example
│
├── tests/                # Automated tests (NOT examples)
│   ├── unit/             # Unit tests for core functions
│   ├── integration/      # Integration tests for components
│   └── e2e/             # End-to-end Playwright tests
│
└── docs/                 # Documentation
    ├── PUBLIC_API.md    # Public API contract
    ├── API.md           # Complete API reference
    └── CONTRACT.md      # Developer contract
```

## Public API

**Location**: `src/` directory

**Definition**: [PUBLIC_API.md](./PUBLIC_API.md)

**What's Public**:
- All exports from `src/index.ts`
- All exports from subpath exports (`@jbcom/strata/core`, etc.)
- All types exported from public modules
- All functions documented in PUBLIC_API.md

**What's Internal**:
- Private functions (not exported)
- Internal helper functions
- Implementation details
- Test utilities

**Stability**:
- Public APIs follow semantic versioning
- Breaking changes only in major versions
- Deprecated APIs marked before removal

## Examples

**Location**: `examples/` directory

**Purpose**: Documentation and demos for developers

**Characteristics**:
- ✅ For humans to read and learn
- ✅ Show best practices
- ✅ Demonstrate features
- ✅ May have bugs (they're demos)
- ✅ Can be incomplete
- ✅ Not for automated verification

**Structure**:
- `basic/` - Simple, single-feature examples
- `advanced/` - Complex, multi-feature examples
- `comprehensive/` - Full game example

**See**: [examples/README.md](./examples/README.md)

## Tests

**Location**: `tests/` directory

**Purpose**: Automated verification of API contract

**Characteristics**:
- ✅ For machines to run
- ✅ Verify correctness
- ✅ Prevent regressions
- ✅ Must be correct
- ✅ Must be complete
- ✅ Part of CI/CD

**Structure**:
- `unit/` - Test core functions in isolation
- `integration/` - Test React components with Three.js
- `e2e/` - Test complete rendering in browsers

**See**: [tests/README.md](./tests/README.md)

## Clear Separation

| Aspect | Examples | Tests | Public API |
|--------|----------|-------|------------|
| **Location** | `examples/` | `tests/` | `src/` |
| **Purpose** | Documentation | Verification | Implementation |
| **Audience** | Developers | CI/CD | Developers |
| **Stability** | Can change | Must work | Versioned |
| **Correctness** | May have bugs | Must be correct | Must be correct |
| **Completeness** | Can be partial | Must be complete | Must be complete |
| **Automation** | Manual | Automated | N/A |

## Import Guidelines

### For Users

```ts
// ✅ Use public API
import { Water, createFurSystem } from '@jbcom/strata';
import { generateInstanceData } from '@jbcom/strata/core';
import { createCharacter } from '@jbcom/strata/presets';

// ❌ Don't import from tests or examples
import { something } from '@jbcom/strata/tests'; // Wrong!
import { something } from '@jbcom/strata/examples'; // Wrong!
```

### For Contributors

```ts
// ✅ Tests can import from src
import { sdSphere } from '../../src/core/sdf';

// ✅ Examples can import from src
import { Water } from '@jbcom/strata';

// ❌ Tests should not import from examples
import { something } from '../../examples'; // Wrong!

// ❌ Examples should not import from tests
import { something } from '../../tests'; // Wrong!
```

## Versioning

- **Public API** (`src/`): Follows semantic versioning
- **Examples** (`examples/`): Can change anytime (not versioned)
- **Tests** (`tests/`): Can change anytime (not versioned)

## Documentation

- **PUBLIC_API.md**: Defines what's public and stable
- **API.md**: Complete API reference with examples
- **CONTRACT.md**: Developer guarantees and versioning policy
- **examples/README.md**: How to use examples
- **tests/README.md**: How to write and run tests

## Summary

1. **Public API** (`src/`) - Stable, versioned, documented
2. **Examples** (`examples/`) - Documentation, can change
3. **Tests** (`tests/`) - Verification, must work

Keep them separate and clear!
