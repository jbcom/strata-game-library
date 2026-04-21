import { describe, expect, it } from 'vitest';
import {
  COVERINGS,
  CREATURES,
  createCreature,
  createFurMaterial,
  createProp,
  createQuadrupedSkeleton,
  MATERIALS,
  PROPS,
  resolveCreatureComposition,
  resolvePropComposition,
  SKELETONS,
} from '../compose';

describe('Compositional Object System', () => {
  describe('Material System', () => {
    it('should have built-in materials', () => {
      expect(MATERIALS.fur_otter).toBeDefined();
      expect(MATERIALS.metal_iron).toBeDefined();
      expect(MATERIALS.wood_oak).toBeDefined();
    });

    it('should create custom fur materials', () => {
      const customFur = createFurMaterial('custom_fur', {
        baseColor: '#ff00ff',
        shell: { length: 0.1 },
      });
      expect(customFur.id).toBe('custom_fur');
      expect(customFur.type).toBe('shell');
      expect(customFur.shell?.length).toBe(0.1);
    });
  });

  describe('Skeleton System', () => {
    it('should have built-in skeletons', () => {
      expect(SKELETONS.quadruped_medium).toBeDefined();
      expect(SKELETONS.biped.bones.find((bone) => bone.id === 'head')).toBeDefined();
      expect(SKELETONS.avian.bones.find((bone) => bone.id === 'wing_l')).toBeDefined();
      expect(SKELETONS.serpentine.bones.length).toBeGreaterThan(10);
    });

    it('should create custom quadruped skeletons', () => {
      const skel = createQuadrupedSkeleton('custom_quad', {
        bodyLength: 1,
        legRatio: 0.5,
        tailLength: 0.5,
        headSize: 0.2,
      });
      expect(skel.id).toBe('custom_quad');
      expect(skel.bones.length).toBeGreaterThan(0);
      expect(skel.bones.find((b) => b.id === 'head')).toBeDefined();
    });
  });

  describe('Covering System', () => {
    it('should have built-in coverings', () => {
      expect(COVERINGS.otter).toBeDefined();
      expect(COVERINGS.fox).toBeDefined();
    });

    it('should reference valid skeletons', () => {
      expect(SKELETONS[COVERINGS.otter.skeleton]).toBeDefined();
    });
  });

  describe('Prop System', () => {
    it('should have built-in props', () => {
      expect(PROPS.crate_wooden).toBeDefined();
      expect(PROPS.chair_wooden).toBeDefined();
    });

    it('should have components with valid materials', () => {
      const crate = PROPS.crate_wooden;
      crate.components.forEach((comp) => {
        expect(MATERIALS[comp.material]).toBeDefined();
      });
    });

    it('should create and resolve custom props', () => {
      const stool = createProp({
        id: 'stool_simple',
        components: [
          {
            shape: 'box',
            size: [0.4, 0.05, 0.4],
            position: [0, 0.45, 0],
            material: 'wood_oak',
          },
          {
            shape: 'box',
            size: [0.05, 0.45, 0.05],
            position: [0.15, 0.225, 0.15],
            material: 'wood_oak',
          },
        ],
      });
      const resolved = resolvePropComposition(stool);

      expect(stool.name).toBe('Stool Simple');
      expect(resolved.components[0].material.id).toBe('wood_oak');
    });
  });

  describe('Creature System', () => {
    it('should have built-in creatures', () => {
      expect(CREATURES.otter_river).toBeDefined();
    });

    it('should have valid composition', () => {
      const otter = CREATURES.otter_river;
      expect(SKELETONS[otter.skeleton as string]).toBeDefined();
      expect(otter.covering).toBeDefined();
    });

    it('should create creatures with sensible defaults', () => {
      const duck = createCreature({
        id: 'duck_mallard',
        skeleton: 'avian',
        covering: {
          regions: {
            '*': { material: 'fur_fox', color: '#7a5a2b' },
            beak: { material: 'metal_gold', color: '#d98c1f' },
          },
        },
        ai: 'prey',
        stats: { health: 20, speed: 4, flySpeed: 8 },
      });

      expect(duck.name).toBe('Duck Mallard');
      expect(duck.covering.skeleton).toBe('avian');
      expect(duck.animations.idle).toBe('duck_mallard_idle');
    });

    it('should resolve creature coverings against skeleton bones', () => {
      const composition = resolveCreatureComposition('otter_river', {}, () => 0.75);

      expect(composition.skeleton.bones.find((bone) => bone.id === 'head')).toBeDefined();
      expect(composition.materialsByBone.head.material.baseColor).toBe('#4a3520');
      expect(composition.materialsByBone.tail_base.material.baseColor).toBe('#3d2817');
      expect(composition.scale).toBeCloseTo(1.075);
    });
  });

  describe('Performance (Definitions)', () => {
    it('should create 1000 material definitions quickly', () => {
      const start = performance.now();
      const materials = [];
      for (let i = 0; i < 1000; i++) {
        materials.push(
          createFurMaterial(`fur_${i}`, {
            baseColor: '#ffffff',
            shell: { length: Math.random() },
          })
        );
      }
      const end = performance.now();
      expect(materials.length).toBe(1000);
      expect(end - start).toBeLessThan(500); // More realistic threshold for CI environments
    });
  });
});
