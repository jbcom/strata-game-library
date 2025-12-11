import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CodeIcon from '@mui/icons-material/Code';

const steps = [
  {
    label: 'Install the package',
    code: 'npm install @jbcom/strata @react-three/fiber @react-three/drei three',
  },
  {
    label: 'Import components',
    code: `import { 
  ProceduralSky, 
  Water, 
  GrassInstances,
  VolumetricFogMesh,
  createCharacter
} from '@jbcom/strata';`,
  },
  {
    label: 'Add to your Canvas',
    code: `import { Canvas } from '@react-three/fiber';

function App() {
  return (
    <Canvas>
      <ProceduralSky timeOfDay={{ sunAngle: 45 }} />
      <Water size={100} color="#006994" />
      <GrassInstances count={5000} areaSize={40} />
    </Canvas>
  );
}`,
  },
];

const layers = [
  {
    title: 'Background Layer',
    description: 'Sky, atmosphere, and distant elements',
    items: [
      'ProceduralSky - Day/night cycle with stars',
      'VolumetricFogMesh - Distance fog effects',
      'EnhancedFog - Atmospheric scattering',
    ],
  },
  {
    title: 'Midground Layer',
    description: 'Terrain, water, and vegetation',
    items: [
      'Water / AdvancedWater - Ocean and lakes',
      'GrassInstances - GPU-instanced grass',
      'TreeInstances / RockInstances - Environment',
      'marchingCubes - Terrain generation',
    ],
  },
  {
    title: 'Foreground Layer',
    description: 'Characters and interactive elements',
    items: [
      'createCharacter - Articulated characters',
      'createFurSystem - Shell-based fur',
      'createParticleSystem - Particle effects',
      'createDecal - Surface decals',
    ],
  },
];

export default function GettingStarted() {
  return (
    <Box sx={{ py: 6 }}>
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          sx={{
            mb: 2,
            background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Getting Started
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 6 }}>
          Get up and running with Strata in minutes
        </Typography>

        <Paper sx={{ p: 4, mb: 6, bgcolor: 'background.paper' }}>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CodeIcon color="primary" />
            Quick Start
          </Typography>

          <Stepper orientation="vertical" sx={{ mt: 3 }}>
            {steps.map((step, index) => (
              <Step key={step.label} active expanded>
                <StepLabel>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {step.label}
                  </Typography>
                </StepLabel>
                <StepContent>
                  <Box
                    component="pre"
                    sx={{
                      bgcolor: '#0a0a0f',
                      border: '1px solid rgba(212, 175, 55, 0.2)',
                      borderRadius: 1,
                      p: 2,
                      overflow: 'auto',
                      fontSize: '0.875rem',
                      fontFamily: '"Fira Code", monospace',
                      my: 2,
                    }}
                  >
                    <code>{step.code}</code>
                  </Box>
                  {index === steps.length - 1 && (
                    <Button
                      variant="contained"
                      component={RouterLink}
                      to="/demos/full-scene"
                      sx={{ mt: 1 }}
                    >
                      See Full Demo
                    </Button>
                  )}
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Paper>

        <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
          Layer Architecture
        </Typography>

        <Grid container spacing={3} sx={{ mb: 6 }}>
          {layers.map((layer) => (
            <Grid item xs={12} md={4} key={layer.title}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" color="primary.main" gutterBottom>
                    {layer.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {layer.description}
                  </Typography>
                  <List dense>
                    {layer.items.map((item) => (
                      <ListItem key={item} disablePadding sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <CheckCircleIcon fontSize="small" color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={item}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Paper sx={{ p: 4, bgcolor: 'background.paper' }}>
          <Typography variant="h5" gutterBottom>
            Core vs Components
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Strata provides two ways to use its features:
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" color="primary.main" gutterBottom>
                React Components
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Drop-in components for React Three Fiber. Perfect for rapid development.
              </Typography>
              <Box
                component="pre"
                sx={{
                  bgcolor: '#0a0a0f',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 1,
                  p: 2,
                  fontSize: '0.8rem',
                  fontFamily: '"Fira Code", monospace',
                }}
              >
                <code>{`<Water size={100} color="#006994" />
<GrassInstances count={5000} />
<ProceduralSky timeOfDay={{ sunAngle: 45 }} />`}</code>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" color="primary.main" gutterBottom>
                Core Functions
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Pure TypeScript functions for custom implementations and full control.
              </Typography>
              <Box
                component="pre"
                sx={{
                  bgcolor: '#0a0a0f',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 1,
                  p: 2,
                  fontSize: '0.8rem',
                  fontFamily: '"Fira Code", monospace',
                }}
              >
                <code>{`const material = createWaterMaterial({ color });
const geometry = marchingCubes(sdfFunc, opts);
const instances = generateInstanceData(biomes);`}</code>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}
