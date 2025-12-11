import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Box, Typography, Paper, Slider, Stack } from '@mui/material';
import { useState } from 'react';

import { ProceduralSky, createTimeOfDay } from '@jbcom/strata';

function Scene({ sunAngle }: { sunAngle: number }) {
  const timeOfDay = createTimeOfDay(sunAngle);

  return (
    <>
      <ProceduralSky timeOfDay={timeOfDay} />
      <ambientLight intensity={0.2 + (sunAngle / 180) * 0.5} />
      <directionalLight
        position={[
          Math.cos((sunAngle * Math.PI) / 180) * 50,
          Math.sin((sunAngle * Math.PI) / 180) * 50,
          0,
        ]}
        intensity={Math.max(0.2, Math.sin((sunAngle * Math.PI) / 180))}
        color={sunAngle < 20 || sunAngle > 160 ? '#ff6b35' : '#ffffff'}
      />

      <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#1a3d1a" />
      </mesh>

      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#d4af37" metalness={0.3} roughness={0.7} />
      </mesh>

      <mesh position={[-4, 1, -2]} castShadow>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial color="#4a7c4e" />
      </mesh>

      <mesh position={[4, 0.75, 3]} castShadow>
        <cylinderGeometry args={[0.5, 1, 2, 16]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>

      <OrbitControls maxPolarAngle={Math.PI / 2} />
    </>
  );
}

function getTimeLabel(angle: number): string {
  if (angle < 10) return 'Night';
  if (angle < 30) return 'Dawn';
  if (angle < 60) return 'Morning';
  if (angle < 120) return 'Midday';
  if (angle < 150) return 'Afternoon';
  if (angle < 170) return 'Dusk';
  return 'Night';
}

export default function SkyDemo() {
  const [sunAngle, setSunAngle] = useState(45);

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flex: 1, position: 'relative' }}>
        <Canvas camera={{ position: [10, 5, 10], fov: 60 }} shadows>
          <Scene sunAngle={sunAngle} />
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
            Procedural Sky
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Dynamic sky system with day/night cycle, atmospheric scattering, and time-based lighting.
          </Typography>
          <Stack spacing={2}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Sun Angle: {sunAngle}° ({getTimeLabel(sunAngle)})
              </Typography>
              <Slider
                value={sunAngle}
                onChange={(_, v) => setSunAngle(v as number)}
                min={0}
                max={180}
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
            maxWidth: 380,
          }}
        >
          <Typography variant="caption" component="pre" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
{`import { ProceduralSky, createTimeOfDay } from '@jbcom/strata';

const timeOfDay = createTimeOfDay(45); // Sun at 45 degrees

<ProceduralSky timeOfDay={timeOfDay} />
// or
<ProceduralSky timeOfDay={{ sunAngle: 45 }} />`}
          </Typography>
        </Paper>
      </Box>

      <Box sx={{ bgcolor: 'rgba(0,0,0,0.5)', py: 1, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Uses ProceduralSky, createTimeOfDay from @jbcom/strata
        </Typography>
      </Box>
    </Box>
  );
}
