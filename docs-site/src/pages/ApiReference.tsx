import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div hidden={value !== index} style={{ paddingTop: 24 }}>
      {value === index && children}
    </div>
  );
}

const components = [
  {
    name: 'Water',
    description: 'Simple procedural water surface with animated waves',
    props: [
      { name: 'size', type: 'number', default: '10', description: 'Size of water plane' },
      { name: 'color', type: 'string', default: '"#006994"', description: 'Water color' },
      { name: 'opacity', type: 'number', default: '0.8', description: 'Water transparency' },
    ],
  },
  {
    name: 'AdvancedWater',
    description: 'Advanced water with Gerstner waves, reflections, and caustics',
    props: [
      { name: 'size', type: 'number', default: '10', description: 'Size of water plane' },
      { name: 'color', type: 'string', default: '"#006994"', description: 'Water color' },
      { name: 'waveHeight', type: 'number', default: '0.5', description: 'Wave amplitude' },
      { name: 'waveSpeed', type: 'number', default: '1.0', description: 'Wave animation speed' },
    ],
  },
  {
    name: 'ProceduralSky',
    description: 'Dynamic sky with day/night cycle and atmospheric scattering',
    props: [
      { name: 'timeOfDay', type: 'object', default: '{ sunAngle: 45 }', description: 'Time of day configuration' },
      { name: 'weather', type: 'object', default: '{}', description: 'Weather effects' },
    ],
  },
  {
    name: 'GrassInstances',
    description: 'GPU-instanced grass with wind animation',
    props: [
      { name: 'count', type: 'number', default: '1000', description: 'Number of grass blades' },
      { name: 'areaSize', type: 'number', default: '10', description: 'Distribution area size' },
      { name: 'height', type: 'number', default: '0.5', description: 'Grass blade height' },
    ],
  },
  {
    name: 'TreeInstances',
    description: 'GPU-instanced trees',
    props: [
      { name: 'count', type: 'number', default: '100', description: 'Number of trees' },
      { name: 'areaSize', type: 'number', default: '50', description: 'Distribution area' },
    ],
  },
  {
    name: 'VolumetricFogMesh',
    description: 'Volumetric distance fog effect',
    props: [
      { name: 'color', type: 'string', default: '"#888888"', description: 'Fog color' },
      { name: 'density', type: 'number', default: '0.02', description: 'Fog density' },
    ],
  },
];

const coreFunctions = [
  {
    category: 'SDF Primitives',
    functions: [
      { name: 'sdSphere(p, radius)', description: 'Sphere signed distance function' },
      { name: 'sdBox(p, size)', description: 'Box signed distance function' },
      { name: 'sdCapsule(p, a, b, r)', description: 'Capsule signed distance function' },
      { name: 'sdTorus(p, radii)', description: 'Torus signed distance function' },
    ],
  },
  {
    category: 'SDF Operations',
    functions: [
      { name: 'opUnion(d1, d2)', description: 'Boolean union of two SDFs' },
      { name: 'opSubtraction(d1, d2)', description: 'Boolean subtraction' },
      { name: 'opSmoothUnion(d1, d2, k)', description: 'Smooth blended union' },
    ],
  },
  {
    category: 'Terrain',
    functions: [
      { name: 'marchingCubes(sdf, options)', description: 'Generate mesh from SDF' },
      { name: 'generateTerrainChunk(x, z, opts)', description: 'Generate terrain chunk' },
      { name: 'getBiomeAt(x, z)', description: 'Get biome data at position' },
    ],
  },
  {
    category: 'Instancing',
    functions: [
      { name: 'generateInstanceData(biomes)', description: 'Generate instance matrices' },
      { name: 'createInstancedMesh(geo, mat, data)', description: 'Create instanced mesh' },
    ],
  },
  {
    category: 'Characters',
    functions: [
      { name: 'createCharacter(options)', description: 'Create articulated character' },
      { name: 'animateCharacter(char, time)', description: 'Animate character' },
      { name: 'createFurSystem(geo, mat, opts)', description: 'Add fur to geometry' },
    ],
  },
  {
    category: 'Effects',
    functions: [
      { name: 'createParticleSystem(options)', description: 'Create particle emitter' },
      { name: 'createWaterMaterial(options)', description: 'Create water shader material' },
      { name: 'createSkyMaterial(options)', description: 'Create sky shader material' },
    ],
  },
];

export default function ApiReference() {
  const [tab, setTab] = useState(0);

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
          API Reference
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          Complete documentation for all Strata exports
        </Typography>

        <Paper sx={{ bgcolor: 'background.paper' }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
          >
            <Tab label="React Components" />
            <Tab label="Core Functions" />
            <Tab label="Shaders" />
          </Tabs>

          <TabPanel value={tab} index={0}>
            <Box sx={{ p: 3 }}>
              {components.map((comp) => (
                <Accordion key={comp.name} sx={{ bgcolor: 'transparent', mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Chip label={comp.name} color="primary" size="small" />
                      <Typography color="text.secondary">{comp.description}</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Prop</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Default</TableCell>
                            <TableCell>Description</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {comp.props.map((prop) => (
                            <TableRow key={prop.name}>
                              <TableCell>
                                <code>{prop.name}</code>
                              </TableCell>
                              <TableCell>
                                <Chip label={prop.type} size="small" variant="outlined" />
                              </TableCell>
                              <TableCell>
                                <code>{prop.default}</code>
                              </TableCell>
                              <TableCell>{prop.description}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          </TabPanel>

          <TabPanel value={tab} index={1}>
            <Box sx={{ p: 3 }}>
              {coreFunctions.map((cat) => (
                <Box key={cat.category} sx={{ mb: 4 }}>
                  <Typography variant="h6" color="primary.main" gutterBottom>
                    {cat.category}
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Function</TableCell>
                          <TableCell>Description</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {cat.functions.map((fn) => (
                          <TableRow key={fn.name}>
                            <TableCell>
                              <code>{fn.name}</code>
                            </TableCell>
                            <TableCell>{fn.description}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              ))}
            </Box>
          </TabPanel>

          <TabPanel value={tab} index={2}>
            <Box sx={{ p: 3 }}>
              <Typography variant="body1" color="text.secondary" paragraph>
                Strata exports all GLSL shaders for custom material creation:
              </Typography>
              <Box
                component="pre"
                sx={{
                  bgcolor: '#0a0a0f',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 1,
                  p: 2,
                  fontSize: '0.85rem',
                  fontFamily: '"Fira Code", monospace',
                }}
              >
                <code>{`import {
  waterVertexShader,
  waterFragmentShader,
  terrainVertexShader,
  terrainFragmentShader,
  furVertexShader,
  furFragmentShader,
  skyVertexShader,
  skyFragmentShader,
  volumetricFogShader,
  raymarchingVertexShader,
  raymarchingFragmentShader,
} from '@jbcom/strata';`}</code>
              </Box>
            </Box>
          </TabPanel>
        </Paper>
      </Container>
    </Box>
  );
}
