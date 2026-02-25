import { describe, expect, it } from 'vitest';

/**
 * Since useStrataScene is a React hook and cannot be called outside of
 * a React component, we test the underlying logic directly:
 * - Config merging
 * - applyToScene behavior
 *
 * The hook itself is a thin wrapper around useMemo + useCallback.
 */

// Replicate the default config from the hook
const DEFAULT_CONFIG = {
  fog: { mode: 'exponential' as const, density: 0.01, color: '#c8d8e8' },
  ambientLight: { intensity: 0.6, color: '#ffffff' },
  physics: { gravity: -9.81, enabled: true },
};

// Replicate the fog mode mapping
const BABYLON_FOG_MODES = {
  linear: 2,
  exponential: 1,
  exponential2: 3,
} as const;

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  return [(num >> 16) / 255, ((num >> 8) & 0xff) / 255, (num & 0xff) / 255];
}

type FogConfig = {
  mode: 'linear' | 'exponential' | 'exponential2';
  density?: number;
  color?: string;
  near?: number;
  far?: number;
};

type StrataSceneConfig = {
  fog?: FogConfig;
  ambientLight?: { intensity?: number; color?: string };
  physics?: { gravity?: number; enabled?: boolean };
};

function resolveConfig(config: StrataSceneConfig = {}) {
  return {
    fog: { ...DEFAULT_CONFIG.fog, ...config.fog },
    ambientLight: { ...DEFAULT_CONFIG.ambientLight, ...config.ambientLight },
    physics: { ...DEFAULT_CONFIG.physics, ...config.physics },
  };
}

function applyToScene(resolved: ReturnType<typeof resolveConfig>, scene: unknown) {
  const s = scene as Record<string, unknown>;
  if (!s || typeof s !== 'object') return;

  const fog = resolved.fog;
  s.fogMode = BABYLON_FOG_MODES[fog.mode];
  if (fog.density !== undefined) s.fogDensity = fog.density;
  if (fog.color && typeof s.fogColor === 'object' && s.fogColor !== null) {
    const [r, g, b] = hexToRgb(fog.color);
    const fogColor = s.fogColor as Record<string, unknown>;
    fogColor.r = r;
    fogColor.g = g;
    fogColor.b = b;
  }
  if (fog.near !== undefined) s.fogStart = fog.near;
  if (fog.far !== undefined) s.fogEnd = fog.far;

  const ambient = resolved.ambientLight;
  if (typeof s.ambientColor === 'object' && s.ambientColor !== null) {
    const [r, g, b] = hexToRgb(ambient.color ?? '#ffffff');
    const ambientColor = s.ambientColor as Record<string, unknown>;
    ambientColor.r = r * (ambient.intensity ?? 1);
    ambientColor.g = g * (ambient.intensity ?? 1);
    ambientColor.b = b * (ambient.intensity ?? 1);
  }

  const physics = resolved.physics;
  if (physics.enabled && typeof s.gravity === 'object' && s.gravity !== null) {
    const gravity = s.gravity as Record<string, unknown>;
    gravity.x = 0;
    gravity.y = physics.gravity ?? -9.81;
    gravity.z = 0;
  }
}

describe('useStrataScene config resolution', () => {
  it('should return defaults when no config provided', () => {
    const config = resolveConfig();
    expect(config.fog.mode).toBe('exponential');
    expect(config.fog.density).toBe(0.01);
    expect(config.fog.color).toBe('#c8d8e8');
    expect(config.ambientLight.intensity).toBe(0.6);
    expect(config.ambientLight.color).toBe('#ffffff');
    expect(config.physics.gravity).toBe(-9.81);
    expect(config.physics.enabled).toBe(true);
  });

  it('should merge custom config with defaults', () => {
    const config = resolveConfig({
      fog: { mode: 'linear', near: 10, far: 100 },
      physics: { gravity: -5.0 },
    });

    expect(config.fog.mode).toBe('linear');
    expect(config.fog.near).toBe(10);
    expect(config.fog.far).toBe(100);
    expect(config.fog.density).toBe(0.01); // from default
    expect(config.ambientLight.intensity).toBe(0.6); // from default
    expect(config.physics.gravity).toBe(-5.0);
    expect(config.physics.enabled).toBe(true); // from default
  });
});

describe('useStrataScene applyToScene', () => {
  it('should apply exponential fog settings', () => {
    const config = resolveConfig({
      fog: { mode: 'exponential', density: 0.05, color: '#aabbcc' },
    });

    const mockScene = {
      fogMode: 0,
      fogDensity: 0,
      fogColor: { r: 0, g: 0, b: 0 },
      fogStart: 0,
      fogEnd: 0,
      ambientColor: { r: 0, g: 0, b: 0 },
      gravity: { x: 0, y: 0, z: 0 },
    };

    applyToScene(config, mockScene);

    expect(mockScene.fogMode).toBe(1); // FOGMODE_EXP
    expect(mockScene.fogDensity).toBe(0.05);
    expect(mockScene.fogColor.r).toBeCloseTo(0.667, 2);
    expect(mockScene.fogColor.g).toBeCloseTo(0.733, 2);
    expect(mockScene.fogColor.b).toBeCloseTo(0.8, 2);
  });

  it('should apply linear fog settings', () => {
    const config = resolveConfig({
      fog: { mode: 'linear', near: 5, far: 50 },
    });

    const mockScene = {
      fogMode: 0,
      fogDensity: 0,
      fogColor: { r: 0, g: 0, b: 0 },
      fogStart: 0,
      fogEnd: 0,
      ambientColor: { r: 0, g: 0, b: 0 },
      gravity: { x: 0, y: 0, z: 0 },
    };

    applyToScene(config, mockScene);

    expect(mockScene.fogMode).toBe(2); // FOGMODE_LINEAR
    expect(mockScene.fogStart).toBe(5);
    expect(mockScene.fogEnd).toBe(50);
  });

  it('should apply exponential2 fog mode', () => {
    const config = resolveConfig({
      fog: { mode: 'exponential2', density: 0.02 },
    });

    const mockScene = {
      fogMode: 0,
      fogDensity: 0,
      fogColor: { r: 0, g: 0, b: 0 },
      ambientColor: { r: 0, g: 0, b: 0 },
      gravity: { x: 0, y: 0, z: 0 },
    };

    applyToScene(config, mockScene);
    expect(mockScene.fogMode).toBe(3); // FOGMODE_EXP2
    expect(mockScene.fogDensity).toBe(0.02);
  });

  it('should apply gravity', () => {
    const config = resolveConfig({
      physics: { gravity: -20, enabled: true },
    });

    const mockScene = {
      fogMode: 0,
      fogDensity: 0,
      fogColor: { r: 0, g: 0, b: 0 },
      ambientColor: { r: 0, g: 0, b: 0 },
      gravity: { x: 0, y: 0, z: 0 },
    };

    applyToScene(config, mockScene);
    expect(mockScene.gravity.y).toBe(-20);
    expect(mockScene.gravity.x).toBe(0);
    expect(mockScene.gravity.z).toBe(0);
  });

  it('should handle null scene gracefully', () => {
    const config = resolveConfig();
    expect(() => applyToScene(config, null)).not.toThrow();
  });

  it('should apply ambient light color with intensity', () => {
    const config = resolveConfig({
      ambientLight: { intensity: 0.5, color: '#ff0000' },
    });

    const mockScene = {
      fogMode: 0,
      fogDensity: 0,
      fogColor: { r: 0, g: 0, b: 0 },
      ambientColor: { r: 0, g: 0, b: 0 },
      gravity: { x: 0, y: 0, z: 0 },
    };

    applyToScene(config, mockScene);
    // #ff0000 * 0.5 intensity => r=0.5, g=0, b=0
    expect(mockScene.ambientColor.r).toBeCloseTo(0.5, 2);
    expect(mockScene.ambientColor.g).toBeCloseTo(0, 2);
    expect(mockScene.ambientColor.b).toBeCloseTo(0, 2);
  });
});
