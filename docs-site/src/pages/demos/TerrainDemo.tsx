import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Box, Typography, Paper, Slider, Stack } from '@mui/material';
import { useState } from 'react';
import * as THREE from 'three';

import {
  marchingCubes,
  createGeometryFromMarchingCubes,
  sdSphere,
  sdBox,
  opSmoothUnion,
  fbm,
} from '@jbcom/strata';

function TerrainMesh({ resolution, noiseScale }: { resolution: number; noiseScale: number }) {
  const geometry = useMemo(() => {
    const sdf = (p: THREE.Vector3): number => {
      const terrain = p.y - fbm(p.x * noiseScale, p.z * noiseScale, 4) * 2;
      const sphereCenter = new THREE.Vector3(0, 1, 0);
      const boxCenter = new THREE.Vector3(-2, 0, 0);
      const boxHalfExtents = new THREE.Vector3(1, 1, 1);
      
      const sphere = sdSphere(p, sphereCenter, 1.5);
      const box = sdBox(p, boxCenter, boxHalfExtents);
      return opSmoothUnion(opSmoothUnion(terrain, sphere, 0.5), box, 0.5);
    };

    const result = marchingCubes(sdf, {
      bounds: { min: [-5, -3, -5], max: [5, 3, 5] },
      resolution,
    });

    return createGeometryFromMarchingCubes(result);
  }, [resolution, noiseScale]);

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial
        color="#4a7c4e"
        roughness={0.8}
        metalness={0.1}
        flatShading
      />
    </mesh>
  );
}

function Scene({ resolution, noiseScale }: { resolution: number; noiseScale: number }) {
  return (
    <>
      <color attach="background" args={['#0a0a0f']} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 20, 10]} intensity={1} castShadow />
      <TerrainMesh resolution={resolution} noiseScale={noiseScale} />
      <gridHelper args={[20, 20, '#333', '#222']} position={[0, -3, 0]} />
      <OrbitControls maxPolarAngle={Math.PI / 2} />
    </>
  );
}

export default function TerrainDemo() {
  const [resolution, setResolution] = useState(32);
  const [noiseScale, setNoiseScale] = useState(0.3);

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flex: 1, position: 'relative' }}>
        <Canvas camera={{ position: [8, 8, 8], fov: 50 }} shadows>
          <Scene resolution={resolution} noiseScale={noiseScale} />
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
            Terrain Generation
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            SDF-based procedural terrain using marching cubes algorithm with smooth boolean operations.
          </Typography>
          <Stack spacing={2}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Resolution: {resolution}
              </Typography>
              <Slider
                value={resolution}
                onChange={(_, v) => setResolution(v as number)}
                min={16}
                max={64}
                step={8}
                size="small"
              />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Noise Scale: {noiseScale.toFixed(2)}
              </Typography>
              <Slider
                value={noiseScale}
                onChange={(_, v) => setNoiseScale(v as number)}
                min={0.1}
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
            maxWidth: 400,
          }}
        >
          <Typography variant="caption" component="pre" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
{`import { marchingCubes, fbm, sdSphere, opSmoothUnion } 
  from '@jbcom/strata';

const sdf = (p: Vector3) => {
  const terrain = p.y - fbm(p.x * 0.3, p.z * 0.3, 4) * 2;
  return opSmoothUnion(terrain, sdSphere(p, center, 1.5), 0.5);
};

const result = marchingCubes(sdf, { resolution: 32 });
const geometry = createGeometryFromMarchingCubes(result);`}
          </Typography>
        </Paper>
      </Box>

      <Box sx={{ bgcolor: 'rgba(0,0,0,0.5)', py: 1, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Drag to rotate | Scroll to zoom | Uses marchingCubes, fbm, opSmoothUnion from @jbcom/strata
        </Typography>
      </Box>
    </Box>
  );
}
