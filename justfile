# Strata Development Tasks
# Run `just` to see available commands
# Docs: https://just.systems/man/en/

# Default recipe - show help
default:
    @just --list

# ===========================================
# Setup & Installation
# ===========================================

# Install all dependencies
install:
    pnpm install

# Install pre-commit hooks
setup-hooks:
    uvx pre-commit install
    uvx pre-commit install --hook-type pre-push

# Full development setup
setup: install setup-hooks
    @echo "✅ Development environment ready"

# ===========================================
# Linting & Formatting
# ===========================================

# Run all linters (pre-commit)
lint:
    uvx pre-commit run --all-files

# Run actionlint on GitHub workflows
lint-actions:
    uvx actionlint .github/workflows/

# Run yamllint on YAML files
lint-yaml:
    uvx yamllint -c .yamllint.yaml .

# Run biome check on TypeScript/JavaScript
lint-ts:
    pnpm exec biome check packages/

# Run biome format check
format-check:
    pnpm exec biome format --check packages/

# Format all files with biome
format:
    pnpm exec biome format --write packages/
    pnpm exec biome check --write packages/

# TypeScript type checking
typecheck:
    pnpm run typecheck

# Run all checks (lint + typecheck)
check: lint typecheck

# ===========================================
# Building
# ===========================================

# Build all packages
build:
    pnpm run build

# Clean build artifacts
clean:
    pnpm run clean
    rm -rf dist

# Rebuild from scratch
rebuild: clean build

# ===========================================
# Testing
# ===========================================

# Run all tests
test:
    pnpm run test

# Run unit tests only
test-unit:
    pnpm run test:unit

# Run integration tests
test-integration:
    pnpm run test:integration

# Run E2E tests
test-e2e:
    pnpm run test:e2e

# Run tests with coverage
test-coverage:
    pnpm run test:coverage

# Run tests in watch mode
test-watch:
    pnpm run test:watch

# ===========================================
# Triage CLI
# ===========================================

# Run triage CLI command
triage *args:
    pnpm run triage -- {{args}}

# Assess an issue
assess issue:
    pnpm run triage -- assess {{issue}} --verbose

# Review a PR
review pr:
    pnpm run triage -- review {{pr}} --verbose

# Run cascade (plan only)
cascade-plan:
    pnpm run triage -- cascade --steps plan --verbose

# Run full cascade
cascade:
    pnpm run triage -- cascade --verbose

# ===========================================
# Documentation
# ===========================================

# Generate TypeDoc documentation
docs:
    pnpm run docs

# Serve documentation locally
docs-serve:
    pnpm run docs:dev

# ===========================================
# Release & CI
# ===========================================

# Validate workflow files
validate-workflows:
    uvx actionlint .github/workflows/

# Run pre-commit on staged files
pre-commit:
    uvx pre-commit run

# Run pre-commit on all files
pre-commit-all:
    uvx pre-commit run --all-files

# Update pre-commit hooks
pre-commit-update:
    uvx pre-commit autoupdate

# ===========================================
# Utilities
# ===========================================

# Show git status
status:
    git status -sb

# Show recent commits
log:
    git log --oneline -20

# Update dependencies
update:
    pnpm update
    uvx pre-commit autoupdate
