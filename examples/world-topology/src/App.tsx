import React, { useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Box } from '@react-three/drei';
import * as THREE from 'three';
import {
  createWorldGraph,
  createRegionSystem,
  createConnectionSystem,
  createSpawnSystem,
  createWorld,
  createGameStore
} from '@jbcom/strata';

// 1. Define the world
const WORLD_DEFINITION = {
  regions: {
    marsh: {
      name: 'Emerald Marsh',
      center: [0, 0, 0] as [number, number, number],
      radius: 40,
      biome: 'marsh' as any,
      difficulty: 1,
    },
    forest: {
      name: 'Whispering Woods',
      center: [100, 0, 0] as [number, number, number],
      radius: 50,
      biome: 'forest' as any,
      difficulty: 2,
    },
    mountain: {
      name: 'Stormcrest Peaks',
      center: [200, 0, 100] as [number, number, number],
      radius: 60,
      biome: 'mountain' as any,
      difficulty: 4,
    },
  },
  connections: [
    {
      from: 'marsh',
      to: 'forest',
      type: 'path' as any,
      fromPosition: [30, 0, 0] as [number, number, number],
      toPosition: [70, 0, 0] as [number, number, number],
      bidirectional: true,
    },
    {
      from: 'forest',
      to: 'mountain',
      type: 'portal' as any,
      fromPosition: [130, 0, 20] as [number, number, number],
      toPosition: [160, 0, 80] as [number, number, number],
      bidirectional: true,
    },
  ],
};

// 2. Initialize store and ECS
const useGameStore = createGameStore({
  currentRegion: 'marsh',
  currentBiome: 'marsh',
  score: 0
});

const world = createWorld<any>();
const worldGraph = createWorldGraph(WORLD_DEFINITION);

// 3. Components
function RegionVisual({ region }: { region: any }) {
  const isCurrent = useGameStore(s => s.data.currentRegion === region.id);
  const color = isCurrent ? '#4ade80' : '#94a3b8';

  return (
    <group position={region.center}>
      {region.bounds.type === 'sphere' ? (
        <Sphere args={[region.bounds.radius, 32, 32]}>
          <meshStandardMaterial
            color={color}
            transparent
            opacity={0.1}
            wireframe={!isCurrent}
          />
        </Sphere>
      ) : region.bounds.type === 'box' ? (
        <Box
          args={[
            region.bounds.size.x,
            region.bounds.size.y,
            region.bounds.size.z,
          ]}
        >
          <meshStandardMaterial
            color={color}
            transparent
            opacity={0.1}
            wireframe={!isCurrent}
          />
        </Box>
      ) : null}
      <Text
        position={[0, region.bounds.radius || 10, 0]}
        fontSize={5}
        color={color}
        anchorX="center"
        anchorY="middle"
      >
        {region.name}
      </Text>
    </group>
  );
}

function Player() {
  const playerRef = React.useRef<THREE.Group>(null);

  // Initialize player in ECS
  useEffect(() => {
    const playerEntity = world.spawn({
      isPlayer: true,
      transform: { position: new THREE.Vector3(0, 0, 0) }
    });

    return () => world.despawn(playerEntity);
  }, []);

  // Movement logic
  useFrame((state, delta) => {
    if (!playerRef.current) return;

    const speed = 20;
    const move = new THREE.Vector3();

    // Simple auto-patrol or keyboard control could go here
    // For the demo, let's just let the user move with keys if we could
    // But since this is a static code example, we'll just move the ECS position
    const playerEntity = world.entities.find(e => e.isPlayer);
    if (playerEntity && playerEntity.transform) {
      playerRef.current.position.copy(playerEntity.transform.position);
    }
  });

  return (
    <group ref={playerRef}>
      <Sphere args={[2, 16, 16]}>
        <meshStandardMaterial color="#ef4444" />
      </Sphere>
      <pointLight intensity={1} distance={20} />
    </group>
  );
}

function WorldTopologySystems() {
  const regionSystem = useMemo(() => createRegionSystem(worldGraph, useGameStore), []);
  const connectionSystem = useMemo(() => createConnectionSystem(worldGraph, useGameStore), []);
  const spawnSystem = useMemo(() => createSpawnSystem(worldGraph), []);

  useFrame((state, delta) => {
    regionSystem(world, delta);
    connectionSystem(world, delta);
    spawnSystem(world, delta);
  });

  return null;
}

export function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0f172a' }}>
      <Canvas camera={{ position: [100, 100, 100], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} />

        {Array.from(worldGraph.regions.values()).map((region: any) => (
          <RegionVisual key={region.id} region={region} />
        ))}

        {worldGraph.connections.map((conn: any) => (
          <line key={conn.id}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([
                  conn.fromPosition.x, conn.fromPosition.y, conn.fromPosition.z,
                  conn.toPosition.x, conn.toPosition.y, conn.toPosition.z
                ])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#6366f1" opacity={0.5} transparent />
          </line>
        ))}

        <Player />
        <WorldTopologySystems />

        <OrbitControls />
        <gridHelper args={[400, 40]} />
      </Canvas>

      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        color: 'white',
        fontFamily: 'sans-serif',
        background: 'rgba(0,0,0,0.5)',
        padding: '20px',
        borderRadius: '8px'
      }}>
        <h1>Strata World Topology</h1>
        <p>Current Region: <span style={{ color: '#4ade80' }}>{useGameStore(s => s.data.currentRegion)}</span></p>
        <p>Current Biome: <span style={{ color: '#4ade80' }}>{useGameStore(s => s.data.currentBiome)}</span></p>
        <hr />
        <p>Move near connections (blue lines) to travel.</p>
      </div>
    </div>
  );
}
