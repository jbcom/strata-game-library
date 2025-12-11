import { useRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Stack,
} from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import DownloadIcon from '@mui/icons-material/Download';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import TerrainIcon from '@mui/icons-material/Terrain';
import WaterIcon from '@mui/icons-material/Water';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import GrassIcon from '@mui/icons-material/Grass';
import CloudIcon from '@mui/icons-material/Cloud';
import PetsIcon from '@mui/icons-material/Pets';
import * as THREE from 'three';

import { Water, ProceduralSky, GrassInstances } from '@jbcom/strata';

function HeroScene() {
  const waterRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (waterRef.current?.material) {
      const mat = waterRef.current.material as THREE.ShaderMaterial;
      if (mat.uniforms?.time) {
        mat.uniforms.time.value = state.clock.elapsedTime;
      }
    }
  });

  return (
    <>
      <ProceduralSky timeOfDay={{ sunAngle: 35 }} />
      <Water ref={waterRef} size={100} color="#006994" opacity={0.8} />
      <GrassInstances count={3000} areaSize={30} height={0.3} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#1a3d1a" />
      </mesh>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 20, 10]} intensity={1.2} castShadow />
    </>
  );
}

const features = [
  {
    icon: <WbSunnyIcon sx={{ fontSize: 40 }} />,
    title: 'Procedural Sky',
    description: 'Day/night cycles, atmospheric scattering, stars, and weather effects',
    link: '/demos/sky',
  },
  {
    icon: <TerrainIcon sx={{ fontSize: 40 }} />,
    title: 'Terrain Generation',
    description: 'SDF-based terrain with marching cubes and triplanar texturing',
    link: '/demos/terrain',
  },
  {
    icon: <WaterIcon sx={{ fontSize: 40 }} />,
    title: 'Advanced Water',
    description: 'Gerstner waves, fresnel reflections, caustics, and foam',
    link: '/demos/water',
  },
  {
    icon: <GrassIcon sx={{ fontSize: 40 }} />,
    title: 'GPU Vegetation',
    description: 'Thousands of grass, trees, and rocks with wind animation',
    link: '/demos/vegetation',
  },
  {
    icon: <CloudIcon sx={{ fontSize: 40 }} />,
    title: 'Volumetric Effects',
    description: 'Fog, god rays, dust particles, and underwater overlays',
    link: '/demos/volumetrics',
  },
  {
    icon: <PetsIcon sx={{ fontSize: 40 }} />,
    title: 'Characters & Fur',
    description: 'Articulated characters with shell-based fur rendering',
    link: '/demos/characters',
  },
];

const codeExample = `import { Canvas } from '@react-three/fiber';
import { 
  ProceduralSky, 
  Water, 
  GrassInstances,
  VolumetricFogMesh 
} from '@jbcom/strata';

function Game() {
  return (
    <Canvas>
      {/* Background Layer */}
      <ProceduralSky timeOfDay={{ sunAngle: 45 }} />
      <VolumetricFogMesh />
      
      {/* Midground Layer */}
      <Water size={100} color="#006994" />
      <GrassInstances count={10000} areaSize={50} />
      
      {/* Your game objects here */}
    </Canvas>
  );
}`;

export default function HomePage() {
  return (
    <Box>
      <Box
        sx={{
          position: 'relative',
          height: '80vh',
          minHeight: 600,
          overflow: 'hidden',
        }}
      >
        <Canvas
          camera={{ position: [0, 8, 20], fov: 50 }}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        >
          <HeroScene />
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            autoRotate
            autoRotateSpeed={0.3}
            maxPolarAngle={Math.PI / 2.2}
            minPolarAngle={Math.PI / 4}
          />
        </Canvas>

        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(180deg, rgba(10,10,15,0.3) 0%, rgba(10,10,15,0.8) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <Container maxWidth="md" sx={{ textAlign: 'center', pointerEvents: 'auto' }}>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '3rem', md: '5rem' },
                fontWeight: 700,
                letterSpacing: '0.3em',
                mb: 2,
                background: 'linear-gradient(135deg, #d4af37 0%, #f0d77f 50%, #b8860b 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 60px rgba(212, 175, 55, 0.3)',
              }}
            >
              STRATA
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: 'text.secondary',
                mb: 4,
                maxWidth: 600,
                mx: 'auto',
              }}
            >
              The complete solution for layered 3D gaming in React Three Fiber.
              Background, midground, and foreground - all in one library.
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
              <Button
                variant="contained"
                size="large"
                component={RouterLink}
                to="/demos/full-scene"
                startIcon={<PlayArrowIcon />}
              >
                View Full Demo
              </Button>
              <Button
                variant="outlined"
                size="large"
                href="https://github.com/jbcom/strata"
                target="_blank"
                startIcon={<GitHubIcon />}
              >
                GitHub
              </Button>
              <Button
                variant="outlined"
                size="large"
                href="https://www.npmjs.com/package/@jbcom/strata"
                target="_blank"
                startIcon={<DownloadIcon />}
              >
                npm install
              </Button>
            </Stack>

            <Stack
              direction="row"
              spacing={1}
              justifyContent="center"
              flexWrap="wrap"
              sx={{ mt: 4 }}
            >
              <Chip label="React Three Fiber" variant="outlined" color="primary" />
              <Chip label="GPU Instancing" variant="outlined" color="primary" />
              <Chip label="Procedural Generation" variant="outlined" color="primary" />
              <Chip label="Mobile Ready" variant="outlined" color="primary" />
            </Stack>
          </Container>
        </Box>
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h2"
          sx={{
            textAlign: 'center',
            mb: 2,
            background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Build Stunning 3D Worlds
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ textAlign: 'center', maxWidth: 600, mx: 'auto', mb: 6 }}
        >
          From procedural terrain to animated characters, Strata provides every layer you need
          for professional 3D gaming experiences.
        </Typography>

        <Grid container spacing={3}>
          {features.map((feature) => (
            <Grid item xs={12} sm={6} md={4} key={feature.title}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ color: 'primary.main', mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h6" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    component={RouterLink}
                    to={feature.link}
                    size="small"
                    color="primary"
                  >
                    View Demo
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Box sx={{ bgcolor: '#050508', py: 8 }}>
        <Container maxWidth="md">
          <Typography
            variant="h3"
            sx={{
              textAlign: 'center',
              mb: 4,
              background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Simple, Powerful API
          </Typography>
          <Box
            component="pre"
            sx={{
              bgcolor: '#0a0a0f',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              borderRadius: 2,
              p: 3,
              overflow: 'auto',
              fontSize: '0.9rem',
              lineHeight: 1.7,
              fontFamily: '"Fira Code", monospace',
            }}
          >
            <code>{codeExample}</code>
          </Box>
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              component={RouterLink}
              to="/getting-started"
            >
              Get Started
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Three Layers, One Library
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" color="primary.main" gutterBottom>
              Background
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Procedural sky, volumetric fog, atmospheric effects, and distant terrain
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" color="primary.main" gutterBottom>
              Midground
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Terrain generation, water systems, GPU-instanced vegetation, and biomes
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" color="primary.main" gutterBottom>
              Foreground
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Articulated characters, fur rendering, particles, decals, and billboards
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
