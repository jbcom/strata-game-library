import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import * as THREE from 'three';
import type { EnhancedFogProps } from './types';

/**
 * Enhanced Scene Fog.
 *
 * Provides a simple wrapper around Three.js's built-in Fog and FogExp2 systems,
 * making it easy to toggle and configure environmental atmosphere.
 *
 * @category Effects & Atmosphere
 * @example
 * ```tsx
 * <EnhancedFog
 *   color="#b3c8d9"
 *   density={0.015}
 * />
 * ```
 */
export function EnhancedFog({ color = 0xb3c8d9, density = 0.02, near, far }: EnhancedFogProps) {
  const { scene } = useThree();

  useEffect(() => {
    const fogColor = new THREE.Color(color);
    if (near !== undefined && far !== undefined) {
      scene.fog = new THREE.Fog(fogColor, near, far);
    } else {
      scene.fog = new THREE.FogExp2(fogColor.getHex(), density) as any;
    }
    return () => {
      scene.fog = null;
    };
  }, [scene, color, density, near, far]);

  return null;
}
