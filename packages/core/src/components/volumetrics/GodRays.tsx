/**
 * God Rays and Volumetric Lighting Components.
 *
 * @packageDocumentation
 * @module components/GodRays
 * @category Effects & Atmosphere
 *
 * ## Interactive Demos
 * - 🎮 [Live Demo](http://jonbogaty.com/nodejs-strata/demos/godrays.html)
 * - 📦 [Example Source](https://github.com/jbcom/nodejs-strata/tree/main/examples/sky-volumetrics)
 *
 * @example
 * ```tsx
 * <GodRays
 *   lightPosition={[100, 50, 0]}
 *   intensity={1.0}
 * />
 * ```
 */

import { useFrame, useThree } from '@react-three/fiber';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
  blendGodRayColors,
  calculateGodRayIntensityFromAngle,
  calculateScatteringIntensity,
  createGodRaysMaterial,
  createPointLightSphereGeometry,
  createSpotlightConeGeometry,
  createVolumetricPointLightMaterial,
  createVolumetricSpotlightMaterial,
  getLightScreenPosition,
} from '../../core/godRays';

/**
 * Props for the GodRays component.
 * @category Effects & Atmosphere
 * @interface GodRaysProps
 */
export interface GodRaysProps {
  /** World position of the light source (sun/moon). Default: [100, 50, 0]. */
  lightPosition?: THREE.Vector3 | [number, number, number];
  /** Base color of the light rays. Default: 0xffffee. */
  color?: THREE.ColorRepresentation;
  /** Overall intensity multiplier. Default: 1.0. */
  intensity?: number;
  /** How quickly rays fade with screen distance from the source. Default: 0.95. */
  decay?: number;
  /** Density/thickness of the light shafts. Default: 1.0. */
  density?: number;
  /** Number of raymarching samples. Higher = better quality. Default: 50. */
  samples?: number;
  /** Final exposure adjustment. Default: 1.0. */
  exposure?: number;
  /** Atmospheric scattering coefficient. Default: 2.0. */
  scattering?: number;
  /** Amount of noise variation in the shafts. Default: 0.3. */
  noiseFactor?: number;
  /** Whether the effect is currently enabled. Default: true. */
  enabled?: boolean;
  /** Sun altitude in degrees for automatic color/intensity shifting. */
  sunAltitude?: number;
  /** Color used for sunset/sunrise atmosphere blending. Default: 0xff9944. */
  atmosphereColor?: THREE.ColorRepresentation;
}

/**
 * Ref interface for GodRays imperative control
 * @category Effects & Atmosphere
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
 * @category Effects & Atmosphere
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
 * ```
 */
const _viewDir = new THREE.Vector3();
const _lightDir = new THREE.Vector3();
const _screenPos = new THREE.Vector2();

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
        const screenPos = getLightScreenPosition(position, camera, _screenPos);
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

    const screenPos = getLightScreenPosition(lightPos, camera, _screenPos);
    if (screenPos) {
      material.uniforms.uLightPosition.value.set(screenPos.x, screenPos.y, 0);
    }

    _viewDir.set(0, 0, -1).applyQuaternion(camera.quaternion);
    _lightDir.copy(lightPos).normalize();
    const scatterIntensity = calculateScatteringIntensity(_viewDir, _lightDir);
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
 * @category Effects & Atmosphere
 */
export const LightShafts = GodRays;

/**
 * Props for the VolumetricSpotlight component
 * @category Effects & Atmosphere
 */
export interface VolumetricSpotlightProps {
  /** Light position in world space */
  position?: THREE.Vector3 | [number, number, number];
  /** Point the light is aimed at */
  target?: THREE.Vector3 | [number, number, number];
  /** Light color */
  color?: THREE.ColorRepresentation;
  /** Light intensity */
  intensity?: number;
  /** Cone angle in radians */
  angle?: number;
  /** Soft edge falloff (0-1) */
  penumbra?: number;
  /** Light range */
  distance?: number;
  /** Amount of visible dust/fog */
  dustDensity?: number;
  /** Toggle the effect */
  enabled?: boolean;
}

/**
 * Ref interface for VolumetricSpotlight imperative control
 * @category Effects & Atmosphere
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
 * @category Effects & Atmosphere
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
 * ```
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
      const quaternion = new THREE.Quaternion().setFromUnitVectors(up, lightDir.clone().negate());
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
 * @category Effects & Atmosphere
 */
export interface VolumetricPointLightProps {
  /** Light position in world space */
  position?: THREE.Vector3 | [number, number, number];
  /** Light color */
  color?: THREE.ColorRepresentation;
  /** Light intensity */
  intensity?: number;
  /** Light influence radius */
  radius?: number;
  /** Amount of visible dust/fog */
  dustDensity?: number;
  /** Flicker animation amount (0-1) */
  flicker?: number;
  /** Toggle the effect */
  enabled?: boolean;
}

/**
 * Ref interface for VolumetricPointLight imperative control
 * @category Effects & Atmosphere
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
 * @category Effects & Atmosphere
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
 * ```
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
