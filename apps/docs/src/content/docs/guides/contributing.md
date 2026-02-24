---
title: Contributing
description: How to contribute to Strata
---

# Contributing to Strata

Thank you for your interest in contributing to Strata!

## Getting Started

### 1. Fork and Clone

```bash
# Fork via GitHub UI, then:
git clone https://github.com/YOUR_USERNAME/core.git
cd core
pnpm install
```

### 2. Create a Branch

```bash
git checkout -b feature/my-feature
# or
git checkout -b fix/my-fix
```

### 3. Make Changes

Follow the coding standards in STANDARDS.md.

### 4. Test

```bash
pnpm test
pnpm lint
```

### 5. Submit PR

Push your branch and create a pull request.

## Repository Structure

| Repository | Purpose |
|------------|---------|
| `core` | Main library |
| `shaders` | GLSL shaders |
| `presets` | Preset configurations |
| `examples` | Example applications |
| `react-native-plugin` | React Native plugin |
| `capacitor-plugin` | Capacitor plugin |
| `strata-game-library.github.io` | Documentation (this site) |

## Development Setup

### Core Library

```bash
cd core
pnpm install
pnpm dev  # Watch mode
pnpm test # Run tests
```

### Documentation

```bash
cd strata-game-library.github.io
pnpm install
pnpm dev  # Dev server at localhost:4321
```

## Code Style

- Use TypeScript strict mode
- Follow existing patterns
- Add JSDoc comments for public APIs
- Write tests for new features

## Commit Messages

Use conventional commits:

```
feat: add new water caustics effect
fix: correct terrain LOD calculation
docs: update water API documentation
test: add vegetation wind tests
```

## Questions?

- Open an issue on GitHub
- Check existing issues and discussions

## Related

- [Architecture](/getting-started/architecture/)
- [API Reference](/api/)
