import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { RainProps } from './types';

const RAIN_VERTEX_SHADER = `
  attribute vec3 offset;
  attribute float speed;
  attribute float phase;
  
  uniform float uTime;
  uniform vec3 uWind;
  uniform float uIntensity;
  uniform float uAreaSize;
  uniform float uHeight;
  
  varying float vAlpha;
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    
    vec3 pos = position;
    vec3 instancePos = offset;
    
    float t = mod(uTime * speed + phase, 1.0);
    instancePos.y = uHeight * (1.0 - t);
    instancePos.x += uWind.x * t * 2.0;
    instancePos.z += uWind.z * t * 2.0;
    
    instancePos.x = mod(instancePos.x + uAreaSize * 0.5, uAreaSize) - uAreaSize * 0.5;
    instancePos.z = mod(instancePos.z + uAreaSize * 0.5, uAreaSize) - uAreaSize * 0.5;
    
    pos += instancePos;
    
    vAlpha = uIntensity * (1.0 - t * 0.3);
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const RAIN_FRAGMENT_SHADER = `
  uniform vec3 uColor;
  
  varying float vAlpha;
  varying vec2 vUv;
  
  void main() {
    float dist = abs(vUv.x - 0.5) * 2.0;
    float alpha = vAlpha * (1.0 - dist) * smoothstep(0.0, 0.1, vUv.y) * smoothstep(1.0, 0.9, vUv.y);
    
    gl_FragColor = vec4(uColor, alpha * 0.6);
  }
`;

/**
 * High-Performance Rain Effect.
 *
 * Uses GPU instancing to simulate thousands of rain particles. Automatically
 * tracks the camera to provide infinite coverage within a defined area.
 *
 * @category World Building
 * @example
 * ```tsx
 * <Rain
 *   count={15000}
 *   intensity={0.8}
 *   wind={new THREE.Vector3(1, 0, 0.5)}
 * />
 * ```
 */
export function Rain({
    count = 10000,
    areaSize = 50,
    height = 30,
    intensity: intensityProp = 1,
    windStrength, // Alias for intensity
    wind = new THREE.Vector3(0.5, 0, 0.2),
    color = 0xaaccff,
    dropLength = 0.5,
}: RainProps) {
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

        for (let i = 0; i < count; i++) {
            positions.push(-0.01, 0, 0, 0.01, 0, 0, 0.01, dropLength, 0, -0.01, dropLength, 0);
            uvs.push(0, 0, 1, 0, 1, 1, 0, 1);

            const ox = (Math.random() - 0.5) * areaSize;
            const oy = Math.random() * height;
            const oz = (Math.random() - 0.5) * areaSize;
            for (let j = 0; j < 4; j++) {
                offsets.push(ox, oy, oz);
            }

            const speed = 0.8 + Math.random() * 0.4;
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
        geo.setIndex(indices);

        const mat = new THREE.ShaderMaterial({
            vertexShader: RAIN_VERTEX_SHADER,
            fragmentShader: RAIN_FRAGMENT_SHADER,
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
    }, [count, areaSize, height, dropLength, color, intensity, wind]);

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
