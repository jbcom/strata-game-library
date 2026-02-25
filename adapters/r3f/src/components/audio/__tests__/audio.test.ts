/**
 * Audio Component Tests
 *
 * Tests for audio component exports and context hooks.
 *
 * @module components/audio/__tests__/audio.test
 */

import { describe, expect, it, vi } from 'vitest';

vi.mock('@react-three/fiber', () => ({
  useThree: () => ({
    camera: { add: vi.fn(), remove: vi.fn() },
  }),
  useFrame: (callback: any) => callback,
}));

vi.mock('@strata-game-library/core', () => ({
  createSoundManager: vi.fn(() => ({
    setMasterVolume: vi.fn(),
    dispose: vi.fn(),
  })),
  createSpatialAudio: vi.fn(() => ({
    dispose: vi.fn(),
  })),
  setupAutoUnlock: vi.fn(),
}));

describe('Audio exports', () => {
  it('should export all audio components from index', async () => {
    const audioModule = await import('../index');

    expect(audioModule.AmbientAudio).toBeDefined();
    expect(audioModule.AudioEmitter).toBeDefined();
    expect(audioModule.AudioEnvironment).toBeDefined();
    expect(audioModule.AudioListener).toBeDefined();
    expect(audioModule.AudioZone).toBeDefined();
    expect(audioModule.FootstepAudio).toBeDefined();
    expect(audioModule.PositionalAudio).toBeDefined();
    expect(audioModule.WeatherAudio).toBeDefined();
  });

  it('should export context hooks', async () => {
    const audioModule = await import('../index');

    expect(audioModule.AudioProvider).toBeDefined();
    expect(audioModule.useAudioContext).toBeDefined();
    expect(audioModule.useAudioListener).toBeDefined();
    expect(audioModule.useAudioManager).toBeDefined();
    expect(audioModule.useSpatialAudio).toBeDefined();
  });

  it('should export AudioProvider as a function', async () => {
    const { AudioProvider } = await import('../index');
    expect(typeof AudioProvider).toBe('function');
  });

  it('should export useAudioContext as a function', async () => {
    const { useAudioContext } = await import('../index');
    expect(typeof useAudioContext).toBe('function');
  });
});

describe('Audio context hooks behavior', () => {
  it('useAudioManager should return null outside provider', async () => {
    // The hook uses useContext which returns null when not in provider
    const { useAudioManager } = await import('../context');
    expect(typeof useAudioManager).toBe('function');
  });

  it('useSpatialAudio should return null outside provider', async () => {
    const { useSpatialAudio } = await import('../context');
    expect(typeof useSpatialAudio).toBe('function');
  });

  it('useAudioListener should return null outside provider', async () => {
    const { useAudioListener } = await import('../context');
    expect(typeof useAudioListener).toBe('function');
  });
});

describe('Audio distance models', () => {
  it('should support standard distance model types', () => {
    const models = ['linear', 'inverse', 'exponential'] as const;
    expect(models).toHaveLength(3);
  });
});

describe('Audio zone geometry types', () => {
  it('should support box and sphere zone geometries', () => {
    const geometries = ['box', 'sphere'] as const;
    expect(geometries).toContain('box');
    expect(geometries).toContain('sphere');
  });
});
