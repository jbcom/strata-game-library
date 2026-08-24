# Security Policy

## Supported versions

Security fixes are provided for the latest release line. Consumers should use the newest patch release available for their chosen package.

## Report a vulnerability privately

Do not disclose a suspected vulnerability in a public issue, discussion, or pull request.

Use [GitHub private vulnerability reporting](https://github.com/jbcom/strata-game-library/security/advisories/new) whenever possible. If GitHub is unavailable, email [jon@jonbogaty.com](mailto:jon@jonbogaty.com) with the subject `Strata security report`.

Include affected versions and entrypoints, reproduction steps, expected impact, and a minimal proof of concept when safe. You should receive acknowledgment within 48 hours, an initial assessment within seven days, and periodic updates during remediation. Coordinated disclosure and reporter credit are welcome.

## Security model

Strata is primarily a client-side game framework, but its packages include persistence, external asset loading, optional network-backed model generation, mobile bridges, audio, and release automation. Treat data and capabilities according to the entrypoint in use:

- Saved game data uses consumer-provided or browser persistence and is not encrypted by Strata. Applications must not store secrets in game state.
- External model, texture, audio, and configuration sources are untrusted input. Consumers remain responsible for origin policy, authorization, size limits, and content validation.
- GPU and procedural workloads can exhaust client resources when given extreme inputs. Public APIs should reject invalid values and document meaningful limits.
- Optional network and mobile plugins must keep credentials outside client bundles and repository source.
- Exported package behavior is a compatibility and supply-chain boundary. Releases validate packed files, exports, types, and clean installation before publication.

## Development and supply-chain controls

- Changes reach `main` through pull requests and merge commits.
- Trusted agents use upstream branches; arbitrary forks do not receive secrets or write-capable tokens.
- GitHub Actions use explicit least privilege, approved action sources, and immutable full commit SHAs.
- External forks require workflow approval and cannot modify control-plane files through the normal fork PR path.
- Stable CI and repository-policy gates are required after they have successfully reported.
- Dependency review blocks newly introduced high or critical known vulnerabilities.
- CodeQL scans JavaScript/TypeScript and GitHub Actions with the `security-and-quality` suite.
- Secret scanning, validity checks, non-provider patterns, AI detection, and push protection are enabled.
- Dependabot alerts, security updates, and grouped version updates are enabled.
- CodeRabbit and SonarQube Cloud provide independent review and static-analysis signals when their GitHub Apps are active.
- npm delivery uses a protected trusted workflow, OpenID Connect trusted publishing, and provenance; no npm token is available to pull-request workflows.

The detailed trust boundary and live configuration record are documented in [Agentic Development Security](docs/security/AGENTIC_DEVELOPMENT.md).

## Out of scope

Browser or GPU implementation vulnerabilities, malicious content deliberately loaded by an application, and denial of service caused solely by an application intentionally requesting unbounded work are generally upstream or consumer concerns. A Strata bug that bypasses documented validation, crosses a privilege boundary, leaks credentials, or creates an unexpected executable-code path remains in scope.
