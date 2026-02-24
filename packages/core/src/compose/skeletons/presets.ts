import type { BoneDefinition, SkeletonDefinition } from './types';

/**
 * Utility: convert Euler angles in degrees (x, y, z) to a quaternion object { x, y, z, w }
 */
export const eulerToQuat = (x: number, y: number, z: number) => {
  const toRad = (angle: number) => (angle * Math.PI) / 180;
  const rx = toRad(x);
  const ry = toRad(y);
  const rz = toRad(z);

  const cx = Math.cos(rx / 2);
  const sx = Math.sin(rx / 2);
  const cy = Math.cos(ry / 2);
  const sy = Math.sin(ry / 2);
  const cz = Math.cos(rz / 2);
  const sz = Math.sin(rz / 2);

  return {
    x: sx * cy * cz - cx * sy * sz,
    y: cx * sy * cz + sx * cy * sz,
    z: cx * cy * sz - sx * sy * cz,
    w: cx * cy * cz + sx * sy * sz,
  };
};

export function createQuadrupedSkeleton(
  id: string,
  options: {
    bodyLength: number;
    bodyWidth?: number;
    legRatio: number; // Leg length relative to body
    tailLength: number;
    headSize: number;
    neckLength?: number;
  }
): SkeletonDefinition {
  const { bodyLength, bodyWidth = 0.1, legRatio, tailLength, headSize, neckLength = 0.1 } = options;

  const tailRotation = eulerToQuat(0, 0, -30);

  const bones: BoneDefinition[] = [
    { id: 'root', shape: 'sphere', size: [0.01, 0.01, 0.01], position: [0, 0, 0] },
    {
      id: 'spine_base',
      parent: 'root',
      shape: 'capsule',
      size: [bodyLength * 0.3, bodyWidth, bodyWidth],
      position: [0, 0, 0],
    },
    {
      id: 'spine_mid',
      parent: 'spine_base',
      shape: 'capsule',
      size: [bodyLength * 0.4, bodyWidth * 1.2, bodyWidth * 1.2],
      position: [bodyLength * 0.3, 0, 0],
    },
    {
      id: 'spine_upper',
      parent: 'spine_mid',
      shape: 'capsule',
      size: [bodyLength * 0.3, bodyWidth, bodyWidth],
      position: [bodyLength * 0.4, 0, 0],
    },
    // Neck and head
    {
      id: 'neck',
      parent: 'spine_upper',
      shape: 'capsule',
      size: [neckLength, 0.06, 0.06],
      position: [bodyLength * 0.3, 0, 0],
    },
    {
      id: 'head',
      parent: 'neck',
      shape: 'sphere',
      size: [headSize, headSize * 0.8, headSize],
      position: [neckLength, 0, 0],
    },
    // Legs
    {
      id: 'leg_front_l',
      parent: 'spine_upper',
      shape: 'capsule',
      size: [0.02, bodyLength * legRatio, 0.02],
      position: [0.1, -0.05, 0.05],
    },
    {
      id: 'leg_front_r',
      parent: 'spine_upper',
      shape: 'capsule',
      size: [0.02, bodyLength * legRatio, 0.02],
      position: [0.1, -0.05, -0.05],
    },
    {
      id: 'leg_back_l',
      parent: 'spine_base',
      shape: 'capsule',
      size: [0.02, bodyLength * legRatio * 0.9, 0.02],
      position: [0, -0.05, 0.05],
    },
    {
      id: 'leg_back_r',
      parent: 'spine_base',
      shape: 'capsule',
      size: [0.02, bodyLength * legRatio * 0.9, 0.02],
      position: [0, -0.05, -0.05],
    },
    // Tail
    {
      id: 'tail_base',
      parent: 'spine_base',
      shape: 'capsule',
      size: [tailLength * 0.3, 0.03, 0.03],
      position: [-0.05, 0, 0],
      rotation: [tailRotation.x, tailRotation.y, tailRotation.z, tailRotation.w],
    },
    {
      id: 'tail_mid',
      parent: 'tail_base',
      shape: 'capsule',
      size: [tailLength * 0.4, 0.025, 0.025],
      position: [-tailLength * 0.3, 0, 0],
    },
    {
      id: 'tail_tip',
      parent: 'tail_mid',
      shape: 'capsule',
      size: [tailLength * 0.3, 0.02, 0.02],
      position: [-tailLength * 0.4, 0, 0],
    },
  ];

  return {
    id,
    type: 'quadruped',
    bones,
    ikChains: [
      { id: 'leg_front_l_ik', bones: ['leg_front_l'], target: 'leg_front_l' },
      { id: 'leg_front_r_ik', bones: ['leg_front_r'], target: 'leg_front_r' },
      { id: 'leg_back_l_ik', bones: ['leg_back_l'], target: 'leg_back_l' },
      { id: 'leg_back_r_ik', bones: ['leg_back_r'], target: 'leg_back_r' },
    ],
  };
}

export function createBipedSkeleton(id: string, _options: { height: number }): SkeletonDefinition {
  // Stub implementation
  return {
    id,
    type: 'biped',
    bones: [
      { id: 'root', shape: 'sphere', size: [0.01, 0.01, 0.01], position: [0, 0, 0] },
      {
        id: 'spine',
        parent: 'root',
        shape: 'capsule',
        size: [_options.height * 0.4, 0.2, 0.1],
        position: [0, _options.height * 0.5, 0],
      },
    ],
  };
}

export function createAvianSkeleton(
  id: string,
  _options: { wingspan: number; bodyLength: number }
): SkeletonDefinition {
  // Stub implementation
  return {
    id,
    type: 'avian',
    bones: [{ id: 'root', shape: 'sphere', size: [0.01, 0.01, 0.01], position: [0, 0, 0] }],
  };
}

export function createSerpentineSkeleton(
  id: string,
  _options: { length: number; segments: number }
): SkeletonDefinition {
  // Stub implementation
  return {
    id,
    type: 'serpentine',
    bones: [{ id: 'root', shape: 'sphere', size: [0.01, 0.01, 0.01], position: [0, 0, 0] }],
  };
}
