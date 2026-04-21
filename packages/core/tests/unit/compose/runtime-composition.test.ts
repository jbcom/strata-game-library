import { describe, expect, it } from 'vitest';
import {
  createMaterialVariant,
  createMaterialVariants,
  resolveCreatureComposition,
  resolvePropComposition,
} from '../../../src/compose';

describe('runtime composition assembly', () => {
  it('creates deterministic material variants with physics metadata', () => {
    const variant = createMaterialVariant('wood_oak', {
      id: 'weathered_oak',
      roughnessDelta: 0.2,
      physics: { friction: 0.9 },
    });

    expect(variant.id).toBe('weathered_oak');
    expect(variant.roughness).toBeCloseTo(0.8);
    expect(variant.physics).toEqual({
      density: 700,
      friction: 0.9,
      restitution: 0.25,
    });

    const variants = createMaterialVariants('metal_iron', {
      count: 2,
      idPrefix: 'band_iron',
      roughnessJitter: 0.1,
      rng: () => 1,
    });

    expect(variants.map((material) => material.id)).toEqual(['band_iron_1', 'band_iron_2']);
    expect(variants[0]?.roughness).toBeCloseTo(0.5);
  });

  it('resolves props into adapter-neutral runtime nodes', () => {
    const composition = resolvePropComposition('crate_wooden');
    const { runtime } = composition;

    expect(runtime.kind).toBe('prop');
    expect(runtime.nodes).toHaveLength(composition.components.length);
    expect(runtime.bounds.size.every((size) => size > 0)).toBe(true);
    expect(runtime.physics).toMatchObject({
      mode: 'dynamic',
      mass: 25,
      friction: 0.6,
      source: 'mixed',
    });
    expect(runtime.interaction).toMatchObject({ type: 'container', capacity: 10 });

    const woodNode = runtime.nodes.find((node) => node.materialId === 'wood_oak');
    expect(woodNode).toBeDefined();
    expect(woodNode?.position).toHaveLength(3);
    expect(woodNode?.physics.mass).toBeGreaterThan(0);
    expect(runtime.materialSlots[woodNode?.materialSlot ?? '']?.swappableWith).toContain(
      'wood_pine'
    );
  });

  it('resolves creatures into runtime bones, materials, animation bindings, and spawn metadata', () => {
    const composition = resolveCreatureComposition('otter_river', {}, () => 0.5);
    const { runtime } = composition;

    expect(runtime.kind).toBe('creature');
    expect(runtime.scale).toBe(1);
    expect(runtime.bones).toHaveLength(composition.skeleton.bones.length);
    expect(runtime.bounds.size.every((size) => size > 0)).toBe(true);
    expect(runtime.physics.mode).toBe('dynamic');
    expect(runtime.physics.mass).toBeGreaterThan(0);
    expect(runtime.physics.source).toBe('material');
    expect(runtime.spawn).toMatchObject({
      biomes: ['marsh'],
      spawnWeight: 0.4,
      packSize: [2, 6],
    });

    const head = runtime.bones.find((bone) => bone.boneId === 'head');
    expect(head).toBeDefined();
    expect(head?.position[0]).toBeGreaterThan(0);
    expect(head?.material.baseColor).toBe('#4a3520');
    expect(runtime.materialSlots[head?.materialSlot ?? '']?.swappableWith).toContain('fur_fox');

    const idle = runtime.animations.find((animation) => animation.name === 'idle');
    expect(idle?.clip).toBe('otter_idle');
    expect(idle?.targetBones).toHaveLength(composition.skeleton.bones.length);
  });
});
