# Security Policy

## Project Overview

Strata is a procedural 3D graphics library for React Three Fiber. As a client-side rendering library, it runs entirely in the browser and does not process sensitive user data, authenticate users, or communicate with backend servers. However, we take security seriously and maintain this policy to ensure responsible disclosure and safe development practices.

## Supported Versions

The following versions of Strata are currently supported with security updates:

| Version | Supported          | Notes |
| ------- | ------------------ | ----- |
| 1.x.x   | :white_check_mark: | Current stable release |
| < 1.0   | :x:                | Pre-release, unsupported |

Security updates are applied to the latest minor version within each supported major version. We recommend always using the latest patch release.

## Reporting a Vulnerability

### Where to Report

To report a security vulnerability, please use one of the following methods:

1. **GitHub Security Advisory (Preferred)**: Create a private security advisory through [GitHub's Security tab](https://github.com/jbcom/strata/security/advisories/new). This allows for private discussion and coordinated disclosure.

2. **Email**: Contact the maintainer directly at [jon@jonbogaty.com](mailto:jon@jonbogaty.com) with the subject line "Strata Security Report".

### What to Include

Please provide as much of the following information as possible:

- Type of vulnerability (e.g., XSS, prototype pollution, denial of service)
- Affected component(s) and file paths
- Steps to reproduce the issue
- Proof of concept or exploit code (if available)
- Potential impact assessment
- Suggested fix (if you have one)

### Response Timeline

- **Acknowledgment**: Within 48 hours of receipt
- **Initial Assessment**: Within 7 days
- **Status Updates**: At least every 7 days until resolution
- **Resolution Target**: Within 90 days for accepted vulnerabilities

### What to Expect

**If the vulnerability is accepted:**
- We will work on a fix and coordinate the release timeline with you
- You will be credited in the security advisory (unless you prefer to remain anonymous)
- We will notify you when the fix is released
- For significant findings, we may offer acknowledgment in the project documentation

**If the vulnerability is declined:**
- We will provide a detailed explanation of our decision
- You may appeal the decision with additional information

## Security Model

### Client-Side Library

Strata is designed as a client-side graphics library with the following security characteristics:

- **No Backend Communication**: The library does not make network requests, except when loading user-provided assets (textures, audio)
- **No Authentication**: No user credentials or tokens are handled
- **No Sensitive Data**: No personal or financial data is processed
- **Browser Sandbox**: All code runs within the browser's security sandbox

### Asset Loading

When loading external assets (textures, audio files), the library:

- Uses standard browser APIs (`THREE.TextureLoader`, Howler.js)
- Respects browser CORS policies
- Validates file paths as non-empty strings
- Does not execute or parse asset content as code

### Local Storage

The state persistence module (`WebPersistenceAdapter`) uses browser `localStorage` for game save data:

- Only stores serialized JSON data via `JSON.stringify()`/`JSON.parse()`
- Uses prefixed keys to avoid collisions
- Gracefully handles unavailability (Safari private mode, sandboxed iframes)
- Does not store sensitive information

### WebGL/Shader Security

GLSL shaders in Strata:

- Are compiled by the browser's WebGL implementation
- Run in GPU sandbox with limited system access
- Do not access file system, network, or other browser APIs
- Are static strings, not dynamically generated from user input

## AI-Assisted Development

### Overview

This project extensively utilizes AI assistants for development, code review, and maintenance. We believe in transparency about AI involvement and have implemented safeguards to ensure code quality and security.

### AI Agents in Use

The following AI agents assist with this project:

| Agent | Primary Role | Trigger |
|-------|--------------|---------|
| **Claude** | Architecture review, code review, interactive assistance | `@claude` mention |
| **Amazon Q** | Security scanning, AWS best practices | `/q review` |
| **Gemini Code Assist** | Code quality, suggestions | `/gemini review` |
| **GitHub Copilot** | Code suggestions, PR reviews | `@copilot` |
| **Cursor** | Refactoring, code generation | `@cursor` |

### AI Security Safeguards

1. **Access Controls**: Interactive AI features are restricted to trusted users (repository owner, members, collaborators) to prevent prompt injection attacks via malicious comments.

2. **Multi-Agent Review**: Critical changes receive review from multiple AI agents, reducing single-point-of-failure risks.

3. **Human Oversight**: All AI-generated code is subject to human review before merging. Maintainers have final approval authority.

4. **Audit Trail**: All AI interactions are logged in PR comments and CI logs for accountability.

5. **Limited Permissions**: AI agents operate with minimal required permissions and cannot:
   - Access secrets directly
   - Push to protected branches without review
   - Modify repository settings

### AI-Generated Code Disclaimers

- AI-generated code may contain subtle bugs or security issues
- All AI suggestions should be reviewed for correctness and security
- The maintainers are responsible for validating AI contributions
- AI agents may hallucinate non-existent APIs or patterns

### Reporting AI-Related Concerns

If you believe AI-generated code has introduced a security vulnerability or if you observe concerning AI behavior (prompt injection, data leakage, etc.), please report it using the vulnerability reporting process above.

## Automated Security Scanning

### CodeQL Analysis

All pull requests undergo CodeQL security analysis scanning for:

- JavaScript/TypeScript vulnerabilities
- GitHub Actions security issues
- Python security issues (for tooling)

CodeQL must pass before PRs can be merged. See `.github/workflows/` for configuration.

### Dependency Scanning

- Dependencies are managed via pnpm with lockfile
- Dependabot alerts are enabled for vulnerable dependencies
- Regular dependency updates are reviewed and tested

### CI Security Checks

The CI pipeline enforces:

- All tests must pass (`pnpm run test`)
- Linting rules via Biome (`pnpm run lint`)
- Type checking via TypeScript strict mode
- CodeQL security scanning

## Dependency Security

### Core Dependencies

| Package | Purpose | Security Notes |
|---------|---------|----------------|
| `three` | 3D graphics | Browser WebGL API, sandboxed |
| `@react-three/fiber` | React bindings | Declarative, no raw DOM |
| `howler` | Audio playback | Uses Web Audio API |
| `zustand` | State management | Pure JavaScript, no network |
| `yuka` | Game AI | Pure mathematics, deterministic |

### Security-Sensitive Dependencies

- **immer**: Used for immutable state updates; kept updated for prototype pollution fixes
- **xstate**: State machines; no known security concerns

### Updating Dependencies

```bash
# Check for vulnerabilities
pnpm audit

# Update dependencies
pnpm update

# Check for outdated packages
pnpm outdated
```

## Secure Development Practices

### Code Standards

- **TypeScript Strict Mode**: Catches type-related bugs at compile time
- **No `eval()` or `innerHTML`**: Dynamic code execution is prohibited
- **Input Validation**: All public APIs validate inputs
- **Pure Functions**: Core algorithms are side-effect free

### Review Process

1. All changes require PR review
2. AI agents provide initial code review
3. Human maintainer approval required for merge
4. Security-sensitive changes require additional scrutiny

### What We Check For

- Division by zero vulnerabilities
- Null/undefined access
- Array out-of-bounds access
- Prototype pollution
- Race conditions
- Resource leaks (GPU memory, event listeners)

## Known Limitations

### Out of Scope

The following are considered out of scope for security vulnerabilities:

1. **Client-Side DoS**: Deliberate creation of infinite loops or GPU-intensive operations (users control their own browser)
2. **Asset Content**: Malicious content in user-provided textures/audio (browser handles these)
3. **Browser Bugs**: Vulnerabilities in browser WebGL implementations
4. **Upstream Dependencies**: Report these to the respective projects

### Accepted Risks

- **Local Storage**: Save data is not encrypted (game state is not sensitive)
- **Console Logging**: Debug information may be logged in development builds
- **GPU Access**: Required for 3D rendering functionality

## Security Contacts

- **Primary**: Jon Bogaty ([@jbcom](https://github.com/jbcom))
- **Security Advisories**: [GitHub Security Tab](https://github.com/jbcom/strata/security)

## Changelog

| Date | Change |
|------|--------|
| 2025-12-12 | Initial comprehensive security policy |
| 2025-12-12 | Added AI-assisted development section |
| 2025-12-12 | Added automated scanning documentation |

---

*This security policy follows industry best practices and is reviewed periodically. Last review: December 2025.*
