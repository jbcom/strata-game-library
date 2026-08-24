---
title: Agentic development security
updated: 2026-08-24
status: current
domain: ops
---

# Agentic Development Security

This repository is designed for predominantly autonomous development without equating automation with trust. A passing automated policy, not a routine human approval, determines whether an ordinary trusted-agent pull request is mergeable.

## Trust classes

### Trusted upstream development

A trusted coding agent authenticates as a deliberately authorized collaborator or, preferably, a narrowly scoped GitHub App. It creates a branch in `jbcom/strata-game-library`, pushes commits to that branch, opens a pull request, responds to findings, merges `main` into its branch when strict checks require an update, and merges with GitHub's merge-commit method only after every required gate succeeds.

Trusted agents do not push directly to `main`, use administrative merge bypass, force-push shared branches, or receive broad credentials merely for convenience. Required human approvals are zero.

### Untrusted external contribution

Code, metadata, dependencies, workflows, artifacts, caches, branch names, commit messages, issue content, and PR content supplied by an arbitrary fork are untrusted. Fork CI runs on GitHub-hosted ephemeral runners with a read-only token and no repository or environment secrets. GitHub requires workflow approval for every external contributor.

The base-branch `Repository Policy / gate` uses `pull_request_target` only as a non-executing control plane. It does not check out or run PR code, install PR dependencies, or consume PR artifacts or caches. It obtains the changed-file list from GitHub's API and rejects fork changes to:

- `.github/workflows/**` and `.github/actions/**`;
- `.github/dependabot.yml` and `.github/settings.yml`;
- `.coderabbit.yaml` and `sonar-project.properties`;
- release-please configuration and manifest files.

Trusted upstream branches may maintain those files through the same ordinary PR process.

## Stable merge gates

The protected-branch contract intentionally uses a small set of stable names:

- `CI / gate` aggregates runtime compatibility, lint, typecheck, tests, build, API contract, packed-package consumption, docs, browser integration, Conventional PR title, and dependency review.
- `Repository Policy / gate` protects the control plane without executing proposed code.
- Independent CodeRabbit and SonarQube Cloud gates are added to the ruleset only after each GitHub App has produced its real successful check name for this repository.

CodeQL remains a strong native scanner, but is not a universal required check because GitHub's default setup excludes public-fork PRs and an advanced setup may still be withheld by the external-contributor workflow approval boundary.

## Merge and history policy

The repository permits merge commits and disables squash and rebase merging. The `main-integrity` ruleset requires pull requests, prohibits deletion and non-fast-forward updates, uses strict required checks, requires zero approvals, does not require code-owner or last-pusher approval, does not require conversation resolution, has no routine bypass actors, and does not require linear history.

Agents update established branches by merging `main`; they do not rebase or rewrite shared history. Auto-merge uses merge-commit semantics.

## Workflow privilege boundaries

Repository Actions defaults are read-only and cannot approve pull requests. Each workflow declares explicit permissions. Only trusted workflows elevate them:

- release-please receives `contents: write` and `pull-requests: write` on `main`;
- npm publication receives `id-token: write` in the `npm` environment after a GitHub release exists;
- Pages deployment receives `pages: write` and `id-token: write` in `github-pages` after a GitHub release exists;
- the trusted automation queue receives pull-request and contents write access but never checks out or executes PR code.

Every external action is pinned to a verified 40-character commit SHA. Repository policy allows GitHub-owned actions plus the specifically vetted pnpm setup and release-please actions, and GitHub's full-SHA enforcement is enabled.

## Security services

GitHub dependency graph and alerts, Dependabot security updates, grouped version updates, secret scanning, non-provider patterns, validity checks, AI secret detection, push protection, private vulnerability reporting, dependency review, and CodeQL are enabled for this public repository.

CodeRabbit's repository policy is assertive and incremental. It enables GitHub Checks, request-changes automation, actionlint, zizmor, Biome, and secret scanners. Deterministic pre-merge checks cover hardcoded credentials, sensitive-data logging, unsafe Actions, and undeclared public API breaks. Organization Global Overrides should enforce the same non-negotiable minimum so a repository-local PR cannot weaken the baseline used to review itself.

SonarQube Cloud is bound as `jbcom_strata-game-library` and should use its maintained `Sonar way` gate on new code. Automatic GitHub analysis is preferred because it is independent of PR-controlled workflow code and does not expose a Sonar token to forks. Coverage is not invented as a merge condition when the selected analysis mode cannot import it.

## Original-state record

The live audit on 2026-08-24 found:

| Area | Original state |
| --- | --- |
| Repository ownership | Public organization repository `jbcom/strata-game-library`; default branch `main` |
| Merge methods | Merge, squash, and rebase all enabled; branch deletion after merge enabled |
| Protection | No legacy `main` branch protection and no repository rulesets |
| Actions token | Default read-only, but Actions could approve PRs |
| Fork workflow policy | Approval only for first-time contributors |
| Action policy | All actions allowed; immutable-SHA enforcement disabled |
| Security features | Secret scanning and push protection enabled; Dependabot security updates disabled; private vulnerability reporting enabled |
| Findings | 100 or more open Dependabot alerts, 11 open secret-scanning alerts, and 35 open code-scanning alerts |
| CodeQL | Advanced workflow active for JavaScript/TypeScript and Actions; default setup not configured |
| SonarQube Cloud | Project bound but last analysis was 2026-02-24; `Sonar way` failed only because stale CI reported 0% new-code coverage against an 80% condition |
| CodeRabbit | No repository configuration and no successful CodeRabbit check observed |
| Deployments | `github-pages` existed with a `main` branch policy and verified `strata.game` custom domain |
| Legacy automation | Four secret-bearing AI workflows depended on an unreachable floating reusable workflow and had failed repeatedly; they were removed in favor of scoped external agents and independent review Apps |

Rulesets and required external checks are applied in deployment order: first make the workflow or App report successfully, then bind the observed check to `main-integrity`. This avoids creating an unsatisfiable merge policy.
