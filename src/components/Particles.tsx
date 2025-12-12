/**
 * GPU-Based Particle System React Components
 *
 * Provides React components for particle effects using GPU-instanced rendering.
 * @module components/Particles
 */

import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
    ParticleEmitter as CoreParticleEmitter,
    ParticleEmitterConfig,
    EmissionShape,
    ParticleForces,
    ParticleBehavior,
    EmitterShapeParams,
} from '../core/particles';

export type { EmissionShape, ParticleForces, ParticleBehavior, EmitterShapeParams };

/**
 * Props for the ParticleEmitter component
 *
 * @property position - Emitter position in world space
 * @property positionVariance - Random variance applied to particle spawn positions
 * @property velocity - Initial velocity direction and speed
 * @property velocityVariance - Random variance applied to initial velocity
 * @property maxParticles - Maximum number of particles in the system
 * @property emissionRate - Particles emitted per second
 * @property lifetime - Base particle lifetime in seconds
 * @property lifetimeVariance - Random variance applied to lifetime
 * @property startColor - Particle color at spawn
 * @property endColor - Particle color at death
 * @property startSize - Particle size at spawn
 * @property endSize - Particle size at death
 * @property sizeVariance - Random variance applied to size
 * @property startOpacity - Opacity at spawn
 * @property endOpacity - Opacity at death
 * @property shape - Emission shape ('point', 'sphere', 'box', 'cone', 'disk')
 * @property shapeParams - Parameters for the emission shape
 * @property forces - Physics forces (gravity, wind, turbulence)
 * @property behavior - Particle behavior modifiers
 * @property texture - Optional texture for particle sprites
 * @property blending - Blend mode for particles
 * @property depthWrite - Whether particles write to depth buffer
 * @property sortParticles - Whether to sort particles by depth
 * @property autoStart - Start emitting immediately
 * @property paused - Pause particle emission
 */
export interface ParticleEmitterProps {
    position?: [number, number, number] | THREE.Vector3;
    positionVariance?: [number, number, number] | THREE.Vector3;
    velocity?: [number, number, number] | THREE.Vector3;
    velocityVariance?: [number, number, number] | THREE.Vector3;
    maxParticles?: number;
    emissionRate?: number;
    lifetime?: number;
    lifetimeVariance?: number;
    startColor?: THREE.ColorRepresentation;
    endColor?: THREE.ColorRepresentation;
    startSize?: number;
    endSize?: number;
    sizeVariance?: number;
    startOpacity?: number;
    endOpacity?: number;
    shape?: EmissionShape;
    shapeParams?: EmitterShapeParams;
    forces?: ParticleForces;
    behavior?: ParticleBehavior;
    texture?: THREE.Texture;
    blending?: THREE.Blending;
    depthWrite?: boolean;
    sortParticles?: boolean;
    autoStart?: boolean;
    paused?: boolean;
}

/**
 * Ref interface for imperative ParticleEmitter control
 *
 * @property emitter - The underlying core emitter instance
 * @property emit - Emit a specific number of particles
 * @property burst - Emit a burst of particles instantly
 * @property reset - Reset the emitter, clearing all particles
 * @property setPosition - Update emitter position
 * @property setEmissionRate - Update emission rate
 */
export interface ParticleEmitterRef {
    emitter: CoreParticleEmitter;
    emit: (count: number) => void;
    burst: (count: number) => void;
    reset: () => void;
    setPosition: (position: THREE.Vector3) => void;
    setEmissionRate: (rate: number) => void;
}

function toVector3(
    value: [number, number, number] | THREE.Vector3 | undefined,
    defaultValue: THREE.Vector3
): THREE.Vector3 {
    if (!value) return defaultValue;
    if (value instanceof THREE.Vector3) return value.clone();
    return new THREE.Vector3(value[0], value[1], value[2]);
}

/**
 * GPU-accelerated particle emitter component for creating particle effects.
 * Uses instanced rendering for high performance with thousands of particles.
 *
 * @example
 * ```tsx
 * // Basic fire effect
 * <ParticleEmitter
 *   position={[0, 0, 0]}
 *   velocity={[0, 2, 0]}
 *   startColor={0xff4400}
 *   endColor={0xff0000}
 *   startSize={0.3}
 *   endSize={0.05}
 *   lifetime={1.5}
 *   emissionRate={100}
 * />
 *
 * // With forces and custom shape
 * <ParticleEmitter
 *   shape="cone"
 *   shapeParams={{ radius: 1, angle: 45 }}
 *   forces={{ gravity: [0, -9.8, 0], wind: [1, 0, 0] }}
 *   maxParticles={5000}
 * />
 * ```
 *
 * @param props - ParticleEmitterProps configuration
 * @returns React element containing the particle system
 */
export const ParticleEmitter = forwardRef<ParticleEmitterRef, ParticleEmitterProps>(
    (
        {
            position = [0, 0, 0],
            positionVariance,
            velocity = [0, 1, 0],
            velocityVariance,
            maxParticles = 1000,
            emissionRate = 100,
            lifetime = 2.0,
            lifetimeVariance = 0.2,
            startColor = 0xffffff,
            endColor = 0xffffff,
            startSize = 0.1,
            endSize = 0.05,
            sizeVariance = 0.2,
            startOpacity = 1.0,
            endOpacity = 0.0,
            shape = 'point',
            shapeParams,
            forces,
            behavior,
            texture,
            blending = THREE.AdditiveBlending,
            depthWrite = false,
            sortParticles = false,
            autoStart = true,
            paused = false,
        },
        ref
    ) => {
        const emitterRef = useRef<CoreParticleEmitter | null>(null);
        const groupRef = useRef<THREE.Group>(null);

        useEffect(() => {
            const config: ParticleEmitterConfig = {
                maxParticles,
                emissionRate: autoStart ? emissionRate : 0,
                lifetime,
                lifetimeVariance,
                position: toVector3(position, new THREE.Vector3(0, 0, 0)),
                positionVariance: toVector3(positionVariance, new THREE.Vector3(0, 0, 0)),
                velocity: toVector3(velocity, new THREE.Vector3(0, 1, 0)),
                velocityVariance: toVector3(velocityVariance, new THREE.Vector3(0.5, 0.5, 0.5)),
                startColor,
                endColor,
                startSize,
                endSize,
                sizeVariance,
                startOpacity,
                endOpacity,
                shape,
                shapeParams: shapeParams
                    ? {
                          ...shapeParams,
                          direction:
                              shapeParams.direction instanceof THREE.Vector3
                                  ? shapeParams.direction
                                  : shapeParams.direction
                                    ? new THREE.Vector3(
                                          ...(shapeParams.direction as unknown as [
                                              number,
                                              number,
                                              number,
                                          ])
                                      )
                                    : undefined,
                      }
                    : undefined,
                forces: forces
                    ? {
                          ...forces,
                          gravity:
                              forces.gravity instanceof THREE.Vector3
                                  ? forces.gravity
                                  : forces.gravity
                                    ? new THREE.Vector3(
                                          ...(forces.gravity as unknown as [number, number, number])
                                      )
                                    : undefined,
                          wind:
                              forces.wind instanceof THREE.Vector3
                                  ? forces.wind
                                  : forces.wind
                                    ? new THREE.Vector3(
                                          ...(forces.wind as unknown as [number, number, number])
                                      )
                                    : undefined,
                      }
                    : undefined,
                behavior,
                texture,
                blending,
                depthWrite,
                sortParticles,
            };

            const emitter = new CoreParticleEmitter(config);
            emitterRef.current = emitter;

            if (groupRef.current) {
                groupRef.current.add(emitter.mesh);
            }

            return () => {
                if (groupRef.current && emitter.mesh.parent === groupRef.current) {
                    groupRef.current.remove(emitter.mesh);
                }
                emitter.dispose();
            };
        }, []);

        useEffect(() => {
            if (emitterRef.current) {
                emitterRef.current.setEmissionRate(paused ? 0 : emissionRate);
            }
        }, [paused, emissionRate]);

        useEffect(() => {
            if (emitterRef.current) {
                emitterRef.current.setPosition(toVector3(position, new THREE.Vector3(0, 0, 0)));
            }
        }, [position]);

        useImperativeHandle(ref, () => ({
            get emitter() {
                return emitterRef.current!;
            },
            emit(count: number) {
                emitterRef.current?.emit(count);
            },
            burst(count: number) {
                emitterRef.current?.burst(count);
            },
            reset() {
                emitterRef.current?.reset();
            },
            setPosition(pos: THREE.Vector3) {
                emitterRef.current?.setPosition(pos);
            },
            setEmissionRate(rate: number) {
                emitterRef.current?.setEmissionRate(rate);
            },
        }));

        useFrame((_, delta) => {
            if (emitterRef.current && !paused) {
                emitterRef.current.update(delta);
            }
        });

        return <group ref={groupRef} />;
    }
);

ParticleEmitter.displayName = 'ParticleEmitter';

/**
 * Props for the ParticleBurst component
 *
 * @property count - Number of particles to emit per burst
 * @property trigger - When changed to truthy value, triggers a burst
 * @property onComplete - Callback fired when burst particles have all died
 */
export interface ParticleBurstProps extends Omit<
    ParticleEmitterProps,
    'emissionRate' | 'autoStart'
> {
    count?: number;
    trigger?: boolean | number;
    onComplete?: () => void;
}

/**
 * Particle burst component for one-shot particle effects.
 * Useful for explosions, impacts, and other instantaneous effects.
 *
 * @example
 * ```tsx
 * // Explosion effect triggered by state
 * const [explode, setExplode] = useState(false);
 *
 * <ParticleBurst
 *   trigger={explode}
 *   count={200}
 *   position={hitPosition}
 *   velocity={[0, 5, 0]}
 *   velocityVariance={[3, 3, 3]}
 *   startColor={0xffff00}
 *   endColor={0xff0000}
 *   lifetime={0.8}
 *   onComplete={() => setExplode(false)}
 * />
 *
 * // Multiple bursts with unique keys
 * <ParticleBurst
 *   trigger={burstCount}
 *   count={50}
 *   shape="sphere"
 * />
 * ```
 *
 * @param props - ParticleBurstProps configuration
 * @returns React element containing the burst particle system
 */
export const ParticleBurst = forwardRef<ParticleEmitterRef, ParticleBurstProps>(
    ({ count = 100, trigger = false, onComplete, ...props }, ref) => {
        const emitterRef = useRef<ParticleEmitterRef>(null);
        const lastTrigger = useRef<boolean | number>(false);

        useImperativeHandle(ref, () => emitterRef.current!);

        useEffect(() => {
            if (trigger !== lastTrigger.current && trigger) {
                emitterRef.current?.burst(count);
                lastTrigger.current = trigger;
            }
        }, [trigger, count]);

        return <ParticleEmitter ref={emitterRef} {...props} emissionRate={0} autoStart={false} />;
    }
);

ParticleBurst.displayName = 'ParticleBurst';
