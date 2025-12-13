# Changelog

All notable changes to this project will be documented in this file.

# 1.1.3

## Internal
- Updated internal development tooling and dependencies. This is a maintenance release and does not affect the public API or runtime behavior of the library.

*Contributor: @dependabot[bot]*
All notable changes to this project will be documented in this file.

***

## v1.1.2
*Release Date: 2023-10-27*

A small patch release focusing on internal improvements to ensure better long-term stability for the library.

## Internal

-   We have improved our internal testing suite to bolster the stability of future releases. This update involves the removal of flaky End-to-End (E2E) tests and the correction of unit test expectations, resulting in a more robust and reliable CI pipeline. (#126) (@Copilot)
All notable changes to this project will be documented in this file.

Of course! Here is a user-friendly changelog for version 1.1.1 based on the provided commit.

---

# Changelog

All notable changes to this project will be documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.1] - 2023-10-27

### 🏗️ Internal

* Improved the internal CI/CD workflow to enhance the stability of our release and build process. (contributed by @Jon Bogaty)
All notable changes to this project will be documented in this file.

# Strata 1.1.0 Release Notes

We're thrilled to announce the release of Strata 1.1.0! This version marks a major milestone, featuring a significant architectural reorganization, the launch of a comprehensive documentation site, and numerous improvements to our developer and CI workflows.

---

## ⚠️ Breaking Changes

This release includes a major architectural reorganization. Large portions of the library, previously held in an archive, have been extracted and integrated into the main codebase.

-   **Potential Import Path Changes**: While the primary public API remains stable, if you are importing from deeply nested or internal packages, your import paths may have changed. Please review and update your imports if necessary.

---

## ✨ Features

### Core Library Architecture & Module Extraction
The core of Strata has been restructured for clarity and maintainability. This large-scale effort brings all major systems into the main repository, providing a more unified development experience.

-   **Core Systems**: Introduced robust systems for Entity-Component-System (ECS) architecture, state management, animation state machines, pathfinding, rendering, audio, and gameplay interactions.
-   **React Integration**: Full suite of React Three Fiber components and custom hooks are now available, making it easier than ever to build interactive 3D scenes.
-   **Procedural Tooling**: Powerful GLSL shader system, math utilities, and geometry/procedural generation systems have been integrated.
-   **Developer Tools & Presets**: Extracted debug tools and a collection of preset configurations to accelerate development.
-   **Unified API**: A clean, unified export structure is now in place, simplifying imports and access to all library features.

---

## 📚 Documentation

We now have a comprehensive and official documentation site to help you get started and master Strata.

-   **Getting Started Guides**: New `Installation` and `Quickstart` guides to get you up and running in minutes.
-   **Full API Reference**: Complete, generated API documentation is now available for exploration.
-   **Contributing Guidelines**: Clear instructions for anyone who wants to contribute to the Strata project.

---

## 🛠️ Internal & Developer Experience

Significant improvements have been made to the project's internal workflows and community standards.

-   **Automated Workflows**: Implemented AI-powered triage and automation for issue-to-PR conversion, streamlining our contribution process.
-   **Enhanced CI/CD**: Integrated Mergify for smarter merging and added CI insights for our Playwright E2E test suite.
-   **Community Standards**: Added a Contributor Covenant Code of Conduct and a formal Security Policy to ensure a safe and welcoming environment for all contributors.
-   **Improved Issue Templates**: Updated and comprehensive issue templates have been added to help you report bugs and request features more effectively.

---

## 🐛 Bug Fixes

-   Fixed a CI issue where `pnpm` could fail to determine its global store path if a specific shell was not available, ensuring more reliable builds.

---

## 🤝 Contributors

A huge thank you to the contributors who made this release possible:

-   **@Jon Bogaty**
-   **@Copilot**
# 1.0.0 (2025-12-08)


### Bug Fixes

* **ci:** replace semantic-release custom action with standard npm authentication ([#5](https://github.com/jbcom/strata/issues/5)) ([f793f3e](https://github.com/jbcom/strata/commit/f793f3ee6597980f04d5407b1d4147e76bd56218))
* TypeScript errors and add Prettier + agent files ([#1](https://github.com/jbcom/strata/issues/1)) ([a946d48](https://github.com/jbcom/strata/commit/a946d481b238befe62cc452621ffef8caf6c382e))


### Features

* migrate strata from monorepo ([b8b9e5f](https://github.com/jbcom/strata/commit/b8b9e5f7c8ce3ab1000b0add36196aaed61859a6))
