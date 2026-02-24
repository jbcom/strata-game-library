import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { createVolumetricCloudGeometry, createVolumetricCloudMaterial } from '../../core/clouds';
import type { VolumetricCloudsProps } from './types';

/**
 * Volumetric Cloud Dome.
 *
 * Renders a full 3D cloud volume surrounding the viewer using GPU-accelerated
 * raymarching. Supports internal light scattering, self-shadowing, and wind.
 *
 * @category World Building
 * @example
 * ```tsx
 * <VolumetricClouds
 *   cloudBase={80}
 *   cloudHeight={100}
 *   coverage={0.5}
 * />
 * ```
 */
export function VolumetricClouds({
  cloudBase = 50,
  cloudHeight = 50,
  coverage = 0.5,
  density = 1.0,
  cloudColor = new THREE.Color(1, 1, 1),
  shadowColor = new THREE.Color(0.6, 0.65, 0.75),
  wind: windProp = {},
  dayNight: dayNightProp = {},
  steps = 32,
  lightSteps = 4,
  radius = 500,
}: VolumetricCloudsProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const windConfig = useMemo(
    () => ({
      direction: new THREE.Vector2(1, 0),
      speed: 0.01,
      ...windProp,
    }),
    [windProp]
  );

  const dayNightConfig = useMemo(
    () => ({
      sunIntensity: 1.0,
      sunAngle: 60,
      sunColor: new THREE.Color(1, 0.95, 0.8),
      ...dayNightProp,
    }),
    [dayNightProp]
  );

  const material = useMemo(() => {
    return createVolumetricCloudMaterial({
      cloudBase,
      cloudHeight,
      coverage,
      density,
      cloudColor,
      shadowColor,
      wind: windConfig,
      dayNight: dayNightConfig,
      steps,
      lightSteps,
    });
  }, [
    cloudBase,
    cloudHeight,
    coverage,
    density,
    cloudColor,
    shadowColor,
    windConfig,
    dayNightConfig,
    steps,
    lightSteps,
  ]);

  const geometry = useMemo(() => {
    return createVolumetricCloudGeometry(radius);
  }, [radius]);

  useFrame((state) => {
    if (meshRef.current && material.uniforms) {
      material.uniforms.uTime.value = state.clock.elapsedTime;
      material.uniforms.uSunIntensity.value = dayNightConfig.sunIntensity;
      material.uniforms.uSunAngle.value = dayNightConfig.sunAngle;
      material.uniforms.uSunColor.value = dayNightConfig.sunColor;
    }
  });

  useEffect(() => {
    return () => {
      material.dispose();
      geometry.dispose();
    };
  }, [material, geometry]);

  return (
    <mesh ref={meshRef as any} geometry={geometry as any} renderOrder={-2}>
      <primitive object={material} attach="material" />
    </mesh>
  );
}
