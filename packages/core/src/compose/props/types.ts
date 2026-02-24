import type * as THREE from 'three';

export interface PropComponent {
  shape: 'box' | 'cylinder' | 'sphere' | 'capsule' | 'mesh';
  size: [number, number, number];
  position: [number, number, number] | THREE.Vector3;
  rotation?: [number, number, number, number] | THREE.Quaternion;
  material: string;

  // For mesh shape
  mesh?: string; // Path to GLB/mesh
}

export interface PropDefinition {
  id: string;
  name: string;

  // Composition
  components: PropComponent[];

  // Physics
  physics?: {
    type: 'static' | 'dynamic' | 'kinematic';
    mass?: number;
    friction?: number;
    restitution?: number;
  };

  // Interaction
  interaction?: {
    type: 'container' | 'seat' | 'door' | 'switch' | 'collectible';
    capacity?: number; // For containers
    contents?: string[]; // For containers
    action?: string; // For switches
  };

  // Audio
  audio?: {
    impact?: string; // Sound on collision
    interaction?: string; // Sound on interact
  };
}
