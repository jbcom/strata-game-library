Review the package "$ARGUMENTS" for completeness.

## Package Location Map

| Package | Location |
|---------|----------|
| core | packages/core |
| shaders | packages/shaders |
| presets | packages/presets |
| r3f | adapters/r3f |
| reactylon | adapters/reactylon |
| audio-synth | plugins/audio-synth |
| model-synth | plugins/model-synth |
| capacitor | plugins/capacitor |
| react-native | plugins/react-native |
| astro | plugins/astro |

## Checklist

### 1. Build

```bash
pnpm nx run $ARGUMENTS:build
```

Verify clean build with no errors or warnings.

### 2. Tests

```bash
pnpm nx run $ARGUMENTS:test
```

Verify all tests pass. Note test count and coverage.

### 3. Lint

```bash
pnpm nx run $ARGUMENTS:lint
```

Verify zero lint errors.

### 4. Type Checking

```bash
pnpm nx run $ARGUMENTS:typecheck
```

Verify zero type errors. Check for any `any` types in public APIs.

### 5. JSDoc Coverage

Check all exported symbols for JSDoc:

- Every exported function, class, interface, and type must have JSDoc
- Check for `@module` and `@category` tags on module-level docs
- Verify `@param`, `@returns`, and `@example` on public functions

### 6. README.md

Verify `README.md` exists in the package root and contains:

- Package description
- Installation instructions
- Basic usage examples
- API overview
- Link to full documentation

### 7. Package Metadata (package.json)

Verify these fields are accurate:

- `name` - matches `@strata-game-library/[name]`
- `version` - consistent with `.release-please-manifest.json`
- `description` - meaningful description
- `homepage` - points to `https://strata.game`
- `bugs.url` - points to GitHub issues
- `repository` - points to GitHub with correct directory
- `author` - "Jon Bogaty"
- `license` - correct license
- `keywords` - relevant keywords

### 8. Exports Map

Verify `package.json` exports map matches actual file structure:

- `"."` entry exists and points to correct files
- `"types"` condition resolves correctly
- `"import"` condition points to ESM build output
- No stale exports pointing to moved/deleted files

### 9. TypeDoc

Verify package is listed in `typedoc.json` entry points.

### 10. Dependencies

Check `package.json` dependencies:

- No unused dependencies
- No missing dependencies (imports without corresponding dependency)
- Internal deps use `workspace:*` protocol
- Peer dependencies are correctly specified

## Report Format

Summarize findings as:

```markdown
## Package Review: [name]

Build: PASS/FAIL
Tests: PASS/FAIL ([count] tests)
Lint: PASS/FAIL
Typecheck: PASS/FAIL
JSDoc: [coverage assessment]
README: PASS/FAIL
Metadata: PASS/FAIL
Exports: PASS/FAIL
TypeDoc: PASS/FAIL
Dependencies: PASS/FAIL

### Issues Found
- [ ] Issue description
- [ ] Issue description

### Recommendations
- Recommendation
```
