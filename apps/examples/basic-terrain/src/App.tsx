import { fbm } from '@jbcom/strata';
import { OrbitControls, Sky } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useMemo } from 'react';
import * as THREE from 'three';

/**
 * Simple terrain using marching cubes
 *
 * This example shows how to create procedural terrain with Strata's FBM noise.
 * For production use, import from @jbcom/strata instead.
 */
function Terrain() {
  const geometry = useMemo(() => {
    // Create a simple heightmap-based terrain
    const size = 50;
    const segments = 64;
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    geo.rotateX(-Math.PI / 2);

    const positions = geo.attributes.position;

    // Apply procedural heightmap using Strata's FBM noise
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getZ(i);

      // Use Strata's fractional brownian motion for natural terrain
      const height = fbm(x * 0.1, z * 0.1, 4, 2.0, 42) * 4;

      positions.setY(i, height);
    }

    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh geometry={geometry} receiveShadow castShadow>
      <meshStandardMaterial color="#4a7c23" roughness={0.8} metalness={0.1} />
    </mesh>
  );
}

/**
 * Main scene with terrain, lighting, and controls
 */
function Scene() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[50, 50, 25]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      {/* Sky */}
      <Sky sunPosition={[100, 50, 100]} />

      {/* Terrain */}
      <Terrain />

      {/* Water plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial
          color="#1a5f7a"
          transparent
          opacity={0.8}
          roughness={0.1}
          metalness={0.6}
        />
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
      camera={{ position: [30, 20, 30], fov: 60 }}
      style={{ background: 'linear-gradient(to bottom, #87ceeb, #e0f7fa)' }}
    >
      <Scene />
    </Canvas>
  );
}
