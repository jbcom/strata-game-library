---
title: "StrataPlugin"
---

[**@strata-game-library/capacitor-plugin**](../README.md)

***

[@strata-game-library/capacitor-plugin](../globals.md) / StrataPlugin

# Interface: StrataPlugin

Defined in: [definitions.ts:179](https://github.com/strata-game-library/capacitor-plugin/blob/7d2c239904967f5e2f1c1e041ccf5823aaa9683b/src/definitions.ts#L179)

## Methods

### addListener()

#### Call Signature

> **addListener**(`eventName`, `callback`): `Promise`\<\{ `remove`: () => `Promise`\<`void`\>; \}\>

Defined in: [definitions.ts:296](https://github.com/strata-game-library/capacitor-plugin/blob/7d2c239904967f5e2f1c1e041ccf5823aaa9683b/src/definitions.ts#L296)

##### Parameters

###### eventName

`"deviceChange"`

###### callback

(`profile`) => `void`

##### Returns

`Promise`\<\{ `remove`: () => `Promise`\<`void`\>; \}\>

#### Call Signature

> **addListener**(`eventName`, `callback`): `Promise`\<\{ `remove`: () => `Promise`\<`void`\>; \}\>

Defined in: [definitions.ts:300](https://github.com/strata-game-library/capacitor-plugin/blob/7d2c239904967f5e2f1c1e041ccf5823aaa9683b/src/definitions.ts#L300)

##### Parameters

###### eventName

`"inputChange"`

###### callback

(`snapshot`) => `void`

##### Returns

`Promise`\<\{ `remove`: () => `Promise`\<`void`\>; \}\>

#### Call Signature

> **addListener**(`eventName`, `callback`): `Promise`\<\{ `remove`: () => `Promise`\<`void`\>; \}\>

Defined in: [definitions.ts:304](https://github.com/strata-game-library/capacitor-plugin/blob/7d2c239904967f5e2f1c1e041ccf5823aaa9683b/src/definitions.ts#L304)

##### Parameters

###### eventName

`"gamepadConnected"`

###### callback

(`info`) => `void`

##### Returns

`Promise`\<\{ `remove`: () => `Promise`\<`void`\>; \}\>

#### Call Signature

> **addListener**(`eventName`, `callback`): `Promise`\<\{ `remove`: () => `Promise`\<`void`\>; \}\>

Defined in: [definitions.ts:308](https://github.com/strata-game-library/capacitor-plugin/blob/7d2c239904967f5e2f1c1e041ccf5823aaa9683b/src/definitions.ts#L308)

##### Parameters

###### eventName

`"gamepadDisconnected"`

###### callback

(`info`) => `void`

##### Returns

`Promise`\<\{ `remove`: () => `Promise`\<`void`\>; \}\>

***

### clear()

> **clear**(`options?`): `Promise`\<`void`\>

Defined in: [definitions.ts:266](https://github.com/strata-game-library/capacitor-plugin/blob/7d2c239904967f5e2f1c1e041ccf5823aaa9683b/src/definitions.ts#L266)

Clear all storage (within the namespace if specified).

#### Parameters

##### options?

[`StorageOptions`](StorageOptions.md)

Optional storage configuration

#### Returns

`Promise`\<`void`\>

***

### configureTouchHandling()

> **configureTouchHandling**(`options`): `Promise`\<`void`\>

Defined in: [definitions.ts:221](https://github.com/strata-game-library/capacitor-plugin/blob/7d2c239904967f5e2f1c1e041ccf5823aaa9683b/src/definitions.ts#L221)

Configure touch handling for games (e.g. prevent scrolling/zooming).

#### Parameters

##### options

[`TouchOptions`](TouchOptions.md)

#### Returns

`Promise`\<`void`\>

***

### getConnectedControllers()

> **getConnectedControllers**(): `Promise`\<\{ `controllers`: `object`[]; `selectedIndex`: `number`; \}\>

Defined in: [definitions.ts:286](https://github.com/strata-game-library/capacitor-plugin/blob/7d2c239904967f5e2f1c1e041ccf5823aaa9683b/src/definitions.ts#L286)

Get list of all connected game controllers (iOS only).

#### Returns

`Promise`\<\{ `controllers`: `object`[]; `selectedIndex`: `number`; \}\>

Object with array of controllers and selected index

***

### getControlHints()

> **getControlHints**(): `Promise`\<[`ControlHints`](ControlHints.md)\>

Defined in: [definitions.ts:181](https://github.com/strata-game-library/capacitor-plugin/blob/7d2c239904967f5e2f1c1e041ccf5823aaa9683b/src/definitions.ts#L181)

#### Returns

`Promise`\<[`ControlHints`](ControlHints.md)\>

***

### getDeviceInfo()

> **getDeviceInfo**(): `Promise`\<[`DeviceInfo`](DeviceInfo.md)\>

Defined in: [definitions.ts:205](https://github.com/strata-game-library/capacitor-plugin/blob/7d2c239904967f5e2f1c1e041ccf5823aaa9683b/src/definitions.ts#L205)

Get device information relevant to Strata 3D.

#### Returns

`Promise`\<[`DeviceInfo`](DeviceInfo.md)\>

***

### getDeviceProfile()

> **getDeviceProfile**(): `Promise`\<[`DeviceProfile`](DeviceProfile.md)\>

Defined in: [definitions.ts:180](https://github.com/strata-game-library/capacitor-plugin/blob/7d2c239904967f5e2f1c1e041ccf5823aaa9683b/src/definitions.ts#L180)

#### Returns

`Promise`\<[`DeviceProfile`](DeviceProfile.md)\>

***

### getInputSnapshot()

> **getInputSnapshot**(): `Promise`\<[`InputSnapshot`](InputSnapshot.md)\>

Defined in: [definitions.ts:182](https://github.com/strata-game-library/capacitor-plugin/blob/7d2c239904967f5e2f1c1e041ccf5823aaa9683b/src/definitions.ts#L182)

#### Returns

`Promise`\<[`InputSnapshot`](InputSnapshot.md)\>

***

### getItem()

> **getItem**\<`T`\>(`key`, `options?`): `Promise`\<[`StorageResult`](StorageResult.md)\<`T`\>\>

Defined in: [definitions.ts:243](https://github.com/strata-game-library/capacitor-plugin/blob/7d2c239904967f5e2f1c1e041ccf5823aaa9683b/src/definitions.ts#L243)

Retrieve game data from persistent storage.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### key

`string`

The key to retrieve

##### options?

[`StorageOptions`](StorageOptions.md)

Optional storage configuration

#### Returns

`Promise`\<[`StorageResult`](StorageResult.md)\<`T`\>\>

The stored value or null if not found

***

### getPerformanceMode()

> **getPerformanceMode**(): `Promise`\<[`PerformanceMode`](PerformanceMode.md)\>

Defined in: [definitions.ts:217](https://github.com/strata-game-library/capacitor-plugin/blob/7d2c239904967f5e2f1c1e041ccf5823aaa9683b/src/definitions.ts#L217)

Check if performance mode is enabled or suggest it.

#### Returns

`Promise`\<[`PerformanceMode`](PerformanceMode.md)\>

***

### getSafeAreaInsets()

> **getSafeAreaInsets**(): `Promise`\<[`SafeAreaInsets`](SafeAreaInsets.md)\>

Defined in: [definitions.ts:213](https://github.com/strata-game-library/capacitor-plugin/blob/7d2c239904967f5e2f1c1e041ccf5823aaa9683b/src/definitions.ts#L213)

Get safe area insets for the device.

#### Returns

`Promise`\<[`SafeAreaInsets`](SafeAreaInsets.md)\>

***

### haptics()

> **haptics**(`options`): `Promise`\<`void`\>

Defined in: [definitions.ts:201](https://github.com/strata-game-library/capacitor-plugin/blob/7d2c239904967f5e2f1c1e041ccf5823aaa9683b/src/definitions.ts#L201)

Legacy haptics method for backward compatibility.

#### Parameters

##### options

[`HapticsOptions`](HapticsOptions.md)

#### Returns

`Promise`\<`void`\>

***

### keys()

> **keys**(`options?`): `Promise`\<[`StorageKeysResult`](StorageKeysResult.md)\>

Defined in: [definitions.ts:259](https://github.com/strata-game-library/capacitor-plugin/blob/7d2c239904967f5e2f1c1e041ccf5823aaa9683b/src/definitions.ts#L259)

List all keys in storage (within the namespace if specified).

#### Parameters

##### options?

[`StorageOptions`](StorageOptions.md)

Optional storage configuration

#### Returns

`Promise`\<[`StorageKeysResult`](StorageKeysResult.md)\>

Array of keys

***

### removeItem()

> **removeItem**(`key`, `options?`): `Promise`\<`void`\>

Defined in: [definitions.ts:251](https://github.com/strata-game-library/capacitor-plugin/blob/7d2c239904967f5e2f1c1e041ccf5823aaa9683b/src/definitions.ts#L251)

Remove a specific key from storage.

#### Parameters

##### key

`string`

The key to remove

##### options?

[`StorageOptions`](StorageOptions.md)

Optional storage configuration

#### Returns

`Promise`\<`void`\>

***

### selectController()

> **selectController**(`options`): `Promise`\<\{ `controllerId?`: `string`; `error?`: `string`; `selectedIndex?`: `number`; `success`: `boolean`; \}\>

Defined in: [definitions.ts:275](https://github.com/strata-game-library/capacitor-plugin/blob/7d2c239904967f5e2f1c1e041ccf5823aaa9683b/src/definitions.ts#L275)

Select which controller to use for input (iOS only, 0-based index).
Use getConnectedControllers() to see available controllers.

#### Parameters

##### options

Object with index property

###### index

`number`

#### Returns

`Promise`\<\{ `controllerId?`: `string`; `error?`: `string`; `selectedIndex?`: `number`; `success`: `boolean`; \}\>

Object with success status and selected controller info

***

### setInputMapping()

> **setInputMapping**(`mapping`): `Promise`\<`void`\>

Defined in: [definitions.ts:183](https://github.com/strata-game-library/capacitor-plugin/blob/7d2c239904967f5e2f1c1e041ccf5823aaa9683b/src/definitions.ts#L183)

#### Parameters

##### mapping

`Partial`\<[`InputMapping`](InputMapping.md)\>

#### Returns

`Promise`\<`void`\>

***

### setItem()

> **setItem**\<`T`\>(`key`, `value`, `options?`): `Promise`\<`void`\>

Defined in: [definitions.ts:234](https://github.com/strata-game-library/capacitor-plugin/blob/7d2c239904967f5e2f1c1e041ccf5823aaa9683b/src/definitions.ts#L234)

Save game data to persistent storage.
On web: Uses localStorage with optional namespace prefix.
On native: Uses native platform storage.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### key

`string`

The key to store data under

##### value

`T`

The value to store (will be JSON serialized)

##### options?

[`StorageOptions`](StorageOptions.md)

Optional storage configuration

#### Returns

`Promise`\<`void`\>

***

### setScreenOrientation()

> **setScreenOrientation**(`options`): `Promise`\<`void`\>

Defined in: [definitions.ts:209](https://github.com/strata-game-library/capacitor-plugin/blob/7d2c239904967f5e2f1c1e041ccf5823aaa9683b/src/definitions.ts#L209)

Lock or unlock screen orientation.

#### Parameters

##### options

[`OrientationOptions`](OrientationOptions.md)

#### Returns

`Promise`\<`void`\>

***

### triggerHaptics()

> **triggerHaptics**(`options`): `Promise`\<`void`\>

Defined in: [definitions.ts:190](https://github.com/strata-game-library/capacitor-plugin/blob/7d2c239904967f5e2f1c1e041ccf5823aaa9683b/src/definitions.ts#L190)

Triggers haptic feedback with unified API.

#### Parameters

##### options

[`HapticsOptions`](HapticsOptions.md)

Haptics configuration

#### Returns

`Promise`\<`void`\>

Promise that resolves when haptic is triggered

***

### vibrate()

> **vibrate**(`options?`): `Promise`\<`void`\>

Defined in: [definitions.ts:197](https://github.com/strata-game-library/capacitor-plugin/blob/7d2c239904967f5e2f1c1e041ccf5823aaa9683b/src/definitions.ts#L197)

Simple vibration method for basic haptic feedback.

#### Parameters

##### options?

Optional duration configuration

###### duration?

`number`

#### Returns

`Promise`\<`void`\>

Promise that resolves when vibration is triggered
