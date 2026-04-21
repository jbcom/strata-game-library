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
  const { height } = _options;
  const shoulderWidth = height * 0.14;
  const hipWidth = height * 0.1;
  const upperArmLength = height * 0.18;
  const forearmLength = height * 0.16;
  const upperLegLength = height * 0.24;
  const lowerLegLength = height * 0.23;
  const footLength = height * 0.08;

  return {
    id,
    type: 'biped',
    bones: [
      { id: 'root', shape: 'sphere', size: [0.01, 0.01, 0.01], position: [0, 0, 0] },
      {
        id: 'pelvis',
        parent: 'root',
        shape: 'capsule',
        size: [height * 0.12, hipWidth, hipWidth * 0.8],
        position: [0, height * 0.48, 0],
      },
      {
        id: 'spine_lower',
        parent: 'pelvis',
        shape: 'capsule',
        size: [height * 0.18, hipWidth * 0.8, hipWidth * 0.75],
        position: [0, height * 0.1, 0],
      },
      {
        id: 'spine_upper',
        parent: 'spine_lower',
        shape: 'capsule',
        size: [height * 0.2, shoulderWidth * 0.45, shoulderWidth * 0.4],
        position: [0, height * 0.18, 0],
      },
      {
        id: 'neck',
        parent: 'spine_upper',
        shape: 'capsule',
        size: [height * 0.06, 0.05, 0.05],
        position: [0, height * 0.12, 0],
      },
      {
        id: 'head',
        parent: 'neck',
        shape: 'sphere',
        size: [height * 0.08, height * 0.1, height * 0.08],
        position: [0, height * 0.08, 0],
      },
      {
        id: 'arm_upper_l',
        parent: 'spine_upper',
        shape: 'capsule',
        size: [upperArmLength, 0.04, 0.04],
        position: [-shoulderWidth, height * 0.05, 0],
        rotation: [0, 0, Math.SQRT1_2, Math.SQRT1_2],
      },
      {
        id: 'arm_upper_r',
        parent: 'spine_upper',
        shape: 'capsule',
        size: [upperArmLength, 0.04, 0.04],
        position: [shoulderWidth, height * 0.05, 0],
        rotation: [0, 0, -Math.SQRT1_2, Math.SQRT1_2],
      },
      {
        id: 'arm_lower_l',
        parent: 'arm_upper_l',
        shape: 'capsule',
        size: [forearmLength, 0.035, 0.035],
        position: [0, -upperArmLength, 0],
      },
      {
        id: 'arm_lower_r',
        parent: 'arm_upper_r',
        shape: 'capsule',
        size: [forearmLength, 0.035, 0.035],
        position: [0, -upperArmLength, 0],
      },
      {
        id: 'hand_l',
        parent: 'arm_lower_l',
        shape: 'sphere',
        size: [0.04, 0.04, 0.04],
        position: [0, -forearmLength, 0],
      },
      {
        id: 'hand_r',
        parent: 'arm_lower_r',
        shape: 'sphere',
        size: [0.04, 0.04, 0.04],
        position: [0, -forearmLength, 0],
      },
      {
        id: 'leg_upper_l',
        parent: 'pelvis',
        shape: 'capsule',
        size: [upperLegLength, 0.05, 0.05],
        position: [-hipWidth * 0.5, -height * 0.06, 0],
      },
      {
        id: 'leg_upper_r',
        parent: 'pelvis',
        shape: 'capsule',
        size: [upperLegLength, 0.05, 0.05],
        position: [hipWidth * 0.5, -height * 0.06, 0],
      },
      {
        id: 'leg_lower_l',
        parent: 'leg_upper_l',
        shape: 'capsule',
        size: [lowerLegLength, 0.045, 0.045],
        position: [0, -upperLegLength, 0],
      },
      {
        id: 'leg_lower_r',
        parent: 'leg_upper_r',
        shape: 'capsule',
        size: [lowerLegLength, 0.045, 0.045],
        position: [0, -upperLegLength, 0],
      },
      {
        id: 'foot_l',
        parent: 'leg_lower_l',
        shape: 'box',
        size: [footLength * 0.4, footLength, footLength * 0.2],
        position: [0, -lowerLegLength, footLength * 0.2],
      },
      {
        id: 'foot_r',
        parent: 'leg_lower_r',
        shape: 'box',
        size: [footLength * 0.4, footLength, footLength * 0.2],
        position: [0, -lowerLegLength, footLength * 0.2],
      },
    ],
    ikChains: [
      { id: 'hand_l_ik', bones: ['arm_upper_l', 'arm_lower_l'], target: 'hand_l' },
      { id: 'hand_r_ik', bones: ['arm_upper_r', 'arm_lower_r'], target: 'hand_r' },
      { id: 'foot_l_ik', bones: ['leg_upper_l', 'leg_lower_l'], target: 'foot_l' },
      { id: 'foot_r_ik', bones: ['leg_upper_r', 'leg_lower_r'], target: 'foot_r' },
    ],
    animationTargets: {
      locomotion: [
        'pelvis',
        'leg_upper_l',
        'leg_lower_l',
        'leg_upper_r',
        'leg_lower_r',
        'foot_l',
        'foot_r',
      ],
      look: ['neck', 'head'],
      reach: ['arm_upper_l', 'arm_lower_l', 'hand_l', 'arm_upper_r', 'arm_lower_r', 'hand_r'],
    },
  };
}

export function createAvianSkeleton(
  id: string,
  _options: { wingspan: number; bodyLength: number }
): SkeletonDefinition {
  const { wingspan, bodyLength } = _options;
  const wingHalfSpan = wingspan * 0.5;
  const legLength = bodyLength * 0.7;
  const wingLeftRotation = eulerToQuat(0, 0, 65);
  const wingRightRotation = eulerToQuat(0, 0, -65);
  const tailRotation = eulerToQuat(0, 0, -20);

  return {
    id,
    type: 'avian',
    bones: [
      { id: 'root', shape: 'sphere', size: [0.01, 0.01, 0.01], position: [0, 0, 0] },
      {
        id: 'body',
        parent: 'root',
        shape: 'capsule',
        size: [bodyLength * 0.8, bodyLength * 0.18, bodyLength * 0.22],
        position: [0, bodyLength * 0.45, 0],
      },
      {
        id: 'chest',
        parent: 'body',
        shape: 'capsule',
        size: [bodyLength * 0.35, bodyLength * 0.2, bodyLength * 0.24],
        position: [bodyLength * 0.35, 0, 0],
      },
      {
        id: 'neck',
        parent: 'chest',
        shape: 'capsule',
        size: [bodyLength * 0.25, bodyLength * 0.08, bodyLength * 0.08],
        position: [bodyLength * 0.18, bodyLength * 0.08, 0],
      },
      {
        id: 'head',
        parent: 'neck',
        shape: 'sphere',
        size: [bodyLength * 0.12, bodyLength * 0.1, bodyLength * 0.1],
        position: [bodyLength * 0.14, bodyLength * 0.02, 0],
      },
      {
        id: 'beak',
        parent: 'head',
        shape: 'cylinder',
        size: [bodyLength * 0.1, bodyLength * 0.03, bodyLength * 0.03],
        position: [bodyLength * 0.1, 0, 0],
      },
      {
        id: 'wing_l',
        parent: 'chest',
        shape: 'capsule',
        size: [wingHalfSpan * 0.55, bodyLength * 0.05, bodyLength * 0.05],
        position: [0, 0.02, wingHalfSpan * 0.2],
        rotation: [wingLeftRotation.x, wingLeftRotation.y, wingLeftRotation.z, wingLeftRotation.w],
      },
      {
        id: 'wing_r',
        parent: 'chest',
        shape: 'capsule',
        size: [wingHalfSpan * 0.55, bodyLength * 0.05, bodyLength * 0.05],
        position: [0, 0.02, -wingHalfSpan * 0.2],
        rotation: [
          wingRightRotation.x,
          wingRightRotation.y,
          wingRightRotation.z,
          wingRightRotation.w,
        ],
      },
      {
        id: 'wing_tip_l',
        parent: 'wing_l',
        shape: 'capsule',
        size: [wingHalfSpan * 0.45, bodyLength * 0.035, bodyLength * 0.035],
        position: [0, wingHalfSpan * 0.45, wingHalfSpan * 0.18],
      },
      {
        id: 'wing_tip_r',
        parent: 'wing_r',
        shape: 'capsule',
        size: [wingHalfSpan * 0.45, bodyLength * 0.035, bodyLength * 0.035],
        position: [0, wingHalfSpan * 0.45, -wingHalfSpan * 0.18],
      },
      {
        id: 'leg_l',
        parent: 'body',
        shape: 'capsule',
        size: [legLength * 0.55, bodyLength * 0.04, bodyLength * 0.04],
        position: [-bodyLength * 0.18, -bodyLength * 0.1, bodyLength * 0.08],
      },
      {
        id: 'leg_r',
        parent: 'body',
        shape: 'capsule',
        size: [legLength * 0.55, bodyLength * 0.04, bodyLength * 0.04],
        position: [-bodyLength * 0.18, -bodyLength * 0.1, -bodyLength * 0.08],
      },
      {
        id: 'foot_l',
        parent: 'leg_l',
        shape: 'box',
        size: [bodyLength * 0.05, bodyLength * 0.12, bodyLength * 0.04],
        position: [0, -legLength * 0.55, bodyLength * 0.05],
      },
      {
        id: 'foot_r',
        parent: 'leg_r',
        shape: 'box',
        size: [bodyLength * 0.05, bodyLength * 0.12, bodyLength * 0.04],
        position: [0, -legLength * 0.55, bodyLength * 0.05],
      },
      {
        id: 'tail_base',
        parent: 'body',
        shape: 'capsule',
        size: [bodyLength * 0.2, bodyLength * 0.05, bodyLength * 0.08],
        position: [-bodyLength * 0.32, 0, 0],
        rotation: [tailRotation.x, tailRotation.y, tailRotation.z, tailRotation.w],
      },
      {
        id: 'tail_tip',
        parent: 'tail_base',
        shape: 'capsule',
        size: [bodyLength * 0.16, bodyLength * 0.04, bodyLength * 0.06],
        position: [-bodyLength * 0.18, 0, 0],
      },
    ],
    ikChains: [
      { id: 'leg_l_ik', bones: ['leg_l'], target: 'foot_l' },
      { id: 'leg_r_ik', bones: ['leg_r'], target: 'foot_r' },
    ],
    animationTargets: {
      flap: ['wing_l', 'wing_tip_l', 'wing_r', 'wing_tip_r'],
      peck: ['neck', 'head', 'beak'],
      stride: ['leg_l', 'foot_l', 'leg_r', 'foot_r'],
    },
  };
}

export function createSerpentineSkeleton(
  id: string,
  _options: { length: number; segments: number }
): SkeletonDefinition {
  const { length, segments } = _options;
  const safeSegments = Math.max(3, Math.floor(segments));
  const segmentLength = length / safeSegments;
  const bones: BoneDefinition[] = [
    { id: 'root', shape: 'sphere', size: [0.01, 0.01, 0.01], position: [0, 0, 0] },
  ];

  for (let index = 0; index < safeSegments; index += 1) {
    const segmentId = `segment_${String(index + 1).padStart(2, '0')}`;
    bones.push({
      id: segmentId,
      parent: index === 0 ? 'root' : `segment_${String(index).padStart(2, '0')}`,
      shape: 'capsule',
      size: [
        segmentLength,
        Math.max(0.03, 0.08 - index * 0.002),
        Math.max(0.03, 0.08 - index * 0.002),
      ],
      position: [index === 0 ? 0 : segmentLength, 0, 0],
    });
  }

  bones.push({
    id: 'head',
    parent: `segment_${String(safeSegments).padStart(2, '0')}`,
    shape: 'sphere',
    size: [segmentLength * 0.7, segmentLength * 0.45, segmentLength * 0.45],
    position: [segmentLength * 0.85, 0, 0],
  });

  return {
    id,
    type: 'serpentine',
    bones,
    animationTargets: {
      slither: bones
        .map((bone) => bone.id)
        .filter((boneId) => boneId !== 'root' && boneId !== 'head'),
      strike: [
        `segment_${String(Math.max(1, safeSegments - 2)).padStart(2, '0')}`,
        `segment_${String(Math.max(1, safeSegments - 1)).padStart(2, '0')}`,
        `segment_${String(safeSegments).padStart(2, '0')}`,
        'head',
      ],
    },
  };
}
