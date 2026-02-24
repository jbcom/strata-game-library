import type React from 'react';
import type * as THREE from 'three';
import type {
  GaitConfig,
  GaitState,
  IKSolverResult,
  LookAtConfig,
  SpringConfig,
} from '../../core/animation';

/**
 * Props for the IKChain component.
 * @category Entities & Simulation
 */
export interface IKChainProps {
  /** Lengths of each bone in the chain. */
  boneLengths: number[];
  /** Target position or object to reach. */
  target: THREE.Vector3 | React.RefObject<THREE.Object3D>;
  /** Optional pole target for orientation control. */
  pole?: THREE.Vector3 | React.RefObject<THREE.Object3D>;
  /** IK solver algorithm. Default: 'fabrik'. */
  solver?: 'fabrik' | 'ccd';
  /** Distance threshold for convergence. Default: 0.001. */
  tolerance?: number;
  /** Maximum number of solver iterations per frame. Default: 20. */
  maxIterations?: number;
  /** Whether to render visual bone gizmos. Default: false. */
  visualize?: boolean;
  /** Color of the bone gizmos. Default: '#00ff00'. */
  visualColor?: string;
  /** Radius of the bone gizmos. Default: 0.05. */
  visualRadius?: number;
  /** Child components. */
  children?: React.ReactNode;
  /** Callback fired each frame with the solver result. */
  onSolve?: (result: IKSolverResult) => void;
}

/**
 * Ref interface for IKChain imperative control.
 * @category Entities & Simulation
 */
export interface IKChainRef {
  /** Get the array of bone objects. */
  getBones: () => THREE.Object3D[];
  /** Get the latest solver result. */
  getResult: () => IKSolverResult | null;
  /** Manually trigger a solver step. */
  solve: () => void;
}

/**
 * Props for the IKLimb component.
 * @category Entities & Simulation
 */
export interface IKLimbProps {
  /** Length of the upper bone. */
  upperLength: number;
  /** Length of the lower bone. */
  lowerLength: number;
  /** Target position or object to reach. */
  target: THREE.Vector3 | React.RefObject<THREE.Object3D>;
  /** Pole target for orientation control (e.g., knee or elbow direction). */
  poleTarget: THREE.Vector3 | React.RefObject<THREE.Object3D>;
  /** Whether to render visual bone gizmos. Default: false. */
  visualize?: boolean;
  /** Color of the bone gizmos. Default: '#4488ff'. */
  visualColor?: string;
  /** Child components. */
  children?: React.ReactNode;
  /** Callback fired each frame with joint positions. */
  onSolve?: (midPos: THREE.Vector3, endPos: THREE.Vector3) => void;
}

/**
 * Ref interface for IKLimb.
 * @category Entities & Simulation
 */
export interface IKLimbRef {
  /** Get the upper bone object. */
  getUpperBone: () => THREE.Object3D | null;
  /** Get the lower bone object. */
  getLowerBone: () => THREE.Object3D | null;
  /** Get the end effector object. */
  getEndEffector: () => THREE.Object3D | null;
}

/**
 * Props for the LookAt component.
 * @category Entities & Simulation
 */
export interface LookAtProps {
  /** Target position or object to face. */
  target: THREE.Vector3 | React.RefObject<THREE.Object3D>;
  /** Configuration for rotation speed, limits, and deadzones. */
  config?: Partial<LookAtConfig>;
  /** Child components to rotate. */
  children?: React.ReactNode;
}

/**
 * Ref interface for LookAt.
 * @category Entities & Simulation
 */
export interface LookAtRef {
  /** Get the current computed rotation. */
  getRotation: () => THREE.Quaternion;
  /** Reset the rotation to neutral. */
  reset: () => void;
}

/**
 * Props for the SpringBone component.
 * @category Entities & Simulation
 */
export interface SpringBoneProps {
  /** Configuration for spring stiffness, damping, and mass. */
  config?: Partial<SpringConfig>;
  /** Gravity vector applied to the bone. Default: [0, -9.8, 0]. */
  gravity?: [number, number, number];
  /** Child components. */
  children?: React.ReactNode;
}

/**
 * Ref interface for SpringBone.
 * @category Entities & Simulation
 */
export interface SpringBoneRef {
  /** Get the current bone position. */
  getPosition: () => THREE.Vector3;
  /** Get the current velocity. */
  getVelocity: () => THREE.Vector3;
  /** Reset the spring to neutral. */
  reset: () => void;
}

/**
 * Props for the ProceduralWalk component.
 * @category Entities & Simulation
 */
export interface ProceduralWalkProps {
  /** Configuration for step height, length, and timing. */
  config?: Partial<GaitConfig>;
  /** Reference to the main body object. */
  bodyRef: React.RefObject<THREE.Object3D>;
  /** Reference to the left foot object. */
  leftFootRef?: React.RefObject<THREE.Object3D>;
  /** Reference to the right foot object. */
  rightFootRef?: React.RefObject<THREE.Object3D>;
  /** Whether locomotion is active. Default: true. */
  enabled?: boolean;
  /** Callback fired when a foot completes a step. */
  onStep?: (foot: 'left' | 'right', position: THREE.Vector3) => void;
}

/**
 * Ref interface for ProceduralWalk.
 * @category Entities & Simulation
 */
export interface ProceduralWalkRef {
  /** Get the current gait state. */
  getState: () => GaitState | null;
  /** Get the current phase of the walk cycle (0-1). */
  getPhase: () => number;
  /** Reset the gait cycle. */
  reset: () => void;
}

/**
 * Props for the HeadTracker component.
 * @category Entities & Simulation
 */
export interface HeadTrackerProps {
  /** Target position or object to track. */
  target?: THREE.Vector3 | React.RefObject<THREE.Object3D>;
  /** Whether to automatically track the mouse cursor. Default: false. */
  followMouse?: boolean;
  /** Maximum rotation angle in radians. Default: PI / 3. */
  maxAngle?: number;
  /** Tracking speed multiplier. Default: 5. */
  speed?: number;
  /** Minimum angular movement to trigger update. Default: 0.01. */
  deadzone?: number;
  /** Child components. */
  children?: React.ReactNode;
}

/**
 * Ref interface for HeadTracker.
 * @category Entities & Simulation
 */
export interface HeadTrackerRef {
  /** Manually set a target position. */
  lookAt: (target: THREE.Vector3) => void;
  /** Reset to neutral orientation. */
  reset: () => void;
}

/**
 * Props for the TailPhysics component.
 * @category Entities & Simulation
 */
export interface TailPhysicsProps {
  /** Number of physics segments in the tail. */
  segmentCount: number;
  /** Length of each segment. Default: 0.3. */
  segmentLength?: number;
  /** Spring configuration for tail dynamics. */
  config?: Partial<SpringConfig>;
  /** Gravity vector applied to tail. Default: [0, -9.8, 0]. */
  gravity?: [number, number, number];
  /** Whether to render visual segment gizmos. Default: false. */
  visualize?: boolean;
  /** Color of the gizmos. Default: '#ff8844'. */
  visualColor?: string;
  /** Radius of the gizmos. Default: 0.03. */
  visualRadius?: number;
  /** Child components. */
  children?: React.ReactNode;
}

/**
 * Ref interface for TailPhysics.
 * @category Entities & Simulation
 */
export interface TailPhysicsRef {
  /** Get the array of all segment world positions. */
  getPositions: () => THREE.Vector3[];
  /** Reset the tail to its neutral position. */
  reset: () => void;
}

/**
 * Props for the BreathingAnimation component.
 * @category Entities & Simulation
 */
export interface BreathingAnimationProps {
  /** Magnitude of the breathing movement. Default: 0.02. */
  amplitude?: number;
  /** Speed of the breathing cycle in Hz. Default: 1.0. */
  frequency?: number;
  /** Target axis for movement or 'scale' for uniform scaling. Default: 'y'. */
  axis?: 'x' | 'y' | 'z' | 'scale';
  /** Child components. */
  children?: React.ReactNode;
}

/**
 * Ref interface for BreathingAnimation.
 * @category Entities & Simulation
 */
export interface BreathingAnimationRef {
  /** Pause the animation. */
  pause: () => void;
  /** Resume the animation. */
  resume: () => void;
  /** Update amplitude dynamically. */
  setAmplitude: (amplitude: number) => void;
}

/**
 * Props for the BlinkController component.
 * @category Entities & Simulation
 */
export interface BlinkControllerProps {
  /** Duration of a single blink in seconds. Default: 0.15. */
  blinkDuration?: number;
  /** Minimum time between blinks in seconds. Default: 2. */
  minInterval?: number;
  /** Maximum time between blinks in seconds. Default: 6. */
  maxInterval?: number;
  /** Reference to the left eye object. */
  leftEyeRef?: React.RefObject<THREE.Object3D>;
  /** Reference to the right eye object. */
  rightEyeRef?: React.RefObject<THREE.Object3D>;
  /** Callback fired on each blink. */
  onBlink?: () => void;
  /** Child components. */
  children?: React.ReactNode;
}

/**
 * Ref interface for BlinkController.
 * @category Entities & Simulation
 */
export interface BlinkControllerRef {
  /** Trigger a blink immediately. */
  blink: () => void;
  /** Enable or disable automatic blinking. */
  setBlinking: (enabled: boolean) => void;
}
