/**
 * Type definitions for XState-based animation state machines.
 *
 * Provides strongly-typed configurations for animation states, transitions,
 * blend trees, and cross-fade timing that integrate with @react-three/drei.
 *
 * @module core/animation/state-machine
 */

/**
 * Supported animation state names for common game character states.
 */
export type AnimationStateName =
  | 'idle'
  | 'walk'
  | 'run'
  | 'jump'
  | 'fall'
  | 'land'
  | 'attack'
  | 'death'
  | 'hit'
  | 'dodge'
  | 'crouch'
  | 'swim'
  | 'climb'
  | string;

/**
 * Configuration for a single animation state.
 *
 * @example
 * ```typescript
 * const idleState: AnimationStateConfig = {
 *   name: 'idle',
 *   animation: 'Idle',
 *   loop: true,
 *   blendWeight: 1.0,
 *   speed: 1.0
 * };
 * ```
 */
export interface AnimationStateConfig {
  /** Unique identifier for this state */
  name: AnimationStateName;
  /** Animation clip name to play */
  animation: string;
  /** Whether the animation should loop */
  loop?: boolean;
  /** Blend weight for this animation (0-1) */
  blendWeight?: number;
  /** Playback speed multiplier */
  speed?: number;
  /** Cross-fade duration in seconds when entering this state */
  crossFadeDuration?: number;
  /** Callback when animation completes (non-looping only) */
  onComplete?: () => void;
}

/**
 * Context stored within the animation state machine.
 *
 * @example
 * ```typescript
 * const context: AnimationContext = {
 *   currentAnimation: 'idle',
 *   previousAnimation: null,
 *   blendFactor: 0,
 *   playbackSpeed: 1.0,
 *   timeInState: 0
 * };
 * ```
 */
export interface AnimationContext {
  /** Currently playing animation name */
  currentAnimation: string;
  /** Previously played animation for blending */
  previousAnimation: string | null;
  /** Blend factor between previous and current (0-1) */
  blendFactor: number;
  /** Global playback speed multiplier */
  playbackSpeed: number;
  /** Time elapsed in current state (seconds) */
  timeInState: number;
  /** Whether animation is currently paused */
  isPaused: boolean;
  /** Custom data for user extensions */
  metadata?: Record<string, unknown>;
}

/**
 * Events that can be sent to the animation state machine.
 */
export type AnimationEvent =
  | { type: 'PLAY'; animation: string }
  | { type: 'STOP' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'SET_SPEED'; speed: number }
  | { type: 'TICK'; delta: number }
  | { type: 'ANIMATION_COMPLETE' }
  | { type: 'TRANSITION'; target: AnimationStateName }
  | { type: 'BLEND'; target: AnimationStateName; duration: number };

/**
 * Configuration for a transition between animation states.
 *
 * @example
 * ```typescript
 * const walkToRun: AnimationTransitionConfig = {
 *   from: 'walk',
 *   to: 'run',
 *   event: 'SPEED_UP',
 *   condition: (ctx) => ctx.playbackSpeed > 0.8,
 *   crossFadeDuration: 0.2
 * };
 * ```
 */
export interface AnimationTransitionConfig {
  /** Source state name */
  from: AnimationStateName;
  /** Target state name */
  to: AnimationStateName;
  /** Event that triggers this transition */
  event: string;
  /** Optional guard condition */
  condition?: (context: AnimationContext) => boolean;
  /** Cross-fade duration in seconds */
  crossFadeDuration?: number;
}

/**
 * Configuration for blend tree nodes.
 *
 * @example
 * ```typescript
 * const locomotionBlend: BlendTreeConfig = {
 *   type: '1d',
 *   parameter: 'speed',
 *   nodes: [
 *     { animation: 'idle', threshold: 0 },
 *     { animation: 'walk', threshold: 0.5 },
 *     { animation: 'run', threshold: 1.0 }
 *   ]
 * };
 * ```
 */
export interface BlendTreeConfig {
  /** Blend tree type */
  type: '1d' | '2d' | 'direct';
  /** Parameter name controlling the blend */
  parameter: string;
  /** Secondary parameter for 2D blends */
  secondaryParameter?: string;
  /** Nodes in the blend tree */
  nodes: BlendTreeNode[];
}

/**
 * A single node in a blend tree.
 */
export interface BlendTreeNode {
  /** Animation clip name */
  animation: string;
  /** Threshold value for 1D blends */
  threshold?: number;
  /** Position for 2D blends */
  position?: { x: number; y: number };
  /** Speed multiplier for this node */
  speed?: number;
}

/**
 * Configuration for creating an animation state machine.
 *
 * @example
 * ```typescript
 * const config: AnimationMachineConfig = {
 *   id: 'character-animation',
 *   initial: 'idle',
 *   states: {
 *     idle: { animation: 'Idle', loop: true },
 *     walk: { animation: 'Walk', loop: true, speed: 1.0 },
 *     run: { animation: 'Run', loop: true, speed: 1.2 }
 *   },
 *   transitions: [
 *     { from: 'idle', to: 'walk', event: 'MOVE' },
 *     { from: 'walk', to: 'run', event: 'SPRINT' }
 *   ]
 * };
 * ```
 */
export interface AnimationMachineConfig {
  /** Unique machine identifier */
  id: string;
  /** Initial state name */
  initial: AnimationStateName;
  /** Map of state names to configurations */
  states: Record<AnimationStateName, Omit<AnimationStateConfig, 'name'>>;
  /** Transition definitions */
  transitions?: AnimationTransitionConfig[];
  /** Default cross-fade duration for all transitions */
  defaultCrossFadeDuration?: number;
  /** Blend tree configurations by name */
  blendTrees?: Record<string, BlendTreeConfig>;
}

/**
 * Result of blend weight calculations.
 */
export interface BlendWeights {
  /** Weights keyed by animation name */
  weights: Record<string, number>;
  /** Whether any animations are active */
  hasActiveAnimations: boolean;
}

/**
 * Options for the useAnimationMachine hook.
 *
 * @example
 * ```typescript
 * const options: UseAnimationMachineOptions = {
 *   autoPlay: true,
 *   initialSpeed: 1.0,
 *   onStateChange: (state) => console.log('State:', state)
 * };
 * ```
 */
export interface UseAnimationMachineOptions {
  /** Automatically start playing initial animation */
  autoPlay?: boolean;
  /** Initial playback speed */
  initialSpeed?: number;
  /** Callback when state changes */
  onStateChange?: (state: AnimationStateName) => void;
  /** Callback when animation completes */
  onAnimationComplete?: (animation: string) => void;
}

/**
 * Options for the useAnimationBlend hook.
 */
export interface UseAnimationBlendOptions {
  /** Default blend duration in seconds */
  defaultDuration?: number;
  /** Easing function for blend transitions */
  easing?: (t: number) => number;
}

/**
 * Return type for useAnimationMachine hook.
 */
export interface AnimationMachineReturn {
  /** Current state name */
  currentState: AnimationStateName;
  /** Current animation context */
  context: AnimationContext;
  /** Send an event to the machine */
  send: (event: AnimationEvent) => void;
  /** Transition to a specific state */
  transitionTo: (state: AnimationStateName, duration?: number) => void;
  /** Check if machine is in a specific state */
  isInState: (state: AnimationStateName) => boolean;
  /** Pause the current animation */
  pause: () => void;
  /** Resume the current animation */
  resume: () => void;
  /** Set playback speed */
  setSpeed: (speed: number) => void;
}

/**
 * Return type for useAnimationBlend hook.
 */
export interface AnimationBlendReturn {
  /** Current blend weights for all animations */
  weights: BlendWeights;
  /** Blend to a target animation */
  blendTo: (animation: string, duration?: number) => void;
  /** Set blend tree parameter */
  setParameter: (name: string, value: number) => void;
  /** Get current parameter value */
  getParameter: (name: string) => number;
  /** Update blend tree weights based on parameters */
  updateWeights: () => void;
}
