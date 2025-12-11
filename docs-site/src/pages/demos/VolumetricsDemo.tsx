import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Box, Typography, Paper, Slider, Stack, Switch, FormControlLabel } from '@mui/material';
import { useState } from 'react';

import { VolumetricFogMesh, UnderwaterOverlay, EnhancedFog, ProceduralSky } from '@jbcom/strata';

function Scene({ fogDensity, showUnderwater, showFog }: {
  fogDensity: number;
  showUnderwater: boolean;
  showFog: boolean;
}) {
  return (
    <>
      <ProceduralSky timeOfDay={{ sunAngle: 40 }} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 20, 10]} intensity={0.8} />

      {showFog && <VolumetricFogMesh color="#8899aa" density={fogDensity} />}
      {showUnderwater && <UnderwaterOverlay />}
      {showFog && <EnhancedFog color="#667788" near={5} far={50} />}

      <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color={showUnderwater ? '#1a4a5a' : '#2d4a2d'} />
      </mesh>

      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[3, 3, 3]} />
        <meshStandardMaterial color="#d4af37" />
      </mesh>

      <mesh position={[-5, 0.75, -3]} castShadow>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial color="#4a7c4e" />
      </mesh>

      <mesh position={[5, 1.5, 2]} castShadow>
        <cylinderGeometry args={[1, 1, 4, 16]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>

      <mesh position={[-3, 0.5, 5]} castShadow>
        <torusGeometry args={[1, 0.4, 16, 32]} />
        <meshStandardMaterial color="#6a5acd" />
      </mesh>

      <OrbitControls maxPolarAngle={Math.PI / 2} />
    </>
  );
}

export default function VolumetricsDemo() {
  const [fogDensity, setFogDensity] = useState(0.03);
  const [showUnderwater, setShowUnderwater] = useState(false);
  const [showFog, setShowFog] = useState(true);

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flex: 1, position: 'relative' }}>
        <Canvas camera={{ position: [12, 8, 12], fov: 50 }} shadows>
          <Scene fogDensity={fogDensity} showUnderwater={showUnderwater} showFog={showFog} />
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
            Volumetric Effects
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Atmospheric fog, underwater effects, and distance-based depth rendering.
          </Typography>
          <Stack spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={showFog}
                  onChange={(e) => setShowFog(e.target.checked)}
                  color="primary"
                />
              }
              label={<Typography variant="body2">Volumetric Fog</Typography>}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={showUnderwater}
                  onChange={(e) => setShowUnderwater(e.target.checked)}
                  color="primary"
                />
              }
              label={<Typography variant="body2">Underwater Mode</Typography>}
            />
            {showFog && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Fog Density: {fogDensity.toFixed(3)}
                </Typography>
                <Slider
                  value={fogDensity}
                  onChange={(_, v) => setFogDensity(v as number)}
                  min={0.01}
                  max={0.1}
                  step={0.005}
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
            maxWidth: 400,
          }}
        >
          <Typography variant="caption" component="pre" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
{`import { VolumetricFogMesh, UnderwaterOverlay, EnhancedFog } 
  from '@jbcom/strata';

// Accepts color strings or hex values
<VolumetricFogMesh color="#8899aa" density={0.03} />
<UnderwaterOverlay />
<EnhancedFog color="#667788" near={5} far={50} />`}
          </Typography>
        </Paper>
      </Box>

      <Box sx={{ bgcolor: 'rgba(0,0,0,0.5)', py: 1, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Uses VolumetricFogMesh, UnderwaterOverlay, EnhancedFog from @jbcom/strata
        </Typography>
      </Box>
    </Box>
  );
}
