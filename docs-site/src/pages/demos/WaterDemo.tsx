import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Box, Typography, Paper, Slider, Stack, Switch, FormControlLabel } from '@mui/material';
import { useState } from 'react';
import * as THREE from 'three';

import { Water, AdvancedWater } from '@jbcom/strata';

function AnimatedWater({ size, color, opacity, advanced }: {
  size: number;
  color: string;
  opacity: number;
  advanced: boolean;
}) {
  const ref = useRef<THREE.Mesh>(null);

  if (advanced) {
    return <AdvancedWater ref={ref} size={size} color={color} />;
  }
  return <Water ref={ref} size={size} color={color} opacity={opacity} />;
}

function Scene({ size, color, opacity, advanced }: {
  size: number;
  color: string;
  opacity: number;
  advanced: boolean;
}) {
  return (
    <>
      <color attach="background" args={['#0a1520']} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 20, 10]} intensity={1} />

      <AnimatedWater size={size} color={color} opacity={opacity} advanced={advanced} />

      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[size * 0.8, 1, size * 0.8]} />
        <meshStandardMaterial color="#3d3d3d" />
      </mesh>

      <mesh position={[-3, 1, -3]} castShadow>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.2} />
      </mesh>

      <mesh position={[3, 0.5, 2]} castShadow>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshStandardMaterial color="#4a7c4e" />
      </mesh>

      <OrbitControls maxPolarAngle={Math.PI / 2} />
    </>
  );
}

export default function WaterDemo() {
  const [size, setSize] = useState(20);
  const [opacity, setOpacity] = useState(0.8);
  const [advanced, setAdvanced] = useState(false);
  const color = '#006994';

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flex: 1, position: 'relative' }}>
        <Canvas camera={{ position: [10, 8, 10], fov: 50 }} shadows>
          <Scene size={size} color={color} opacity={opacity} advanced={advanced} />
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
            Water Systems
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Procedural water with animated waves, fresnel reflections, and customizable appearance.
          </Typography>
          <Stack spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={advanced}
                  onChange={(e) => setAdvanced(e.target.checked)}
                  color="primary"
                />
              }
              label={<Typography variant="body2">Advanced Water</Typography>}
            />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Size: {size}
              </Typography>
              <Slider
                value={size}
                onChange={(_, v) => setSize(v as number)}
                min={10}
                max={50}
                size="small"
              />
            </Box>
            {!advanced && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Opacity: {opacity.toFixed(2)}
                </Typography>
                <Slider
                  value={opacity}
                  onChange={(_, v) => setOpacity(v as number)}
                  min={0.3}
                  max={1}
                  step={0.05}
                  size="small"
                />
              </Box>
            )}
          </Stack>
        </Paper>

        <Paper
          sx={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            p: 2,
            bgcolor: 'rgba(0,0,0,0.85)',
            maxWidth: 350,
          }}
        >
          <Typography variant="caption" component="pre" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
{`import { Water, AdvancedWater } from '@jbcom/strata';

// Simple water with color and opacity
<Water size={20} color="#006994" opacity={0.8} />

// Advanced with Gerstner waves and foam
<AdvancedWater size={20} color="#006994" />`}
          </Typography>
        </Paper>
      </Box>

      <Box sx={{ bgcolor: 'rgba(0,0,0,0.5)', py: 1, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Uses Water, AdvancedWater components from @jbcom/strata
        </Typography>
      </Box>
    </Box>
  );
}
