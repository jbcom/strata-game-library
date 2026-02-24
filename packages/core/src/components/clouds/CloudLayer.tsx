import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { createCloudLayerGeometry, createCloudLayerMaterial } from '../../core/clouds';
import type { CloudLayerProps } from './types';

/**
 * Optimized 2D Procedural Cloud Layer.
 *
 * Efficiently renders background clouds using a single textured plane.
 * Best for performance-constrained environments or background atmosphere.
 *
 * @category World Building
 * @example
 * ```tsx
 * <CloudLayer
 *   altitude={120}
 *   coverage={0.4}
 *   density={1.0}
 * />
 * ```
 */
export function CloudLayer({
  altitude = 100,
  density = 1.0,
  coverage = 0.5,
  cloudColor = new THREE.Color(1, 1, 1),
  shadowColor = new THREE.Color(0.7, 0.75, 0.85),
  scale = 5.0,
  wind: windProp = {},
  dayNight: dayNightProp = {},
  size = [200, 200],
}: CloudLayerProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Memoize config objects
  const layerConfig = useMemo(
    () => ({
      altitude,
      density,
      coverage,
      cloudColor,
      shadowColor,
      scale,
    }),
    [altitude, density, coverage, cloudColor, shadowColor, scale]
  );

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
    return createCloudLayerMaterial({
      layer: layerConfig,
      wind: windConfig,
      dayNight: dayNightConfig,
    });
  }, [layerConfig, windConfig, dayNightConfig]);

  const geometry = useMemo(() => {
    return createCloudLayerGeometry(size);
  }, [size]);

  useFrame((state) => {
    if (meshRef.current && material.uniforms) {
      material.uniforms.uTime.value = state.clock.elapsedTime;

      // Update uniforms that might change frequently
      material.uniforms.uSunIntensity.value = dayNightConfig.sunIntensity;
      material.uniforms.uSunAngle.value = dayNightConfig.sunAngle;
      material.uniforms.uSunColor.value = dayNightConfig.sunColor;

      // Update wind if needed
      if (windProp.direction) material.uniforms.uWindDirection.value = windConfig.direction;
      if (windProp.speed) material.uniforms.uWindSpeed.value = windConfig.speed;
    }
  });

  useEffect(() => {
    return () => {
      material.dispose();
      geometry.dispose();
    };
  }, [material, geometry]);

  return (
    <mesh
      ref={meshRef as any}
      position={[0, altitude, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      geometry={geometry as any}
    >
      <primitive object={material} attach="material" />
    </mesh>
  );
}
