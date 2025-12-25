# Security Policy

## Supported Versions

We currently support the following versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability in Strata, please follow these steps:

### 1. Do Not Open a Public Issue

Please **do not** open a public GitHub issue for security vulnerabilities, as this could put users at risk.

### 2. Report Privately

Send details to: **<jon@jonbogaty.com>**

Include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### 3. Response Timeline

You can expect:

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity
  - Critical: 1-7 days
  - High: 7-30 days
  - Medium: 30-90 days
  - Low: Best effort

### 4. Disclosure Process

1. We'll confirm receipt of your report
2. We'll investigate and assess the issue
3. We'll develop and test a fix
4. We'll release a patch and publish a security advisory
5. We'll credit you in the advisory (unless you prefer to remain anonymous)

## Security Measures

Strata employs multiple layers of security:

### 1. GitHub Security Features

- **Dependabot**: Automatic dependency vulnerability scanning and updates
- **CodeQL Analysis**: Automated security scanning for code vulnerabilities
- **Secret Scanning**: Prevents accidental commit of secrets

### 2. Custom Security Scanner

Our custom `@agentic/triage` security scanner checks for:

- Division by zero vulnerabilities
- Array out-of-bounds access
- Null/undefined dereferences
- Race conditions
- Stale event references
- Resource leaks (Three.js objects not disposed)
- XSS vulnerabilities in user-facing code

### 3. Continuous Integration

All PRs automatically run:

- Unit tests
- Integration tests
- E2E tests
- Security scans
- Dependency reviews

### 4. Code Review

- All code changes require review
- Automated AI review via `@agentic/triage`
- Human review for significant changes

## Best Practices for Contributors

When contributing to Strata, please follow these security best practices:

### Input Validation

```typescript
// Good - validate inputs
function generateTerrain(size: number): THREE.BufferGeometry {
  if (size <= 0) {
    throw new Error('Size must be positive');
  }
  // ...
}

// Bad - no validation
function generateTerrain(size: number): THREE.BufferGeometry {
  // Potential for negative size or NaN
}
```

### Division by Zero

```typescript
// Good - check for zero
const result = divisor !== 0 ? value / divisor : 0;

// Bad - potential division by zero
const result = value / divisor;
```

### Array Bounds

```typescript
// Good - check bounds
const item = index >= 0 && index < array.length ? array[index] : undefined;

// Bad - no bounds check
const item = array[index];
```

### Null Safety

```typescript
// Good - optional chaining
const value = obj?.prop?.nested ?? defaultValue;

// Bad - can throw on null/undefined
const value = obj.prop.nested;
```

### Resource Cleanup

```typescript
// Good - cleanup in useEffect
useEffect(() => {
  const geometry = new THREE.BufferGeometry();
  const material = new THREE.Material();

  return () => {
    geometry.dispose();
    material.dispose();
  };
}, []);

// Bad - memory leak
useEffect(() => {
  const geometry = new THREE.BufferGeometry();
  const material = new THREE.Material();
  // No cleanup
}, []);
```

### Avoid Race Conditions

```typescript
// Good - capture values before async
const value = event.target.value;
setTimeout(() => {
  console.log(value);
}, 100);

// Bad - stale reference risk
setTimeout(() => {
  console.log(event.target.value);
}, 100);
```

## Known Security Considerations

### Three.js Resources

Three.js requires manual disposal of:

- Geometries
- Materials
- Textures
- Render targets

Always dispose of these in React cleanup functions.

### WebGL Context Loss

The library handles WebGL context loss, but complex scenes may need manual recovery logic.

### Performance DoS

Extremely high values for resolution, particle count, etc. can cause browser freezes. We validate inputs to prevent this.

## Security Updates

Security patches are released as needed. Monitor:

- [GitHub Security Advisories](https://github.com/jbcom/nodejs-strata/security/advisories)
- [Releases](https://github.com/jbcom/nodejs-strata/releases)
- [CHANGELOG.md](../CHANGELOG.md)

## Questions?

For non-security issues:

- Open a [bug report](https://github.com/jbcom/nodejs-strata/issues/new?template=bug_report.md)
- Start a [discussion](https://github.com/jbcom/nodejs-strata/discussions)

For security issues: **<jon@jonbogaty.com>**

Thank you for helping keep Strata secure! 🔒
