import { describe, expect, it } from 'vitest';
import * as terrain from '../index';

/**
 * The terrain index names every export explicitly rather than using
 * `export *`, so that adding a file to this directory cannot silently widen
 * the public API. This test is what makes that contract enforceable: a new
 * runtime export has to be added here deliberately.
 */
const EXPECTED_RUNTIME_EXPORTS = [
  'generateTerrainChunk',
  'getBiomeAt',
  'getTerrainHeight',
  'sdCaves',
  'sdRock',
  'sdTerrain',
].sort();

describe('core/terrain public surface', () => {
  it('exports exactly the documented runtime symbols', () => {
    expect(Object.keys(terrain).sort()).toEqual(EXPECTED_RUNTIME_EXPORTS);
  });

  it('exports every runtime symbol as a callable function', () => {
    expect(typeof terrain.generateTerrainChunk).toBe('function');
    expect(typeof terrain.getBiomeAt).toBe('function');
    expect(typeof terrain.getTerrainHeight).toBe('function');
    expect(typeof terrain.sdCaves).toBe('function');
    expect(typeof terrain.sdRock).toBe('function');
    expect(typeof terrain.sdTerrain).toBe('function');
  });
});

describe('backward compatibility', () => {
  it('still exposes the terrain SDFs and biome helpers from core/sdf', async () => {
    const sdf = await import('../../sdf');

    expect(sdf.sdTerrain).toBe(terrain.sdTerrain);
    expect(sdf.sdCaves).toBe(terrain.sdCaves);
    expect(sdf.sdRock).toBe(terrain.sdRock);
    expect(sdf.getBiomeAt).toBe(terrain.getBiomeAt);
    expect(sdf.getTerrainHeight).toBe(terrain.getTerrainHeight);
  });

  it('still exposes generateTerrainChunk from core/marching-cubes', async () => {
    const mc = await import('../../marching-cubes');

    expect(mc.generateTerrainChunk).toBe(terrain.generateTerrainChunk);
  });

  it('still exposes the terrain symbols from the core barrel', async () => {
    const core = await import('../../index');

    expect(core.sdTerrain).toBe(terrain.sdTerrain);
    expect(core.getTerrainHeight).toBe(terrain.getTerrainHeight);
    expect(core.generateTerrainChunk).toBe(terrain.generateTerrainChunk);
  });
});
