import { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Box, Typography, Paper, Slider, Stack, Chip } from '@mui/material';
import { useState } from 'react';
import * as THREE from 'three';

import {
  Water,
  ProceduralSky,
  GrassInstances,
  TreeInstances,
  RockInstances,
  VolumetricFogMesh,
  createCharacter,
  animateCharacter,
} from '@jbcom/strata';

function Character({ speed }: { speed: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const characterRef = useRef<ReturnType<typeof createCharacter> | null>(null);

  useEffect(() => {
    const character = createCharacter({
      skinColor: 0x8b4513,
      furOptions: { baseColor: 0x5d4037, tipColor: 0x8d6e63, layerCount: 3 },
      scale: 0.8,
    });
    characterRef.current = character;
    if (groupRef.current) {
      groupRef.current.add(character.root);
    }
    return () => {
      if (groupRef.current) groupRef.current.remove(character.root);
    };
  }, []);

  useFrame((state) => {
    if (characterRef.current) {
      characterRef.current.state.speed = speed * characterRef.current.state.maxSpeed;
      animateCharacter(characterRef.current, state.clock.elapsedTime, 0.016);
    }
  });

  return <group ref={groupRef} position={[0, 0.5, 8]} />;
}

function Scene({ sunAngle, characterSpeed }: { sunAngle: number; characterSpeed: number }) {
  return (
    <>
      <ProceduralSky timeOfDay={{ sunAngle }} />
      <VolumetricFogMesh color="#8899aa" density={0.015} />

      <ambientLight intensity={0.2 + (sunAngle / 180) * 0.4} />
      <directionalLight
        position={[
          Math.cos((sunAngle * Math.PI) / 180) * 50,
          Math.sin((sunAngle * Math.PI) / 180) * 50,
          20,
        ]}
        intensity={Math.max(0.3, Math.sin((sunAngle * Math.PI) / 180))}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#2d5a27" />
      </mesh>

      <Water size={80} color="#006994" opacity={0.85} />

      <group position={[0, 0, 15]}>
        <GrassInstances count={8000} areaSize={35} height={0.35} />
        <TreeInstances count={40} areaSize={30} />
        <RockInstances count={25} areaSize={30} />
      </group>

      <Character speed={characterSpeed} />

      <mesh position={[-8, 1.5, 5]} castShadow>
        <boxGeometry args={[3, 3, 3]} />
        <meshStandardMaterial color="#d4af37" metalness={0.4} roughness={0.6} />
      </mesh>

      <mesh position={[10, 2, 3]} castShadow>
        <sphereGeometry args={[2, 32, 32]} />
        <meshStandardMaterial color="#4a7c7c" metalness={0.6} roughness={0.3} />
      </mesh>

      <OrbitControls
        target={[0, 2, 10]}
        maxPolarAngle={Math.PI / 2.1}
        minDistance={5}
        maxDistance={50}
      />
    </>
  );
}

export default function FullSceneDemo() {
  const [sunAngle, setSunAngle] = useState(50);
  const [characterSpeed, setCharacterSpeed] = useState(0.3);

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flex: 1, position: 'relative' }}>
        <Canvas camera={{ position: [0, 8, 25], fov: 55 }} shadows>
          <Scene sunAngle={sunAngle} characterSpeed={characterSpeed} />
        </Canvas>

        <Paper
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            p: 2,
            bgcolor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(10px)',
            border: '1px solid',
            borderColor: 'primary.dark',
            maxWidth: 340,
          }}
        >
          <Typography variant="h6" color="primary.main" gutterBottom>
            Complete Scene
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            All Strata features combined: sky, water, vegetation, fog, and characters.
          </Typography>

          <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mb: 2 }}>
            <Chip label="ProceduralSky" size="small" variant="outlined" color="primary" />
            <Chip label="Water" size="small" variant="outlined" color="primary" />
            <Chip label="GrassInstances" size="small" variant="outlined" color="primary" />
            <Chip label="TreeInstances" size="small" variant="outlined" color="primary" />
            <Chip label="VolumetricFog" size="small" variant="outlined" color="primary" />
            <Chip label="Character" size="small" variant="outlined" color="primary" />
          </Stack>

          <Stack spacing={2}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Time of Day: {sunAngle}
              </Typography>
              <Slider
                value={sunAngle}
                onChange={(_, v) => setSunAngle(v as number)}
                min={10}
                max={170}
                size="small"
              />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Character Speed: {(characterSpeed * 100).toFixed(0)}%
              </Typography>
              <Slider
                value={characterSpeed}
                onChange={(_, v) => setCharacterSpeed(v as number)}
                min={0}
                max={1}
                step={0.05}
                size="small"
              />
            </Box>
          </Stack>
        </Paper>

        <Paper
          sx={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            p: 2,
            bgcolor: 'rgba(0,0,0,0.85)',
            maxWidth: 480,
          }}
        >
          <Typography variant="caption" component="pre" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>
{`import { 
  ProceduralSky, Water, GrassInstances, TreeInstances,
  RockInstances, VolumetricFogMesh, createCharacter 
} from '@jbcom/strata';

<Canvas>
  <ProceduralSky timeOfDay={{ sunAngle: 50 }} />
  <VolumetricFogMesh color="#8899aa" density={0.015} />
  <Water size={80} color="#006994" opacity={0.85} />
  <GrassInstances count={8000} areaSize={35} height={0.35} />
  <TreeInstances count={40} areaSize={30} />
  <RockInstances count={25} areaSize={30} />
</Canvas>`}
          </Typography>
        </Paper>
      </Box>

      <Box sx={{ bgcolor: 'rgba(0,0,0,0.5)', py: 1, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          All layers from @jbcom/strata working together - Background, Midground, Foreground
        </Typography>
      </Box>
    </Box>
  );
}
