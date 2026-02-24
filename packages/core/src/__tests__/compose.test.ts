import { describe, expect, it } from 'vitest';
import {
  COVERINGS,
  CREATURES,
  createFurMaterial,
  createQuadrupedSkeleton,
  MATERIALS,
  PROPS,
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
