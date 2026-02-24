[**@strata-game-library/audio-synth**](../README.md)

***

[@strata-game-library/audio-synth](../globals.md) / useAudioSynth

# Function: useAudioSynth()

> **useAudioSynth**(): [`AudioSynthContextValue`](../interfaces/AudioSynthContextValue.md)

Defined in: [components/AudioSynthProvider.tsx:178](https://github.com/strata-game-library/audio-synth/blob/f0dc05583a63584baa609a2412d68780d3e54db5/src/components/AudioSynthProvider.tsx#L178)

Hook to access the audio synth context.

## Returns

[`AudioSynthContextValue`](../interfaces/AudioSynthContextValue.md)

AudioSynthContextValue with manager and helper functions

## Throws

Error if used outside AudioSynthProvider

## Example

```tsx
function ShootButton() {
  const { playSFX, isReady } = useAudioSynth();

  return (
    <button
      onClick={() => playSFX('gunshot')}
      disabled={!isReady}
    >
      Shoot
    </button>
  );
}
```
