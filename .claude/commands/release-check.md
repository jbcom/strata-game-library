Run pre-release validation for the Strata game library.

Scope: "$ARGUMENTS" (use "all" for full check, or specify a package name)

## Pre-Release Checklist

### 1. Clean Working Tree

```bash
git status
```

Ensure no uncommitted changes. All work should be committed and pushed.

### 2. Full Build

```bash
pnpm run build
```

All packages must build cleanly with zero errors.

### 3. Full Test Suite

```bash
pnpm run test
```

All tests must pass. Note total test count and any skipped tests.

### 4. Lint

```bash
pnpm run lint
```

Zero lint violations.

### 5. Type Checking

```bash
pnpm run typecheck
```

Zero type errors across all packages.

### 6. Version Consistency

Check `.release-please-manifest.json` matches package.json versions:

For each package, verify:

- `package.json` version matches manifest
- CHANGELOG.md exists and has entries for current version
- No version conflicts between dependent packages

### 7. Dependency Audit

```bash
pnpm audit
```

Check for known vulnerabilities. Document any that are acceptable.

### 8. Package Exports

For each package to be published, verify:

- `package.json` has correct `main`, `module`, `types`, `exports` fields
- Built output exists at the paths specified in exports map
- TypeScript declarations are generated

### 9. npm Publish Dry Run

```bash
pnpm publish --dry-run --access public
```

For each publishable package, verify:

- Package name is correct (`@strata-game-library/[name]`)
- Files included are correct (no test files, no source maps in production)
- Package size is reasonable

### 10. CI Status

```bash
gh run list --limit 5
```

Verify latest CI run on main is green.

### 11. Release-Please Config

Check `release-please-config.json`:

- All packages are listed
- Release types are correct
- Changelog sections are configured

### 12. npm OIDC Trusted Publishing

For packages already on npm, verify trusted publisher config:

- Repository: `jbcom/strata-game-library`
- Workflow: `release.yml`
- Environment: (none required)

Packages NOT yet on npm need initial manual publish before OIDC works.

## Report Format

```markdown
## Release Readiness: [scope]

| Check | Status | Notes |
|-------|--------|-------|
| Clean tree | PASS/FAIL | |
| Build | PASS/FAIL | |
| Tests | PASS/FAIL | [count] tests |
| Lint | PASS/FAIL | |
| Typecheck | PASS/FAIL | |
| Versions | PASS/FAIL | |
| Dependencies | PASS/FAIL | [vuln count] |
| Exports | PASS/FAIL | |
| Dry run | PASS/FAIL | |
| CI | PASS/FAIL | |
| Release config | PASS/FAIL | |
| OIDC | PASS/FAIL | |

### Blockers
- [ ] Blocker description

### Warnings
- [ ] Warning description

### Ready to Release
YES/NO - [summary]
```
