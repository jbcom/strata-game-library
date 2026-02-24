---
title: "HapticsOptions"
---

[**@strata-game-library/capacitor-plugin**](../README.md)

***

[@strata-game-library/capacitor-plugin](../globals.md) / HapticsOptions

# Interface: HapticsOptions

Defined in: [definitions.ts:75](https://github.com/strata-game-library/capacitor-plugin/blob/7d2c239904967f5e2f1c1e041ccf5823aaa9683b/src/definitions.ts#L75)

Unified haptics options supporting multiple vibration modes.

## Examples

```ts
// Preset intensity
await triggerHaptics({ intensity: 'medium' });
```

```ts
// Custom intensity with duration
await triggerHaptics({ customIntensity: 0.7, duration: 30 });
```

```ts
// Pattern (Android/Web only)
await triggerHaptics({ pattern: [100, 50, 100, 50, 100] });
```

## Properties

### customIntensity?

> `optional` **customIntensity**: `number`

Defined in: [definitions.ts:93](https://github.com/strata-game-library/capacitor-plugin/blob/7d2c239904967f5e2f1c1e041ccf5823aaa9683b/src/definitions.ts#L93)

Custom intensity (0-1) for fine-grained control.
If specified, takes precedence over intensity preset.
Note: iOS will round to nearest preset (light/medium/heavy).

#### Minimum

0

#### Maximum

1

***

### duration?

> `optional` **duration**: `number`

Defined in: [definitions.ts:99](https://github.com/strata-game-library/capacitor-plugin/blob/7d2c239904967f5e2f1c1e041ccf5823aaa9683b/src/definitions.ts#L99)

Duration in milliseconds.
Note: iOS ignores this parameter (uses system default ~10ms).

#### Default

```ts
Based on intensity (light=10, medium=25, heavy=50)
```

***

### intensity?

> `optional` **intensity**: `"light"` \| `"medium"` \| `"heavy"`

Defined in: [definitions.ts:85](https://github.com/strata-game-library/capacitor-plugin/blob/7d2c239904967f5e2f1c1e041ccf5823aaa9683b/src/definitions.ts#L85)

Preset intensity level (recommended for consistency across platforms).
Maps to platform-specific intensities:

- iOS: UIImpactFeedbackGenerator.light/medium/heavy
- Android: Amplitude 50/150/255
- Web: Duration 10/25/50ms (or gamepad magnitude 0.25/0.5/1.0)

Optional when customIntensity or pattern is provided; defaults to 'medium'.

***

### pattern?

> `optional` **pattern**: `number`[]

Defined in: [definitions.ts:108](https://github.com/strata-game-library/capacitor-plugin/blob/7d2c239904967f5e2f1c1e041ccf5823aaa9683b/src/definitions.ts#L108)

Vibration pattern: [vibrate, pause, vibrate, pause, ...] in milliseconds.
When specified, overrides duration and intensity.
Note: Not supported on iOS. Android supports patterns.
Web: Uses Navigator.vibrate() pattern array.
Note: Pattern-based haptics do not trigger gamepad vibration.

#### Example

```ts
[100, 50, 100] // vibrate 100ms, pause 50ms, vibrate 100ms
```

***

### style?

> `optional` **style**: `"light"` \| `"medium"` \| `"heavy"`

Defined in: [definitions.ts:116](https://github.com/strata-game-library/capacitor-plugin/blob/7d2c239904967f5e2f1c1e041ccf5823aaa9683b/src/definitions.ts#L116)

Legacy style for backward compatibility.

***

### type?

> `optional` **type**: `"impact"` \| `"notification"` \| `"selection"`

Defined in: [definitions.ts:112](https://github.com/strata-game-library/capacitor-plugin/blob/7d2c239904967f5e2f1c1e041ccf5823aaa9683b/src/definitions.ts#L112)

Legacy type for backward compatibility with initial implementation.
