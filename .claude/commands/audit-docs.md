Audit documentation accuracy for the Strata game library.

Scope: "$ARGUMENTS" (use "all" for full audit, or specify a package/area)

## Pre-Audit

1. Read `CLAUDE.md` and `AGENTS.md` for project context
2. Read `PUBLIC_API.md` for the declared stable API
3. Read `CONTRACT.md` for stability guarantees

## Audit Steps

### 1. API Documentation vs Implementation

Compare `PUBLIC_API.md` entries against actual exports:

```bash
# Check what the package actually exports
pnpm nx run core:build
# Then inspect dist/index.d.ts or src/index.ts for actual exports
```

For each API listed in PUBLIC_API.md:

- Does the function/class/type actually exist?
- Does the signature match?
- Are the documented parameters accurate?
- Flag any "ghost APIs" (documented but not implemented)

### 2. README Accuracy

For each package README:

- Do the code examples actually work?
- Are import paths correct (`@strata-game-library/core`, not relative)?
- Are version-specific features noted?
- Do links resolve?

### 3. Architecture Docs

Check `docs/architecture/` documents:

- `GAME_FRAMEWORK_VISION.md` - does the implementation status match reality?
- `ROADMAP.md` - are phase completion percentages accurate?
- RFC documents - do they reflect current implementation state?

### 4. TypeDoc Accuracy

```bash
pnpm run docs
```

- Verify TypeDoc generates without errors
- Check that all packages appear in generated docs
- Verify category/module tags produce correct navigation

### 5. Docs Site (apps/docs)

- Check Starlight pages reference correct APIs
- Verify code examples compile
- Check for broken internal links

### 6. CHANGELOG

Verify `CHANGELOG.md` entries match actual releases and changes.

## Report Format

```markdown
## Documentation Audit: [scope]

### Ghost APIs (documented but missing)
- [ ] `functionName` in PUBLIC_API.md - not implemented

### Stale Documentation
- [ ] File: description of what's stale

### Broken Examples
- [ ] File:line - code example doesn't compile/work

### Broken Links
- [ ] File:line - link target doesn't exist

### Accuracy Issues
- [ ] File - description of inaccuracy

### Recommendations
- Priority fixes
- Docs that should be removed or archived
```
