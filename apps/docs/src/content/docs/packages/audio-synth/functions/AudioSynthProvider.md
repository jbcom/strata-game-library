[**@strata-game-library/audio-synth**](../README.md)

***

[@strata-game-library/audio-synth](../globals.md) / AudioSynthProvider

# Function: AudioSynthProvider()

> **AudioSynthProvider**(`__namedParameters`): `Element`

Defined in: [components/AudioSynthProvider.tsx:60](https://github.com/strata-game-library/audio-synth/blob/f0dc05583a63584baa609a2412d68780d3e54db5/src/components/AudioSynthProvider.tsx#L60)

Context provider for procedural audio synthesis.

Manages the audio engine lifecycle and provides hooks for
playing sound effects and background music.

## Parameters

### \_\_namedParameters

[`AudioSynthProviderProps`](../interfaces/AudioSynthProviderProps.md)

## Returns

`Element`

## Example

```tsx
function App() {
  return (
    <AudioSynthProvider masterVolume={0.8}>
      <Game />
    </AudioSynthProvider>
  );
}
```
