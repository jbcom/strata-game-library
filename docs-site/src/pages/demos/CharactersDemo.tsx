import { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Box, Typography, Paper, Slider, Stack } from '@mui/material';
import { useState } from 'react';
import * as THREE from 'three';

import { createCharacter, animateCharacter, ProceduralSky } from '@jbcom/strata';

function Character({ speed }: { speed: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const characterRef = useRef<ReturnType<typeof createCharacter> | null>(null);
  const { scene } = useThree();

  useEffect(() => {
    const character = createCharacter({
      skinColor: 0x8b4513,
      furOptions: {
        baseColor: 0x5d4037,
        tipColor: 0x8d6e63,
        layerCount: 4,
      },
      scale: 1,
    });

    characterRef.current = character;
    if (groupRef.current) {
      groupRef.current.add(character.root);
    }

    return () => {
      if (groupRef.current) {
        groupRef.current.remove(character.root);
      }
    };
  }, []);

  useFrame((state) => {
    if (characterRef.current) {
      characterRef.current.state.speed = speed * characterRef.current.state.maxSpeed;
      animateCharacter(characterRef.current, state.clock.elapsedTime, 0.016);
    }
  });

  return <group ref={groupRef} position={[0, 0, 0]} />;
}

function Scene({ speed }: { speed: number }) {
  return (
    <>
      <ProceduralSky timeOfDay={{ sunAngle: 55 }} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 20, 10]} intensity={1} castShadow />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#3d5a3d" />
      </mesh>

      <Character speed={speed} />

      <OrbitControls
        target={[0, 1, 0]}
        maxPolarAngle={Math.PI / 2}
      />
    </>
  );
}

export default function CharactersDemo() {
  const [speed, setSpeed] = useState(0.5);

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flex: 1, position: 'relative' }}>
        <Canvas camera={{ position: [4, 3, 4], fov: 50 }} shadows>
          <Scene speed={speed} />
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
            maxWidth: 320,
          }}
        >
          <Typography variant="h6" color="primary.main" gutterBottom>
            Characters & Fur
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Articulated character system with procedural animation and shell-based fur rendering.
          </Typography>
          <Stack spacing={2}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Movement Speed: {(speed * 100).toFixed(0)}%
              </Typography>
              <Slider
                value={speed}
                onChange={(_, v) => setSpeed(v as number)}
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
            maxWidth: 450,
          }}
        >
          <Typography variant="caption" component="pre" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
{`import { createCharacter, animateCharacter } from '@jbcom/strata';

const character = createCharacter({
  skinColor: 0x8b4513,
  furOptions: { baseColor: 0x5d4037, tipColor: 0x8d6e63 },
});

scene.add(character.root);

// In animation loop:
character.state.speed = 0.5 * character.state.maxSpeed;
animateCharacter(character, elapsedTime, deltaTime);`}
          </Typography>
        </Paper>
      </Box>

      <Box sx={{ bgcolor: 'rgba(0,0,0,0.5)', py: 1, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Uses createCharacter, animateCharacter, createFurSystem from @jbcom/strata
        </Typography>
      </Box>
    </Box>
  );
}
