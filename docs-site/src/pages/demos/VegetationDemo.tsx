import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Box, Typography, Paper, Slider, Stack } from '@mui/material';
import { useState } from 'react';

import { GrassInstances, TreeInstances, RockInstances, ProceduralSky } from '@jbcom/strata';

function Scene({ grassCount, treeCount, rockCount, areaSize, grassHeight }: {
  grassCount: number;
  treeCount: number;
  rockCount: number;
  areaSize: number;
  grassHeight: number;
}) {
  return (
    <>
      <ProceduralSky timeOfDay={{ sunAngle: 50 }} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[20, 30, 10]} intensity={1} castShadow />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[areaSize * 1.5, areaSize * 1.5]} />
        <meshStandardMaterial color="#2d5a27" />
      </mesh>

      <GrassInstances count={grassCount} areaSize={areaSize} height={grassHeight} />
      <TreeInstances count={treeCount} areaSize={areaSize} />
      <RockInstances count={rockCount} areaSize={areaSize} />

      <OrbitControls maxPolarAngle={Math.PI / 2.1} />
    </>
  );
}

export default function VegetationDemo() {
  const [grassCount, setGrassCount] = useState(5000);
  const [treeCount, setTreeCount] = useState(50);
  const [rockCount, setRockCount] = useState(30);
  const [areaSize, setAreaSize] = useState(40);
  const [grassHeight, setGrassHeight] = useState(0.4);

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flex: 1, position: 'relative' }}>
        <Canvas camera={{ position: [15, 10, 15], fov: 50 }} shadows>
          <Scene
            grassCount={grassCount}
            treeCount={treeCount}
            rockCount={rockCount}
            areaSize={areaSize}
            grassHeight={grassHeight}
          />
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
            GPU Vegetation
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Thousands of instances rendered efficiently using GPU instancing with wind animation.
          </Typography>
          <Stack spacing={2}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Grass Blades: {grassCount.toLocaleString()}
              </Typography>
              <Slider
                value={grassCount}
                onChange={(_, v) => setGrassCount(v as number)}
                min={1000}
                max={20000}
                step={1000}
                size="small"
              />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Grass Height: {grassHeight.toFixed(2)}
              </Typography>
              <Slider
                value={grassHeight}
                onChange={(_, v) => setGrassHeight(v as number)}
                min={0.2}
                max={1.5}
                step={0.1}
                size="small"
              />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Trees: {treeCount}
              </Typography>
              <Slider
                value={treeCount}
                onChange={(_, v) => setTreeCount(v as number)}
                min={10}
                max={200}
                step={10}
                size="small"
              />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Rocks: {rockCount}
              </Typography>
              <Slider
                value={rockCount}
                onChange={(_, v) => setRockCount(v as number)}
                min={10}
                max={100}
                step={5}
                size="small"
              />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Area Size: {areaSize}
              </Typography>
              <Slider
                value={areaSize}
                onChange={(_, v) => setAreaSize(v as number)}
                min={20}
                max={80}
                step={10}
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
{`import { GrassInstances, TreeInstances, RockInstances } 
  from '@jbcom/strata';

<GrassInstances count={5000} areaSize={40} height={0.4} />
<TreeInstances count={50} areaSize={40} />
<RockInstances count={30} areaSize={40} />`}
          </Typography>
        </Paper>
      </Box>

      <Box sx={{ bgcolor: 'rgba(0,0,0,0.5)', py: 1, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Uses GrassInstances, TreeInstances, RockInstances from @jbcom/strata
        </Typography>
      </Box>
    </Box>
  );
}
