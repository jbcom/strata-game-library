/**
 * Molecular Preset - Molecular/particle rendering system
 *
 * Provides GPU-accelerated rendering for molecular structures,
 * particle systems, and scientific visualization.
 */

import * as THREE from 'three';

export interface MolecularOptions {
  atomRadius?: number;
  bondRadius?: number;
  atomColor?: THREE.ColorRepresentation;
  bondColor?: THREE.ColorRepresentation;
  showBonds?: boolean;
}

export interface AtomData {
  position: THREE.Vector3;
  element: string;
  radius: number;
  color: THREE.Color;
}

export interface BondData {
  from: number; // atom index
  to: number; // atom index
  order: number; // 1 = single, 2 = double, 3 = triple
}

/**
 * Create molecular structure from atom and bond data
 */
export function createMolecule(
  atoms: AtomData[],
  bonds: BondData[],
  options: MolecularOptions = {}
): THREE.Group {
  if (!atoms || atoms.length === 0) {
    throw new Error('createMolecule: atoms array cannot be empty');
  }

  const {
    atomRadius = 0.5,
    bondRadius = 0.1,
    atomColor = 0x888888,
    bondColor = 0xcccccc,
    showBonds = true,
  } = options;

  const group = new THREE.Group();

  // Create atoms
  const atomGeometry = new THREE.SphereGeometry(atomRadius, 16, 16);
  atoms.forEach((atom) => {
    const material = new THREE.MeshStandardMaterial({
      color: atom.color || atomColor,
      metalness: 0.3,
      roughness: 0.4,
    });
    const mesh = new THREE.Mesh(atomGeometry, material);
    mesh.position.copy(atom.position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  });

  // Create bonds
  if (showBonds && bonds && bonds.length > 0) {
    bonds.forEach((bond) => {
      const fromAtom = atoms[bond.from];
      const toAtom = atoms[bond.to];

      if (!fromAtom || !toAtom) return;

      const direction = new THREE.Vector3().subVectors(toAtom.position, fromAtom.position);
      const length = direction.length();
      const center = new THREE.Vector3()
        .addVectors(fromAtom.position, toAtom.position)
        .multiplyScalar(0.5);

      const bondGeometry = new THREE.CylinderGeometry(bondRadius, bondRadius, length, 8);
      const bondMaterial = new THREE.MeshStandardMaterial({
        color: bondColor,
        metalness: 0.2,
        roughness: 0.6,
      });
      const bondMesh = new THREE.Mesh(bondGeometry, bondMaterial);

      // Orient cylinder along bond direction
      bondMesh.position.copy(center);
      bondMesh.lookAt(toAtom.position);
      bondMesh.rotateX(Math.PI / 2);

      group.add(bondMesh);
    });
  }

  return group;
}

/**
 * Create simple water molecule (H2O) as example
 */
export function createWaterMolecule(
  position: THREE.Vector3 = new THREE.Vector3(),
  scale: number = 1.0
): THREE.Group {
  const atoms: AtomData[] = [
    {
      position: new THREE.Vector3(0, 0, 0).multiplyScalar(scale),
      element: 'O',
      radius: 0.6 * scale,
      color: new THREE.Color(0xff0000), // Red for oxygen
    },
    {
      position: new THREE.Vector3(0.76, 0.59, 0).multiplyScalar(scale),
      element: 'H',
      radius: 0.3 * scale,
      color: new THREE.Color(0xffffff), // White for hydrogen
    },
    {
      position: new THREE.Vector3(-0.76, 0.59, 0).multiplyScalar(scale),
      element: 'H',
      radius: 0.3 * scale,
      color: new THREE.Color(0xffffff),
    },
  ];

  const bonds: BondData[] = [
    { from: 0, to: 1, order: 1 },
    { from: 0, to: 2, order: 1 },
  ];

  const molecule = createMolecule(atoms, bonds, {
    atomRadius: 0.5 * scale,
    bondRadius: 0.1 * scale,
  });
  molecule.position.copy(position);

  return molecule;
}
