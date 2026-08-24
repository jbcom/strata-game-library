import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import type { BiomeData } from '../biomes';
import { getTerrainHeight } from '../biomes';
import { sdCaves, sdRock, sdTerrain } from '../sdf';

const biomes: BiomeData[] = [{ type: 'mountain', center: new THREE.Vector2(0, 0), radius: 100 }];

describe('sdCaves', () => {
  it('returns the no-cave sentinel well above ground', () => {
    // depthFactor hits zero at y = 10, so nothing can carve above it.
    expect(sdCaves(0, 50, 0)).toBe(1000);
  });

  it('is deterministic', () => {
    expect(sdCaves(3, 2, 1)).toBe(sdCaves(3, 2, 1));
  });

  it('carves at least somewhere in a low-altitude volume', () => {
    let carved = 0;
    for (let x = 0; x < 40; x++) {
      for (let z = 0; z < 40; z++) {
        if (sdCaves(x, 1, z) !== 1000) carved++;
      }
    }

    expect(carved).toBeGreaterThan(0);
  });

  it('returns a finite value everywhere it is sampled', () => {
    for (let y = 0; y < 12; y++) {
      expect(Number.isFinite(sdCaves(5, y, 5))).toBe(true);
    }
  });
});

describe('sdTerrain', () => {
  // NOTE — pins existing behaviour, which is not what the name suggests.
  //
  // sdCaves returns the sentinel 1000 to mean "no cave here", and sdTerrain
  // feeds that into opSmoothSubtraction(d, -caveDist, 2). That reduces to
  // Math.max(d, 1000), so the sentinel dominates and sdTerrain returns 1000
  // wherever no cave exists — including deep underground, where a solid
  // landscape should read strongly negative. Only points inside a cave region
  // return a meaningful distance.
  //
  // This predates the extraction of core/terrain; the function was moved here
  // verbatim. These tests document the behaviour rather than assert the
  // intended semantics, so that a later fix shows up as a deliberate change.
  it('returns the no-cave sentinel where no cave is present', () => {
    const height = getTerrainHeight(0, 0, biomes);

    expect(sdTerrain(new THREE.Vector3(0, height + 100, 0), biomes)).toBe(1000);
    expect(sdTerrain(new THREE.Vector3(0, height - 100, 0), biomes)).toBe(1000);
  });

  it('returns a finite non-sentinel distance inside a carved cave region', () => {
    // Found by sampling: this column passes through a cave.
    const height = getTerrainHeight(0, 0, biomes);
    const inCave = sdTerrain(new THREE.Vector3(0, height - 20, 0), biomes);

    expect(inCave).not.toBe(1000);
    expect(Number.isFinite(inCave)).toBe(true);
    expect(inCave).toBeLessThan(0);
  });

  it('is deterministic', () => {
    const p = new THREE.Vector3(4, 6, 8);

    expect(sdTerrain(p, biomes)).toBe(sdTerrain(p, biomes));
  });

  it('does not mutate the sample point', () => {
    const p = new THREE.Vector3(4, 6, 8);
    sdTerrain(p, biomes);

    expect([p.x, p.y, p.z]).toEqual([4, 6, 8]);
  });

  it('throws on an empty biome list', () => {
    expect(() => sdTerrain(new THREE.Vector3(), [])).toThrow('biomes array cannot be empty');
  });
});

describe('sdRock', () => {
  const center = new THREE.Vector3(0, 0, 0);

  it('is negative inside and positive far outside', () => {
    expect(sdRock(center.clone(), center, 5)).toBeLessThan(0);
    expect(sdRock(new THREE.Vector3(100, 100, 100), center, 5)).toBeGreaterThan(0);
  });

  it('tracks the centre it is given', () => {
    const offset = new THREE.Vector3(50, 0, 50);

    expect(sdRock(offset.clone(), offset, 5)).toBeLessThan(0);
  });

  it('does not mutate the sample point', () => {
    const p = new THREE.Vector3(1, 2, 3);
    sdRock(p, center, 4);

    expect([p.x, p.y, p.z]).toEqual([1, 2, 3]);
  });

  it('rejects a non-positive radius', () => {
    expect(() => sdRock(center.clone(), center, 0)).toThrow('baseRadius must be positive');
    expect(() => sdRock(center.clone(), center, -1)).toThrow('baseRadius must be positive');
  });
});
