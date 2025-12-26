import { useFrame } from '@react-three/fiber';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import {
    ParticleEmitter as CoreParticleEmitter,
    type ParticleEmitterConfig,
} from '../../core/particles';
import type { ParticleEmitterProps, ParticleEmitterRef } from './types';
import { toVector3 } from './utils';

/**
 * GPU-Accelerated Particle Emitter.
 *
 * Efficiently creates and manages thousands of particles using GPU-instanced
 * rendering. Supports customizable shapes, physics forces, and dynamic behaviors
 * for effects like fire, smoke, and explosions.
 *
 * @category Effects & Atmosphere
 * @example
 * ```tsx
 * <ParticleEmitter
 *   position={[0, 0, 0]}
 *   startColor="orange"
 *   endColor="red"
 *   emissionRate={200}
 * />
 * ```
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
        }, [
            autoStart,
            behavior,
            blending,
            depthWrite,
            emissionRate,
            endColor,
            endOpacity,
            endSize,
            forces,
            lifetime,
            lifetimeVariance,
            maxParticles,
            position,
            positionVariance,
            shape,
            shapeParams,
            sizeVariance,
            sortParticles,
            startColor,
            startOpacity,
            startSize,
            texture,
            velocity,
            velocityVariance,
        ]);

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
                if (!emitterRef.current) {
                    throw new Error('ParticleEmitter: emitter not initialized');
                }
                return emitterRef.current;
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
