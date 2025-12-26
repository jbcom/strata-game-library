import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { SnowProps } from './types';

const SNOW_VERTEX_SHADER = `
  attribute vec3 offset;
  attribute float speed;
  attribute float phase;
  attribute float size;
  
  uniform float uTime;
  uniform vec3 uWind;
  uniform float uIntensity;
  uniform float uAreaSize;
  uniform float uHeight;
  
  varying float vAlpha;
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    
    vec3 pos = position * size;
    vec3 instancePos = offset;
    
    float t = mod(uTime * speed * 0.3 + phase, 1.0);
    instancePos.y = uHeight * (1.0 - t);
    
    float driftX = sin(uTime * 2.0 + phase * 10.0) * 0.5;
    float driftZ = cos(uTime * 1.5 + phase * 8.0) * 0.5;
    instancePos.x += uWind.x * t * 3.0 + driftX;
    instancePos.z += uWind.z * t * 3.0 + driftZ;
    
    instancePos.x = mod(instancePos.x + uAreaSize * 0.5, uAreaSize) - uAreaSize * 0.5;
    instancePos.z = mod(instancePos.z + uAreaSize * 0.5, uAreaSize) - uAreaSize * 0.5;
    
    pos += instancePos;
    
    vAlpha = uIntensity * (1.0 - t * 0.2);
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const SNOW_FRAGMENT_SHADER = `
  uniform vec3 uColor;
  
  varying float vAlpha;
  varying vec2 vUv;
  
  void main() {
    vec2 center = vUv - 0.5;
    float dist = length(center) * 2.0;
    float alpha = vAlpha * smoothstep(1.0, 0.3, dist);
    
    gl_FragColor = vec4(uColor, alpha * 0.8);
  }
`;

/**
 * GPU-Instanced Snowfall Effect.
 *
 * Renders thousands of snowflakes with gentle procedural drift and wind response.
 * Optimized for performance in large outdoor winter scenes.
 *
 * @category World Building
 * @example
 * ```tsx
 * <Snow
 *   count={8000}
 *   intensity={0.6}
 *   flakeSize={0.2}
 * />
 * ```
 */
export function Snow({
    count = 5000,
    areaSize = 50,
    height = 30,
    intensity: intensityProp = 1,
    windStrength, // Alias for intensity
    wind = new THREE.Vector3(0.3, 0, 0.1),
    color = 0xffffff,
    flakeSize = 0.15,
}: SnowProps) {
    const intensity = windStrength !== undefined ? windStrength : intensityProp;
    const meshRef = useRef<THREE.Mesh>(null);
    const { camera } = useThree();

    const { geometry, material } = useMemo(() => {
        const geo = new THREE.BufferGeometry();

        const positions: number[] = [];
        const uvs: number[] = [];
        const offsets: number[] = [];
        const speeds: number[] = [];
        const phases: number[] = [];
        const sizes: number[] = [];

        for (let i = 0; i < count; i++) {
            const s = flakeSize * (0.5 + Math.random() * 0.5);
            positions.push(-s, -s, 0, s, -s, 0, s, s, 0, -s, s, 0);
            uvs.push(0, 0, 1, 0, 1, 1, 0, 1);

            const ox = (Math.random() - 0.5) * areaSize;
            const oy = Math.random() * height;
            const oz = (Math.random() - 0.5) * areaSize;
            const size = 0.5 + Math.random() * 0.5;
            for (let j = 0; j < 4; j++) {
                offsets.push(ox, oy, oz);
                sizes.push(size);
            }

            const speed = 0.3 + Math.random() * 0.4;
            const phase = Math.random();
            for (let j = 0; j < 4; j++) {
                speeds.push(speed);
                phases.push(phase);
            }
        }

        const indices: number[] = [];
        for (let i = 0; i < count; i++) {
            const base = i * 4;
            indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
        }

        geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        geo.setAttribute('offset', new THREE.Float32BufferAttribute(offsets, 3));
        geo.setAttribute('speed', new THREE.Float32BufferAttribute(speeds, 1));
        geo.setAttribute('phase', new THREE.Float32BufferAttribute(phases, 1));
        geo.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
        geo.setIndex(indices);

        const mat = new THREE.ShaderMaterial({
            vertexShader: SNOW_VERTEX_SHADER,
            fragmentShader: SNOW_FRAGMENT_SHADER,
            uniforms: {
                uTime: { value: 0 },
                uWind: { value: wind.clone() },
                uIntensity: { value: intensity },
                uAreaSize: { value: areaSize },
                uHeight: { value: height },
                uColor: { value: new THREE.Color(color) },
            },
            transparent: true,
            depthWrite: false,
            side: THREE.DoubleSide,
        });

        return { geometry: geo, material: mat };
    }, [count, areaSize, height, flakeSize, color, intensity, wind]);

    useFrame((state) => {
        if (material.uniforms) {
            material.uniforms.uTime.value = state.clock.elapsedTime;
            material.uniforms.uIntensity.value = intensity;
            material.uniforms.uWind.value.copy(wind);
        }
        if (meshRef.current) {
            meshRef.current.position.set(camera.position.x, 0, camera.position.z);
        }
    });

    useEffect(() => {
        return () => {
            geometry.dispose();
            material.dispose();
        };
    }, [geometry, material]);

    return <mesh ref={meshRef} geometry={geometry} material={material} frustumCulled={false} />;
}
