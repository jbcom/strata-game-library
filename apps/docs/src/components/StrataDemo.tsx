import { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Sky, Float } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Animated terrain mesh using procedural noise.
 * This is a simplified version demonstrating what Strata does under the hood.
 */
function ProceduralTerrain() {
  const meshRef = useRef<THREE.Mesh>(null);

  const { geometry, colors } = useMemo(() => {
    const size = 40;
    const segments = 80;
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    const positions = geo.attributes.position;
    const colorArray = new Float32Array(positions.count * 3);

    // Simple procedural noise for terrain
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getY(i);

      // Multi-octave noise approximation
      let height = 0;
      height += Math.sin(x * 0.3) * Math.cos(z * 0.3) * 2;
      height += Math.sin(x * 0.7 + 1.3) * Math.cos(z * 0.5 + 0.7) * 1;
      height += Math.sin(x * 1.5 + 2.1) * Math.cos(z * 1.2 + 1.4) * 0.4;
      height += Math.sin(x * 3.0) * Math.cos(z * 2.8) * 0.15;

      positions.setZ(i, height);

      // Biome-based coloring
      const normalizedHeight = (height + 3.5) / 7;
      if (normalizedHeight < 0.25) {
        // Water / deep
        colorArray[i * 3] = 0.05;
        colorArray[i * 3 + 1] = 0.4;
        colorArray[i * 3 + 2] = 0.7;
      } else if (normalizedHeight < 0.4) {
        // Sand/beach
        colorArray[i * 3] = 0.76;
        colorArray[i * 3 + 1] = 0.7;
        colorArray[i * 3 + 2] = 0.5;
      } else if (normalizedHeight < 0.7) {
        // Grass/vegetation
        colorArray[i * 3] = 0.15 + normalizedHeight * 0.1;
        colorArray[i * 3 + 1] = 0.5 + normalizedHeight * 0.2;
        colorArray[i * 3 + 2] = 0.15;
      } else {
        // Snow/peaks
        const snowBlend = (normalizedHeight - 0.7) / 0.3;
        colorArray[i * 3] = 0.3 + snowBlend * 0.6;
        colorArray[i * 3 + 1] = 0.55 + snowBlend * 0.4;
        colorArray[i * 3 + 2] = 0.2 + snowBlend * 0.7;
      }
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
    geo.computeVertexNormals();
    return { geometry: geo, colors: colorArray };
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.1) * 0.02;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry} rotation={[-Math.PI / 2.5, 0, 0]} position={[0, -2, 0]}>
      <meshStandardMaterial vertexColors roughness={0.85} metalness={0.1} />
    </mesh>
  );
}

/**
 * Animated water plane
 */
function WaterPlane() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      meshRef.current.position.y = -1.3 + Math.sin(time * 0.5) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2.5, 0, 0]} position={[0, -1.3, 0]}>
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial
        color="#0ea5e9"
        transparent
        opacity={0.6}
        roughness={0.1}
        metalness={0.8}
      />
    </mesh>
  );
}

/**
 * Floating crystal representing the Strata brand
 */
function FloatingCrystal() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.8}>
      <mesh ref={meshRef} position={[0, 3, 0]}>
        <octahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial
          color="#14b8a6"
          emissive="#0ea5e9"
          emissiveIntensity={0.3}
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>
    </Float>
  );
}

/**
 * Particle system for atmospheric effect
 */
function Particles({ count = 200 }: { count?: number }) {
  const points = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = Math.random() * 10 - 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    return positions;
  }, [count]);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={points}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#38bdf8" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

/**
 * Interactive 3D scene demo for the Strata documentation.
 * Showcases procedural terrain, water, and atmospheric effects.
 */
export default function StrataDemo() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="strata-demo-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Canvas
        camera={{ position: [12, 8, 12], fov: 50 }}
        dpr={[1, 1.5]}
        style={{ background: 'transparent' }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} color="#fff5e6" />
        <directionalLight position={[-5, 8, -5]} intensity={0.3} color="#38bdf8" />

        <ProceduralTerrain />
        <WaterPlane />
        <FloatingCrystal />
        <Particles />

        <fog attach="fog" args={['#0b1120', 15, 35]} />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={isHovered ? 0 : 0.5}
          maxPolarAngle={Math.PI / 2.2}
          minPolarAngle={Math.PI / 4}
        />
      </Canvas>
      <div className="strata-demo-badge">
        Interactive — drag to rotate
      </div>
    </div>
  );
}
