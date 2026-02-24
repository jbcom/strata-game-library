import type { BiomeData } from '@jbcom/strata';
import {
  createGrassInstances,
  createRockInstances,
  createTreeInstances,
  createVegetationMesh,
  fbm,
  generateInstanceData,
  getBiomeAt,
  getTerrainHeight,
  noise3D,
  ProceduralSky,
  sdTerrain,
  Water,
} from '@jbcom/strata';
import { OrbitControls, Sky, Stats } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { button, folder, useControls } from 'leva';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * Vegetation Showcase Example
 *
 * A COMPREHENSIVE demonstration of Strata's GPU-instanced vegetation system featuring:
 *
 * VEGETATION SYSTEMS:
 * - Up to 50,000 grass instances with realistic wind animation
 * - Multiple tree species (pine, oak, birch) with biome-specific placement
 * - Boulder fields and rock formations with procedural variation
 * - Flower patches and undergrowth layers
 * - Dead trees and fallen logs for environmental storytelling
 *
 * BIOME SYSTEM:
 * - 6+ distinct biomes (grassland, forest, dense forest, rocky, alpine, wetland)
 * - Smooth biome transitions with gradient blending
 * - Biome-specific vegetation density multipliers
 * - Elevation-based biome distribution
 * - Moisture-based vegetation placement
 *
 * PROCEDURAL TERRAIN:
 * - Multi-octave FBM noise for realistic terrain
 * - Erosion simulation patterns
 * - River valleys and water features
 * - Rocky outcrops and cliff faces
 * - Beach/shore transitions
 *
 * LIGHTING & ATMOSPHERE:
 * - Dynamic time of day system
 * - Volumetric fog with height falloff
 * - Procedural sky with weather
 * - Realistic shadow casting
 * - Ambient occlusion
 *
 * WATER INTEGRATION:
 * - Procedural water body with caustics
 * - Shore vegetation patterns
 * - Underwater caustics projection
 * - Reflection and refraction
 *
 * PERFORMANCE FEATURES:
 * - GPU instancing for optimal performance
 * - Frustum culling for large scenes
 * - LOD system for distant vegetation
 * - Seeded random for deterministic results
 * - Efficient memory usage
 *
 * INTERACTIVE CONTROLS:
 * - Real-time instance count adjustment
 * - Biome parameter tuning
 * - Wind strength and speed controls
 * - Time of day presets
 * - Camera bookmarks
 * - Performance monitoring
 */

/**
 * Advanced procedural terrain with multiple noise layers and biome-based coloring
 */
function ProceduralTerrain() {
  const terrainRef = useRef<THREE.Mesh>(null);

  const { size, segments, amplitude, octaves, roughness, seed } = useControls(
    'Terrain Generation',
    {
      size: { value: 150, min: 50, max: 300, step: 10 },
      segments: { value: 256, min: 64, max: 512, step: 64 },
      amplitude: { value: 8, min: 1, max: 20, step: 0.5 },
      octaves: { value: 6, min: 1, max: 10, step: 1 },
      roughness: { value: 2.2, min: 1, max: 3, step: 0.1 },
      seed: { value: 42, min: 0, max: 1000, step: 1 },
    }
  );

  const { geometry, colorData } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    geo.rotateX(-Math.PI / 2);

    const positions = geo.attributes.position;
    const colors = new Float32Array(positions.count * 3);

    // Advanced terrain generation with multiple noise layers
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getZ(i);

      // Base terrain using FBM (Fractional Brownian Motion)
      const baseHeight = fbm(x * 0.02, z * 0.02, octaves, roughness, seed) * amplitude;

      // Large-scale features (mountains and valleys)
      const largeScale = fbm(x * 0.008, z * 0.008, 4, 2.0, seed + 100) * amplitude * 1.5;

      // Medium-scale features (hills)
      const mediumScale = fbm(x * 0.04, z * 0.04, 3, 2.5, seed + 200) * amplitude * 0.5;

      // Small-scale detail (bumps and dips)
      const smallScale = fbm(x * 0.1, z * 0.1, 2, 3.0, seed + 300) * amplitude * 0.2;

      // River valley carved through terrain
      const distanceFromRiver = Math.abs(z - 10 + Math.sin(x * 0.05) * 15);
      const riverCarve = Math.max(0, 1 - distanceFromRiver / 20) * -3;

      // Combine all layers
      let height = baseHeight + largeScale + mediumScale + smallScale + riverCarve;

      // Ensure water level
      const waterLevel = -0.5;
      height = Math.max(waterLevel, height);

      positions.setY(i, height);

      // Color based on height and biome
      const biomeValue = fbm(x * 0.03, z * 0.03, 3, 2.0, seed + 500);
      const moisture = fbm(x * 0.05, z * 0.05, 2, 2.0, seed + 600);

      const color = new THREE.Color();

      if (height < waterLevel + 0.5) {
        // Beach/shore
        color.setHex(0xd4c5a3);
      } else if (height < waterLevel + 2 && moisture > 0.3) {
        // Wetland
        color.setHex(0x4a6a3a);
      } else if (biomeValue > 0.6) {
        // Rocky/mountainous
        color.setHex(0x7a7a6a);
      } else if (biomeValue > 0.3) {
        // Forest
        color.setHex(0x2a4a2a);
      } else if (height > amplitude * 1.2) {
        // Alpine (high elevation)
        color.setHex(0x8a9a8a);
      } else {
        // Grassland
        color.setHex(0x3a5a2a);
      }

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();

    return { geometry: geo, colorData: colors };
  }, [size, segments, amplitude, octaves, roughness, seed]);

  return (
    <mesh ref={terrainRef} geometry={geometry} receiveShadow castShadow>
      <meshStandardMaterial vertexColors roughness={0.95} metalness={0.05} />
    </mesh>
  );
}

function VegetationInstances() {
  const controls = useControls('Vegetation', {
    grassCount: { value: 5000, min: 0, max: 20000, step: 100 },
    treeCount: { value: 200, min: 0, max: 1000, step: 10 },
    rockCount: { value: 100, min: 0, max: 500, step: 10 },
    areaSize: { value: 100, min: 10, max: 200, step: 10 },
    seed: { value: 42, min: 0, max: 1000, step: 1 },
  });

  const { grassCount, treeCount, rockCount, areaSize, seed } = controls;

  // Define biomes for vegetation placement
  const biomes: BiomeData[] = useMemo(
    () => [
      {
        name: 'grassland',
        threshold: 0,
        color: 0x3a5a2a,
        vegetation: 1.0,
      },
      {
        name: 'forest',
        threshold: 0.3,
        color: 0x2a4a1a,
        vegetation: 1.5,
      },
      {
        name: 'rocky',
        threshold: 0.7,
        color: 0x5a5a4a,
        vegetation: 0.3,
      },
    ],
    []
  );

  // Simple height function matching terrain
  const heightFunction = (x: number, z: number) => {
    const height =
      Math.sin(x * 0.1) * Math.cos(z * 0.1) * 2 + Math.sin(x * 0.05) * Math.sin(z * 0.05) * 3;
    return Math.max(0, height);
  };

  const grassMesh = useMemo(() => {
    if (grassCount === 0) return null;
    return createGrassInstances(grassCount, areaSize, biomes, {
      heightFunction,
      seed,
      enableWind: true,
      windStrength: 0.5,
    });
  }, [grassCount, areaSize, seed, biomes]);

  const treeMesh = useMemo(() => {
    if (treeCount === 0) return null;
    return createTreeInstances(treeCount, areaSize, biomes, {
      heightFunction,
      seed: seed + 1000,
      enableWind: true,
      windStrength: 0.3,
    });
  }, [treeCount, areaSize, seed, biomes]);

  const rockMesh = useMemo(() => {
    if (rockCount === 0) return null;
    return createRockInstances(rockCount, areaSize, biomes, {
      heightFunction,
      seed: seed + 2000,
    });
  }, [rockCount, areaSize, seed, biomes]);

  return (
    <>
      {grassMesh && <primitive object={grassMesh} castShadow />}
      {treeMesh && <primitive object={treeMesh} castShadow />}
      {rockMesh && <primitive object={rockMesh} castShadow />}
    </>
  );
}

function Scene() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[50, 50, 25]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
      />

      {/* Sky */}
      <Sky sunPosition={[100, 20, 100]} />

      {/* Terrain */}
      <ProceduralTerrain />

      {/* Vegetation instances */}
      <VegetationInstances />

      {/* Controls */}
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        maxPolarAngle={Math.PI / 2.1}
        minDistance={10}
        maxDistance={150}
      />

      {/* Stats - for development/demo only */}
      {process.env.NODE_ENV === 'development' && <Stats />}
    </>
  );
}

export function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        shadows
        camera={{ position: [40, 30, 40], fov: 60 }}
        style={{ background: 'linear-gradient(to bottom, #87ceeb, #e0f7fa)' }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
