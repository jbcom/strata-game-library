---
title: "StorageOptions"
---

[**@strata-game-library/capacitor**](../README.md)

***

[@strata-game-library/capacitor](../globals.md) / StorageOptions

# Interface: StorageOptions

Defined in: [definitions.ts:155](https://github.com/strata-game-library/capacitor-plugin/blob/7d2c239904967f5e2f1c1e041ccf5823aaa9683b/src/definitions.ts#L155)

Storage options for game save data.

## Properties

### namespace?

> `optional` **namespace**: `string`

Defined in: [definitions.ts:161](https://github.com/strata-game-library/capacitor-plugin/blob/7d2c239904967f5e2f1c1e041ccf5823aaa9683b/src/definitions.ts#L161)

Namespace prefix for all keys (e.g., 'mygame' -> 'strata:mygame:key').
Helps isolate game data from other localStorage usage.

#### Default

```ts
'strata'
```
