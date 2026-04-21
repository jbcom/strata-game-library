import {
  MATERIALS,
  resolveCreatureComposition,
  resolvePropComposition,
} from '@strata-game-library/core/compose';
import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { createRuntimeMaterial } from '../materials';
import { createRuntimeGeometry } from '../RuntimeGeometry';

describe('R3F runtime composition components', () => {
  it('exports runtime composition renderers', async () => {
    const compose = await import('../index');

    expect(compose.RuntimeProp).toBeDefined();
    expect(compose.RuntimeCreature).toBeDefined();
    expect(compose.RuntimeAssetMesh).toBeDefined();
    expect(compose.RuntimeGeometry).toBeDefined();
    expect(compose.createRuntimeMaterial).toBeTypeOf('function');
    expect(compose.resolveRuntimeMaterial).toBeTypeOf('function');
  });

  it('creates Three materials from core material definitions', () => {
    const material = createRuntimeMaterial(MATERIALS.wood_oak);

    expect(material).toBeInstanceOf(THREE.MeshStandardMaterial);
    expect((material as THREE.MeshStandardMaterial).roughness).toBe(MATERIALS.wood_oak.roughness);
  });

  it('accepts resolved core runtime composition outputs', () => {
    const prop = resolvePropComposition('crate_wooden');
    const creature = resolveCreatureComposition('otter_river', {}, () => 0.5);

    expect(prop.runtime.nodes.length).toBeGreaterThan(0);
    expect(creature.runtime.bones.length).toBeGreaterThan(0);
  });

  it('orients capsule geometry along the longest runtime axis', () => {
    const geometry = createRuntimeGeometry('capsule', [4, 1, 1]);

    geometry.computeBoundingBox();
    const bounds = geometry.boundingBox;
    const size = new THREE.Vector3();
    bounds?.getSize(size);

    expect(size.x).toBeGreaterThan(size.y);
    expect(size.x).toBeGreaterThan(size.z);
    geometry.dispose();
  });

  it('preserves mesh sources for R3F asset-backed prop nodes', () => {
    const prop = resolvePropComposition({
      id: 'asset_prop',
      components: [
        {
          shape: 'mesh',
          mesh: '/models/crate.glb',
          size: [1, 1, 1],
          position: [0, 0, 0],
          material: 'wood_oak',
        },
      ],
    });

    expect(prop.runtime.nodes[0]?.shape).toBe('mesh');
    expect(prop.runtime.nodes[0]?.mesh).toBe('/models/crate.glb');
  });
});
