# Changelog

## [0.3.0](https://github.com/jbcom/strata-game-library/compare/strata-game-library@0.2.0...strata-game-library@0.3.0) (2026-08-24)

### ⚠ BREAKING CHANGE

Strata now publishes one public, unscoped npm package: `strata-game-library`.
Install it with `pnpm add strata-game-library` and change imports such as
`@strata-game-library/core` to `strata-game-library/core`. Renderer adapters
remain opt-in subpath imports, for example `strata-game-library/adapters/r3f`.
The former `@strata-game-library/*` packages are no longer public release
artifacts. See the [umbrella package migration guide](https://strata.game/guides/umbrella-package-migration/).

### Features

* harden release pipeline and migrate docs ([300d85b](https://github.com/jbcom/strata-game-library/commit/300d85b25b8a95e4b25668c7042391a00645f274))
* harden release pipeline and migrate docs ([9e142b2](https://github.com/jbcom/strata-game-library/commit/9e142b2bc8e10c41f8d992ac7361b30d48b0d538))

### Bug Fixes

* **ci:** restore clean adapter and browser checks ([1835969](https://github.com/jbcom/strata-game-library/commit/1835969d9815d9794cc0a874083e6786f958464c))

### Refactoring

* finish export-star removal — last three r3f leaves, umbrella package ([37ccb0d](https://github.com/jbcom/strata-game-library/commit/37ccb0d60d3f1654f9f1c70e23bf4adf83cc6dfb))
* publish one package with opt-in adapters ([ee382b5](https://github.com/jbcom/strata-game-library/commit/ee382b542ce56b8c2523bc699127bf67859ebee6))
* replace export-star barrels with explicit named re-exports ([73dfa2c](https://github.com/jbcom/strata-game-library/commit/73dfa2c97eff4b719f5e5b545a187a0f6c526f87))
* **umbrella:** expand cross-package stars so the API gate can see them ([1d06596](https://github.com/jbcom/strata-game-library/commit/1d06596ae1e0cf51c6770f4c106ff4489158d1bc))

## [0.2.0](https://github.com/jbcom/strata-game-library/compare/strata-game-library@0.1.0...strata-game-library@0.2.0) (2026-04-22)

### Features

* consolidate composition runtime package ([ebef273](https://github.com/jbcom/strata-game-library/commit/ebef2733fbcf8fe38661acc6494233224c02a6e9))
