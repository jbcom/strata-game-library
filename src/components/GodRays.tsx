/**
 * God Rays Components
 *
 * React components for volumetric light shafts and god rays effects.
 * Includes screen-space god rays, volumetric spotlights, and point lights.
 * @module components/GodRays
 */

import React, { useRef, useMemo, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
    createGodRaysMaterial,
    createVolumetricSpotlightMaterial,
    createVolumetricPointLightMaterial,
    createSpotlightConeGeometry,
    createPointLightSphereGeometry,
    getLightScreenPosition,
    calculateScatteringIntensity,
    calculateGodRayIntensityFromAngle,
    blendGodRayColors,
} from '../core/godRays';

/**
 * Props for the GodRays component
 *
 * @property lightPosition - Position of the light source (sun/moon)
 * @property color - Base color of the rays
 * @property intensity - Overall ray intensity
 * @property decay - How quickly rays fade with distance
 * @property density - Ray density/thickness
 * @property samples - Quality (number of raymarching samples)
 * @property exposure - Final exposure adjustment
 * @property scattering - Atmospheric scattering amount
 * @property noiseFactor - Amount of noise variation
 * @property enabled - Toggle the effect
 * @property sunAltitude - Sun angle for auto color/intensity
 * @property atmosphereColor - Color for sunset/sunrise blending
 */
export interface GodRaysProps {
    lightPosition?: THREE.Vector3 | [number, number, number];
    color?: THREE.ColorRepresentation;
    intensity?: number;
    decay?: number;
    density?: number;
    samples?: number;
    exposure?: number;
    scattering?: number;
    noiseFactor?: number;
    enabled?: boolean;
    sunAltitude?: number;
    atmosphereColor?: THREE.ColorRepresentation;
}

/**
 * Ref interface for GodRays imperative control
 */
export interface GodRaysRef {
    material: THREE.ShaderMaterial | null;
    setIntensity: (intensity: number) => void;
    setLightPosition: (position: THREE.Vector3) => void;
}

/**
 * Screen-space god rays effect for dramatic light shafts.
 * Automatically handles sun position and atmospheric scattering.
 *
 * @example
 * ```tsx
 * // Basic sun rays
 * <GodRays
 *   lightPosition={[100, 50, 0]}
 *   intensity={0.8}
 * />
 *
 * // Sunset god rays with atmosphere
 * <GodRays
 *   lightPosition={sunPosition}
 *   sunAltitude={15}
 *   atmosphereColor={0xff6622}
 *   intensity={1.2}
 *   density={1.5}
 * />
 *
 * // High quality moonlight rays
 * <GodRays
 *   lightPosition={moonPosition}
 *   color={0xccddff}
 *   intensity={0.4}
 *   samples={80}
 *   decay={0.98}
 * />
 * ```
 *
 * @param props - GodRaysProps configuration
 * @returns React element containing the god rays effect
 */
export const GodRays = forwardRef<GodRaysRef, GodRaysProps>(function GodRays(
    {
        lightPosition = new THREE.Vector3(100, 50, 0),
        color = 0xffffee,
        intensity = 1.0,
        decay = 0.95,
        density = 1.0,
        samples = 50,
        exposure = 1.0,
        scattering = 2.0,
        noiseFactor = 0.3,
        enabled = true,
        sunAltitude,
        atmosphereColor = 0xff9944,
    },
    ref
) {
    const meshRef = useRef<THREE.Mesh>(null);
    const { camera } = useThree();

    const lightPos = useMemo(() => {
        if (Array.isArray(lightPosition)) {
            return new THREE.Vector3(...lightPosition);
        }
        return lightPosition.clone();
    }, [lightPosition]);

    const lightColor = useMemo(() => new THREE.Color(color), [color]);
    const atmColor = useMemo(() => new THREE.Color(atmosphereColor), [atmosphereColor]);

    const effectiveIntensity = useMemo(() => {
        if (sunAltitude !== undefined) {
            return calculateGodRayIntensityFromAngle(sunAltitude, intensity);
        }
        return intensity;
    }, [sunAltitude, intensity]);

    const effectiveColor = useMemo(() => {
        if (sunAltitude !== undefined) {
            return blendGodRayColors(lightColor, atmColor, sunAltitude);
        }
        return lightColor;
    }, [sunAltitude, lightColor, atmColor]);

    const material = useMemo(() => {
        return createGodRaysMaterial({
            lightPosition: lightPos,
            lightColor: effectiveColor,
            intensity: effectiveIntensity,
            decay,
            density,
            samples,
            exposure,
            scattering,
            noiseFactor,
        });
    }, [
        lightPos,
        effectiveColor,
        effectiveIntensity,
        decay,
        density,
        samples,
        exposure,
        scattering,
        noiseFactor,
    ]);

    useImperativeHandle(
        ref,
        () => ({
            material,
            setIntensity: (newIntensity: number) => {
                if (material.uniforms.uIntensity) {
                    material.uniforms.uIntensity.value = newIntensity;
                }
            },
            setLightPosition: (position: THREE.Vector3) => {
                const screenPos = getLightScreenPosition(position, camera, new THREE.Vector2(1, 1));
                if (screenPos && material.uniforms.uLightPosition) {
                    material.uniforms.uLightPosition.value.set(screenPos.x, screenPos.y, 0);
                }
            },
        }),
        [material, camera]
    );

    useFrame((state) => {
        if (!enabled || !material.uniforms) return;

        material.uniforms.uTime.value = state.clock.elapsedTime;

        const screenPos = getLightScreenPosition(lightPos, camera, new THREE.Vector2(1, 1));
        if (screenPos) {
            material.uniforms.uLightPosition.value.set(screenPos.x, screenPos.y, 0);
        }

        const viewDir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
        const lightDir = lightPos.clone().normalize();
        const scatterIntensity = calculateScatteringIntensity(viewDir, lightDir);
        material.uniforms.uIntensity.value = effectiveIntensity * scatterIntensity;
    });

    useEffect(() => {
        return () => {
            material.dispose();
        };
    }, [material]);

    if (!enabled) return null;

    return (
        <mesh ref={meshRef} renderOrder={998}>
            <planeGeometry args={[2, 2]} />
            <primitive object={material} attach="material" />
        </mesh>
    );
});

/**
 * Alias for GodRays - alternative naming convention
 */
export const LightShafts = GodRays;

/**
 * Props for the VolumetricSpotlight component
 *
 * @property position - Light position in world space
 * @property target - Point the light is aimed at
 * @property color - Light color
 * @property intensity - Light intensity
 * @property angle - Cone angle in radians
 * @property penumbra - Soft edge falloff (0-1)
 * @property distance - Light range
 * @property dustDensity - Amount of visible dust/fog
 * @property enabled - Toggle the effect
 */
export interface VolumetricSpotlightProps {
    position?: THREE.Vector3 | [number, number, number];
    target?: THREE.Vector3 | [number, number, number];
    color?: THREE.ColorRepresentation;
    intensity?: number;
    angle?: number;
    penumbra?: number;
    distance?: number;
    dustDensity?: number;
    enabled?: boolean;
}

/**
 * Ref interface for VolumetricSpotlight imperative control
 */
export interface VolumetricSpotlightRef {
    material: THREE.ShaderMaterial | null;
    mesh: THREE.Mesh | null;
    setIntensity: (intensity: number) => void;
}

/**
 * Volumetric spotlight with visible light cone in dusty/foggy environments.
 * Great for dramatic stage lighting, flashlights, and searchlights.
 *
 * @example
 * ```tsx
 * // Stage spotlight
 * <VolumetricSpotlight
 *   position={[0, 10, 0]}
 *   target={[0, 0, 0]}
 *   color={0xffffff}
 *   intensity={1.5}
 *   angle={Math.PI / 8}
 *   dustDensity={0.6}
 * />
 *
 * // Colored dramatic lighting
 * <VolumetricSpotlight
 *   position={[5, 8, 5]}
 *   target={[0, 1, 0]}
 *   color={0xff4400}
 *   intensity={2}
 *   penumbra={0.3}
 * />
 *
 * // Flashlight beam
 * <VolumetricSpotlight
 *   position={playerPosition}
 *   target={aimTarget}
 *   angle={Math.PI / 12}
 *   distance={20}
 *   dustDensity={0.3}
 * />
 * ```
 *
 * @param props - VolumetricSpotlightProps configuration
 * @returns React element containing the volumetric spotlight
 */
export const VolumetricSpotlight = forwardRef<VolumetricSpotlightRef, VolumetricSpotlightProps>(
    function VolumetricSpotlight(
        {
            position = [0, 5, 0],
            target = [0, 0, 0],
            color = 0xffffff,
            intensity = 1.0,
            angle = Math.PI / 6,
            penumbra = 0.1,
            distance = 10,
            dustDensity = 0.5,
            enabled = true,
        },
        ref
    ) {
        const meshRef = useRef<THREE.Mesh>(null);

        const lightPos = useMemo(() => {
            if (Array.isArray(position)) {
                return new THREE.Vector3(...position);
            }
            return position.clone();
        }, [position]);

        const targetPos = useMemo(() => {
            if (Array.isArray(target)) {
                return new THREE.Vector3(...target);
            }
            return target.clone();
        }, [target]);

        const lightDir = useMemo(() => {
            return new THREE.Vector3().subVectors(targetPos, lightPos).normalize();
        }, [lightPos, targetPos]);

        const lightColor = useMemo(() => new THREE.Color(color), [color]);

        const material = useMemo(() => {
            return createVolumetricSpotlightMaterial({
                lightPosition: lightPos,
                lightDirection: lightDir,
                lightColor,
                intensity,
                angle,
                penumbra,
                distance,
                dustDensity,
            });
        }, [lightPos, lightDir, lightColor, intensity, angle, penumbra, distance, dustDensity]);

        const geometry = useMemo(() => {
            return createSpotlightConeGeometry(angle, distance);
        }, [angle, distance]);

        const rotation = useMemo(() => {
            const up = new THREE.Vector3(0, 1, 0);
            const quaternion = new THREE.Quaternion().setFromUnitVectors(
                up,
                lightDir.clone().negate()
            );
            const euler = new THREE.Euler().setFromQuaternion(quaternion);
            return euler;
        }, [lightDir]);

        useImperativeHandle(
            ref,
            () => ({
                material,
                mesh: meshRef.current,
                setIntensity: (newIntensity: number) => {
                    if (material.uniforms.uIntensity) {
                        material.uniforms.uIntensity.value = newIntensity;
                    }
                },
            }),
            [material]
        );

        useFrame((state) => {
            if (!enabled || !material.uniforms) return;
            material.uniforms.uTime.value = state.clock.elapsedTime;
        });

        useEffect(() => {
            return () => {
                material.dispose();
                geometry.dispose();
            };
        }, [material, geometry]);

        if (!enabled) return null;

        return (
            <mesh
                ref={meshRef}
                position={lightPos}
                rotation={rotation}
                geometry={geometry}
                material={material}
            />
        );
    }
);

/**
 * Props for the VolumetricPointLight component
 *
 * @property position - Light position in world space
 * @property color - Light color
 * @property intensity - Light intensity
 * @property radius - Light influence radius
 * @property dustDensity - Amount of visible dust/fog
 * @property flicker - Flicker animation amount (0-1)
 * @property enabled - Toggle the effect
 */
export interface VolumetricPointLightProps {
    position?: THREE.Vector3 | [number, number, number];
    color?: THREE.ColorRepresentation;
    intensity?: number;
    radius?: number;
    dustDensity?: number;
    flicker?: number;
    enabled?: boolean;
}

/**
 * Ref interface for VolumetricPointLight imperative control
 */
export interface VolumetricPointLightRef {
    material: THREE.ShaderMaterial | null;
    mesh: THREE.Mesh | null;
    setIntensity: (intensity: number) => void;
}

/**
 * Volumetric point light with visible glow sphere for atmospheric effects.
 * Perfect for torches, lanterns, and magical light sources.
 *
 * @example
 * ```tsx
 * // Torch light
 * <VolumetricPointLight
 *   position={[0, 2, 0]}
 *   color={0xffaa44}
 *   intensity={1.5}
 *   radius={5}
 *   flicker={0.3}
 * />
 *
 * // Magical orb
 * <VolumetricPointLight
 *   position={orbPosition}
 *   color={0x44aaff}
 *   intensity={2}
 *   radius={3}
 *   dustDensity={0.8}
 * />
 *
 * // Campfire glow
 * <VolumetricPointLight
 *   position={[0, 0.5, 0]}
 *   color={0xff6600}
 *   intensity={1.8}
 *   radius={8}
 *   flicker={0.5}
 *   dustDensity={0.4}
 * />
 * ```
 *
 * @param props - VolumetricPointLightProps configuration
 * @returns React element containing the volumetric point light
 */
export const VolumetricPointLight = forwardRef<VolumetricPointLightRef, VolumetricPointLightProps>(
    function VolumetricPointLight(
        {
            position = [0, 2, 0],
            color = 0xffaa66,
            intensity = 1.0,
            radius = 5,
            dustDensity = 0.5,
            flicker = 0,
            enabled = true,
        },
        ref
    ) {
        const meshRef = useRef<THREE.Mesh>(null);

        const lightPos = useMemo(() => {
            if (Array.isArray(position)) {
                return new THREE.Vector3(...position);
            }
            return position.clone();
        }, [position]);

        const lightColor = useMemo(() => new THREE.Color(color), [color]);

        const material = useMemo(() => {
            return createVolumetricPointLightMaterial({
                lightPosition: lightPos,
                lightColor,
                intensity,
                radius,
                dustDensity,
                flicker,
            });
        }, [lightPos, lightColor, intensity, radius, dustDensity, flicker]);

        const geometry = useMemo(() => {
            return createPointLightSphereGeometry(radius);
        }, [radius]);

        useImperativeHandle(
            ref,
            () => ({
                material,
                mesh: meshRef.current,
                setIntensity: (newIntensity: number) => {
                    if (material.uniforms.uIntensity) {
                        material.uniforms.uIntensity.value = newIntensity;
                    }
                },
            }),
            [material]
        );

        useFrame((state) => {
            if (!enabled || !material.uniforms) return;
            material.uniforms.uTime.value = state.clock.elapsedTime;
        });

        useEffect(() => {
            return () => {
                material.dispose();
                geometry.dispose();
            };
        }, [material, geometry]);

        if (!enabled) return null;

        return <mesh ref={meshRef} position={lightPos} geometry={geometry} material={material} />;
    }
);
