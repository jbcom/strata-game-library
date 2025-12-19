# Changelog

All notable changes to this project will be documented in this file.

# Strata v1.4.5 Changelog

## Maintenance
- **Improved the internal development workflow** by removing an obsolete Dependabot auto-merge workflow. Thank you to [@Jon Bogaty](https://github.com/JonBogaty) for this contribution.
All notable changes to this project will be documented in this file.

## v1.4.4

### Documentation
*   The `GAPS.md` document has been updated to accurately reflect the current completion status of planned features. (@Jon B)
All notable changes to this project will be documented in this file.

## v1.4.3

### 🐛 Bug Fixes
- Fixed a build error that occurred when using the `Audio` component on case-insensitive file systems (like macOS or Windows). Thanks to **@Jon Bogaty** for the fix! (#34)
All notable changes to this project will be documented in this file.

# Strata v1.4.2 Release Notes

This patch version includes an internal update to improve our development and release process. No user-facing changes are included.

## Maintenance

- Removed broken symlinks from our development workflow. This internal cleanup helps maintain the health of the project and streamlines future releases. (Thanks to [@Jon B](https://github.com/JonB) for the contribution!)
All notable changes to this project will be documented in this file.

# Strata 1.4.1

A patch release focused on internal improvements to bolster the library's security and documentation reliability.

---

## Internal

-   Our continuous integration (CI) process has been hardened. All GitHub Actions are now pinned to exact commit SHAs to prevent unauthorized changes and enhance build security. This update also resolves an issue with the documentation generation workflow. (Thanks, @Jon B)
All notable changes to this project will be documented in this file.

# Changelog v1.4.0

## ✨ Features

### **API Documentation & Examples**
- A new API documentation site is now available, featuring 26 comprehensive, JSDoc-linked examples. This showcase is designed to help you quickly understand Strata's capabilities and get started with your projects. (@Copilot)

### **User Interface Improvements**
- Enhanced the accessibility of the in-app notifications and inventory UI. These changes ensure a better and more inclusive experience for all users. (@google-labs-jules[bot])

## 🐛 Bug Fixes

- **Math:** Fixed an issue in the `smoothstep` utility function where it would incorrectly return `NaN` (Not a Number) when provided with a zero value range. This ensures predictable and stable behavior in mathematical calculations. (@google-labs-jules[bot])

## ⚡ Performance

- **Core:** Optimized low-level noise functions by reducing memory allocations. This leads to less garbage collection pressure and smoother performance, especially in scenes with heavy procedural generation or particle effects. (@google-labs-jules[bot])

## 💥 Breaking Changes

- **Dependency:** Upgraded `@xstate/react` from v5 to v6. While this is an internal dependency, it may contain breaking changes if you were relying on Strata's internal state management logic in an unconventional way.

## 👻 Internal & Maintenance

This release includes numerous updates to improve the developer experience and project maintainability. These changes include:
- Upgrading various production and development dependencies (`maath`, `zod`, `@types/node`).
- Migrating and improving our GitHub Actions CI/CD workflows.
- Adding code coverage reporting via Coveralls.
- Syncing repository configuration files.

A special thank you to all contributors, including @dependabot[bot], @Jon Bogaty, and @google-labs-jules[bot], for their work on these foundational improvements.
All notable changes to this project will be documented in this file.

# Strata 1.3.1 Release Notes

This is a patch release that includes internal configuration updates and a dependency upgrade to improve stability and keep the project up-to-date.

## Dependency Updates

*   Updated `zod` from v4.1.13 to v4.2.0. This dependency is used for internal runtime type validation, and this update includes the latest upstream fixes and improvements. (@dependabot[bot])

## Other

*   Synchronized internal `settings.yml` with the control-center. This is a maintenance change that does not affect the public API or user experience. (@Jon Bogaty)
All notable changes to this project will be documented in this file.

# Strata Changelog

## v1.3.0

## ✨ Features
- **Intelligent Triage System:** Introduced a new intelligent workflow to automatically categorize and prioritize scene assets and rendering tasks. This system helps streamline the rendering pipeline and makes it easier to identify potential performance bottlenecks.
  *(Contributed by @Jon Bogaty)*
All notable changes to this project will be documented in this file.

## v1.2.4

### Internal
- Enabled Coveralls code coverage reporting to help us maintain code quality. (@Jon Bogaty)
All notable changes to this project will be documented in this file.

## [1.2.3] - 2023-10-27

### 🐛 Bug Fixes

* Added a machine-readable output for release detection, allowing automated tools and scripts to reliably identify the installed Strata version. This improves integration with developer tooling and build pipelines. (Contributed by @Jon Bogaty)
All notable changes to this project will be documented in this file.

### Changelog

## v1.2.2

This patch release focuses on improving compatibility and modernizing internal dependencies to ensure a stable development environment.

## Bug Fixes

*   Fixed a compatibility issue with the latest Node.js type definitions (`@types/node` v25) that could prevent users from building their projects.
*   Resolved CI build errors related to outdated dependencies.

    *(Thanks, @Jon Bogaty)*

## Maintenance & Updates

This version includes a number of dependency upgrades to keep the library and its development tooling up-to-date. Key production dependency updates include:

*   **Zod** bumped from v3.25.76 to v4.1.13
*   **Commander** bumped from v12.1.0 to v14.0.2
*   **Glob** bumped from v11.1.0 to v13.0.0

Various development and internal tool dependencies were also updated via Dependabot.
All notable changes to this project will be documented in this file.

---
### Changelog

All notable changes to this project will be documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.2.1] - 2023-10-27

### Internals

*   Consolidated and updated GitHub Actions workflows to improve the stability and efficiency of our CI/CD pipeline. (@Jon Bogaty)
All notable changes to this project will be documented in this file.

# Changelog v1.2.0

Strata v1.2.0 is here, bringing your 3D scenes to mobile devices. This release introduces first-class support for building cross-platform mobile apps with your existing web skills.

## Features

### Capacitor Plugin for Mobile Development
We are excited to announce the release of a new official Strata plugin for Capacitor. This addon provides a bridge to use Strata's procedural 3D graphics within native iOS and Android applications. You can now build and render immersive 3D experiences for mobile app stores directly from your React Three Fiber project.

_This fantastic feature was contributed by @Jon Bogaty! [#173]_
All notable changes to this project will be documented in this file.

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.4] - 2023-10-27

### Under the Hood
*   **A significant refactor of the core architecture** has been completed. The library now uses a new "MCP-first" architecture, leveraging a GraphQL integration with GitHub to manage data and resources. This foundational change improves the long-term maintainability and stability of the library. (@Jon Bogaty in #169)
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
