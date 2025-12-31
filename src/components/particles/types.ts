import type * as THREE from 'three';
import type {
    ParticleEmitter as CoreParticleEmitter,
    EmissionShape,
    EmitterShapeParams,
    ParticleBehavior,
    ParticleForces,
} from '../../core/particles';

/**
 * Props for the ParticleEmitter component.
 * @category Effects & Atmosphere
 */
export interface ParticleEmitterProps {
    /** Emitter position in world space. Default: [0, 0, 0]. */
    position?: [number, number, number] | THREE.Vector3;
    /** Random variance applied to particle spawn positions. Default: [0, 0, 0]. */
    positionVariance?: [number, number, number] | THREE.Vector3;
    /** Initial velocity direction and speed for particles. Default: [0, 1, 0]. */
    velocity?: [number, number, number] | THREE.Vector3;
    /** Random variance applied to initial particle velocity. Default: [0.5, 0.5, 0.5]. */
    velocityVariance?: [number, number, number] | THREE.Vector3;
    /** Maximum number of simultaneous particles in the system. Default: 1000. */
    maxParticles?: number;
    /** Number of particles emitted per second. Default: 100. */
    emissionRate?: number;
    /** Base lifetime of a particle in seconds. Default: 2.0. */
    lifetime?: number;
    /** Random variance applied to particle lifetime. Default: 0.2. */
    lifetimeVariance?: number;
    /** Initial color of particles at spawn. Default: white. */
    startColor?: THREE.ColorRepresentation;
    /** Final color of particles before death. Default: white. */
    endColor?: THREE.ColorRepresentation;
    /** Initial size of particles at spawn. Default: 0.1. */
    startSize?: number;
    /** Final size of particles before death. Default: 0.05. */
    endSize?: number;
    /** Random variance applied to particle size. Default: 0.2. */
    sizeVariance?: number;
    /** Initial opacity of particles at spawn (0-1). Default: 1.0. */
    startOpacity?: number;
    /** Final opacity of particles before death (0-1). Default: 0.0. */
    endOpacity?: number;
    /** Shape of the emission volume ('point', 'sphere', 'box', 'cone', 'disk'). Default: 'point'. */
    shape?: EmissionShape;
    /** Specific parameters for the chosen emission shape (e.g., radius, angle). */
    shapeParams?: EmitterShapeParams;
    /** External physics forces like gravity, wind, or turbulence. */
    forces?: ParticleForces;
    /** Behavioral modifiers like attraction or color pulsing. */
    behavior?: ParticleBehavior;
    /** Optional texture for particle sprites. */
    texture?: THREE.Texture;
    /** GPU blending mode for particles. Default: AdditiveBlending. */
    blending?: THREE.Blending;
    /** Whether particles should write to the depth buffer. Default: false. */
    depthWrite?: boolean;
    /** Whether to sort particles by distance for correct transparency. Default: false. */
    sortParticles?: boolean;
    /** Whether to start emitting particles immediately on mount. Default: true. */
    autoStart?: boolean;
    /** Whether emission is currently paused. Default: false. */
    paused?: boolean;
}

/**
 * Ref interface for imperative control of the ParticleEmitter.
 * @category Effects & Atmosphere
 */
export interface ParticleEmitterRef {
    /** Access to the underlying core emitter instance. */
    emitter: CoreParticleEmitter;
    /** Emit a specific number of particles immediately. */
    emit: (count: number) => void;
    /** Emit a burst of particles instantly. */
    burst: (count: number) => void;
    /** Reset the entire system, clearing all active particles. */
    reset: () => void;
    /** Update the emitter's world position. */
    setPosition: (position: THREE.Vector3) => void;
    /** Dynamically update the emission rate. */
    setEmissionRate: (rate: number) => void;
}

/**
 * Props for the ParticleBurst component.
 * @category Effects & Atmosphere
 */
export interface ParticleBurstProps
    extends Omit<ParticleEmitterProps, 'emissionRate' | 'autoStart'> {
    /** Number of particles to emit in the burst. Default: 100. */
    count?: number;
    /** When this value changes to truthy, a burst is triggered. */
    trigger?: boolean | number;
    /** Callback fired when all particles from the burst have died. */
    onComplete?: () => void;
}

export type { EmissionShape, ParticleForces, ParticleBehavior, EmitterShapeParams };
