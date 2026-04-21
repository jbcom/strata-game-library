import {
  createMaterialVariant,
  MATERIALS,
  resolvePropComposition,
} from '@strata-game-library/core/compose';
import { describe, expect, it } from 'vitest';
import {
  createReactylonRuntimeMaterialDescriptor,
  resolveReactylonRuntimeCreature,
  resolveReactylonRuntimeProp,
} from '../src/components/compose';

describe('Reactylon runtime composition descriptors', () => {
  it('creates serializable material descriptors from runtime slots', () => {
    const prop = resolvePropComposition('crate_wooden');
    const slot = Object.values(prop.runtime.materialSlots)[0];
    const descriptor = createReactylonRuntimeMaterialDescriptor(slot);

    expect(descriptor.id).toBe(slot.id);
    expect(descriptor.materialId).toBe(slot.materialId);
    expect(descriptor.baseColor).toBe(MATERIALS.wood_oak.baseColor);
    expect(descriptor.physics?.density).toBeGreaterThan(0);
    expect(descriptor.transparent).toBe(false);
  });

  it('resolves prop runtime descriptors with material overrides and transforms', () => {
    const descriptor = resolveReactylonRuntimeProp('crate_wooden', {
      position: [1, 2, 3],
      scale: 2,
      materialOverrides: {
        wood_oak: createMaterialVariant('wood_oak', {
          id: 'reactylon_showcase_wood',
          baseColor: '#c48a42',
        }),
      },
    });
    const woodSlot = Object.values(descriptor.materialSlots).find(
      (slot) => slot.materialId === 'reactylon_showcase_wood'
    );

    expect(descriptor.kind).toBe('prop');
    expect(descriptor.nodes.length).toBeGreaterThan(0);
    expect(descriptor.position).toEqual([1, 2, 3]);
    expect(descriptor.scale).toEqual([2, 2, 2]);
    expect(woodSlot?.baseColor).toBe('#c48a42');
  });

  it('resolves creature runtime descriptors with bones and animation metadata', () => {
    const descriptor = resolveReactylonRuntimeCreature('otter_river', {
      transparentVolumetrics: true,
    });

    expect(descriptor.kind).toBe('creature');
    expect(descriptor.bones.length).toBeGreaterThan(0);
    expect(descriptor.animations.length).toBeGreaterThan(0);
    expect(descriptor.resolvedScale).toBeGreaterThan(0);
    expect(descriptor.scale).toEqual([1, 1, 1]);
    expect(descriptor.spawn.biomes).toContain('marsh');
    expect(Object.keys(descriptor.materialSlots).length).toBeGreaterThan(0);
  });
});
