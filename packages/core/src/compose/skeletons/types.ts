import type * as THREE from 'three';

export interface BoneDefinition {
  id: string;
  parent?: string; // Parent bone ID
  position: [number, number, number] | THREE.Vector3; // Relative to parent
  rotation?: [number, number, number, number] | THREE.Quaternion;

  // Shape for mesh generation
  shape: 'capsule' | 'box' | 'sphere' | 'cylinder' | 'custom';
  size: [number, number, number];

  // Physics (if ragdoll)
  physics?: {
    mass: number;
    // constraints?: JointConstraints;
  };
}

export interface IKChainDefinition {
  id: string;
  bones: string[];
  target: string;
}

export interface SkeletonDefinition {
  id: string;
  type: 'biped' | 'quadruped' | 'serpentine' | 'avian' | 'aquatic' | 'custom';

  bones: BoneDefinition[];

  // Inverse Kinematics
  ikChains?: IKChainDefinition[];

  // Animation targets
  animationTargets?: {
    [name: string]: string[]; // Animation name -> affected bones
  };
}
