import { Environment, OrbitControls, Sky } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

/**
 * Animated water plane with wave displacement
 */
function WaterPlane() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Custom water shader with animated waves
  const { uniforms, vertexShader, fragmentShader } = useMemo(() => {
    return {
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(0x1a5f7a) },
        uOpacity: { value: 0.85 },
      },
      vertexShader: /* glsl */ `
        uniform float uTime;
        varying vec2 vUv;
        varying vec3 vPosition;

        void main() {
          vUv = uv;
          vec3 pos = position;

          // Multi-layered wave animation
          float wave1 = sin(pos.x * 0.5 + uTime) * 0.3;
          float wave2 = sin(pos.y * 0.3 + uTime * 0.7) * 0.2;
          float wave3 = sin((pos.x + pos.y) * 0.2 + uTime * 1.3) * 0.15;
          pos.z += wave1 + wave2 + wave3;

          vPosition = pos;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor;
        uniform float uOpacity;
        uniform float uTime;
        varying vec2 vUv;
        varying vec3 vPosition;

        void main() {
          // Fresnel effect for edge glow
          vec3 viewDir = normalize(cameraPosition - vPosition);
          float fresnel = pow(1.0 - max(dot(viewDir, vec3(0.0, 1.0, 0.0)), 0.0), 2.0);

          // Animated caustics pattern
          float caustic = sin(vUv.x * 20.0 + uTime) * sin(vUv.y * 20.0 + uTime * 0.8) * 0.1;

          vec3 finalColor = uColor + vec3(fresnel * 0.3) + vec3(caustic);
          gl_FragColor = vec4(finalColor, uOpacity);
        }
      `,
    };
  }, []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[100, 100, 128, 128]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/**
 * Floating object that bobs on the water
 */
function FloatingObject({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const initialY = position[1];

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      // Simulate floating motion
      meshRef.current.position.y =
        initialY + Math.sin(time + position[0]) * 0.3 + Math.cos(time * 0.7 + position[2]) * 0.2;
      meshRef.current.rotation.x = Math.sin(time * 0.5) * 0.1;
      meshRef.current.rotation.z = Math.cos(time * 0.3) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={position} castShadow>
      <boxGeometry args={[2, 1, 2]} />
      <meshStandardMaterial color="#8b4513" roughness={0.8} />
    </mesh>
  );
}

/**
 * Scene setup with water and floating objects
 */
function Scene() {
  return (
    <>
      {/* Environment */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[50, 50, 25]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      <Sky sunPosition={[100, 20, 100]} />
      <Environment preset="sunset" />

      {/* Water */}
      <WaterPlane />

      {/* Floating objects */}
      <FloatingObject position={[-10, 0.5, -5]} />
      <FloatingObject position={[8, 0.5, 3]} />
      <FloatingObject position={[-3, 0.5, 12]} />
      <FloatingObject position={[15, 0.5, -8]} />

      {/* Underwater ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#2d4a3e" roughness={1} />
      </mesh>

      {/* Camera controls */}
      <OrbitControls enableDamping dampingFactor={0.05} maxPolarAngle={Math.PI / 2.1} />
    </>
  );
}

/**
 * Main App component
 */
export function App() {
  return (
    <Canvas
      shadows
      camera={{ position: [30, 15, 30], fov: 60 }}
      style={{ background: 'linear-gradient(to bottom, #87ceeb, #1a5f7a)' }}
    >
      <Scene />
    </Canvas>
  );
}
