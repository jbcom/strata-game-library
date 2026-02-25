import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { createMolecule, createWaterMolecule } from '../src/molecular';
import type { AtomData, BondData } from '../src/molecular';

describe('molecular presets', () => {
  describe('createMolecule', () => {
    const sampleAtoms: AtomData[] = [
      {
        position: new THREE.Vector3(0, 0, 0),
        element: 'C',
        radius: 0.5,
        color: new THREE.Color(0x333333),
      },
      {
        position: new THREE.Vector3(1, 0, 0),
        element: 'O',
        radius: 0.6,
        color: new THREE.Color(0xff0000),
      },
    ];

    const sampleBonds: BondData[] = [{ from: 0, to: 1, order: 1 }];

    it('creates a THREE.Group', () => {
      const molecule = createMolecule(sampleAtoms, sampleBonds);
      expect(molecule).toBeInstanceOf(THREE.Group);
    });

    it('throws on empty atoms array', () => {
      expect(() => createMolecule([], [])).toThrow('atoms array cannot be empty');
    });

    it('throws on null atoms', () => {
      expect(() => createMolecule(null as any, [])).toThrow('atoms array cannot be empty');
    });

    it('adds correct number of children (atoms + bonds)', () => {
      const molecule = createMolecule(sampleAtoms, sampleBonds);
      // 2 atoms + 1 bond = 3 children
      expect(molecule.children).toHaveLength(3);
    });

    it('adds only atoms when no bonds are provided', () => {
      const molecule = createMolecule(sampleAtoms, []);
      expect(molecule.children).toHaveLength(2);
    });

    it('respects showBonds=false option', () => {
      const molecule = createMolecule(sampleAtoms, sampleBonds, { showBonds: false });
      // Only atoms, no bonds
      expect(molecule.children).toHaveLength(2);
    });

    it('atom meshes are positioned correctly', () => {
      const molecule = createMolecule(sampleAtoms, []);
      const firstAtomMesh = molecule.children[0] as THREE.Mesh;
      expect(firstAtomMesh.position.x).toBe(0);
      expect(firstAtomMesh.position.y).toBe(0);
      expect(firstAtomMesh.position.z).toBe(0);

      const secondAtomMesh = molecule.children[1] as THREE.Mesh;
      expect(secondAtomMesh.position.x).toBe(1);
    });

    it('atoms have shadow properties enabled', () => {
      const molecule = createMolecule(sampleAtoms, []);
      const atomMesh = molecule.children[0] as THREE.Mesh;
      expect(atomMesh.castShadow).toBe(true);
      expect(atomMesh.receiveShadow).toBe(true);
    });

    it('skips bonds with invalid atom indices', () => {
      const invalidBonds: BondData[] = [{ from: 0, to: 99, order: 1 }];
      const molecule = createMolecule(sampleAtoms, invalidBonds);
      // 2 atoms, bond skipped because toAtom is undefined
      expect(molecule.children).toHaveLength(2);
    });
  });

  describe('createWaterMolecule', () => {
    it('creates a THREE.Group', () => {
      const water = createWaterMolecule();
      expect(water).toBeInstanceOf(THREE.Group);
    });

    it('has 5 children (3 atoms + 2 bonds)', () => {
      const water = createWaterMolecule();
      expect(water.children).toHaveLength(5);
    });

    it('defaults to position (0,0,0)', () => {
      const water = createWaterMolecule();
      expect(water.position.x).toBe(0);
      expect(water.position.y).toBe(0);
      expect(water.position.z).toBe(0);
    });

    it('accepts custom position', () => {
      const pos = new THREE.Vector3(5, 10, 15);
      const water = createWaterMolecule(pos);
      expect(water.position.x).toBe(5);
      expect(water.position.y).toBe(10);
      expect(water.position.z).toBe(15);
    });

    it('accepts custom scale', () => {
      const water = createWaterMolecule(new THREE.Vector3(), 2.0);
      expect(water).toBeInstanceOf(THREE.Group);
      // Molecule still created, just with scaled positions
      expect(water.children.length).toBeGreaterThan(0);
    });
  });
});
