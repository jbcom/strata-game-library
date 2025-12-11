import { ReactNode, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Fab,
  Stack,
} from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import BarChartIcon from '@mui/icons-material/BarChart';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

interface DemoLayoutProps {
  title: string;
  description: string;
  features: string[];
  children: ReactNode;
  code?: string;
  controls?: ReactNode;
}

export default function DemoLayout({
  title,
  description,
  features,
  children,
  code,
  controls,
}: DemoLayoutProps) {
  const [showCode, setShowCode] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [infoExpanded, setInfoExpanded] = useState(true);

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ position: 'relative', flex: 1 }}>
        <Canvas
          camera={{ position: [5, 5, 5], fov: 60 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
          gl={{ antialias: true }}
        >
          <color attach="background" args={['#0a0a0f']} />
          {showStats && <Stats />}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            maxPolarAngle={Math.PI / 2 + 0.1}
          />
          <ambientLight intensity={0.3} />
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
          {children}
        </Canvas>

        <Paper
          elevation={8}
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            maxWidth: 340,
            bgcolor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(10px)',
            border: '1px solid',
            borderColor: 'primary.dark',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 2,
              cursor: 'pointer',
            }}
            onClick={() => setInfoExpanded(!infoExpanded)}
          >
            <Typography
              variant="h6"
              sx={{
                color: 'primary.main',
                letterSpacing: '0.1em',
                fontWeight: 700,
              }}
            >
              {title}
            </Typography>
            <IconButton size="small" color="primary">
              {infoExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>

          <Collapse in={infoExpanded}>
            <Box sx={{ px: 2, pb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {description}
              </Typography>
              <List dense disablePadding>
                {features.map((feature, i) => (
                  <ListItem key={i} disablePadding sx={{ py: 0.25 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <ArrowForwardIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={feature}
                      primaryTypographyProps={{
                        variant: 'body2',
                        color: 'text.secondary',
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Collapse>
        </Paper>

        <Stack
          direction="row"
          spacing={1}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
          }}
        >
          <Tooltip title="Toggle Stats">
            <Fab
              size="small"
              onClick={() => setShowStats(!showStats)}
              sx={{
                bgcolor: showStats ? 'primary.dark' : 'rgba(0, 0, 0, 0.7)',
                color: showStats ? 'primary.contrastText' : 'text.secondary',
                border: '1px solid',
                borderColor: 'primary.dark',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              }}
            >
              <BarChartIcon fontSize="small" />
            </Fab>
          </Tooltip>
          {code && (
            <Tooltip title="Toggle Code">
              <Fab
                size="small"
                onClick={() => setShowCode(!showCode)}
                sx={{
                  bgcolor: showCode ? 'primary.dark' : 'rgba(0, 0, 0, 0.7)',
                  color: showCode ? 'primary.contrastText' : 'text.secondary',
                  border: '1px solid',
                  borderColor: 'primary.dark',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                }}
              >
                <CodeIcon fontSize="small" />
              </Fab>
            </Tooltip>
          )}
        </Stack>

        {controls && (
          <Paper
            elevation={8}
            sx={{
              position: 'absolute',
              bottom: 16,
              left: 16,
              p: 2,
              bgcolor: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {controls}
          </Paper>
        )}

        {showCode && code && (
          <Paper
            elevation={8}
            sx={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              maxWidth: 500,
              maxHeight: 400,
              overflow: 'auto',
              p: 2,
              bgcolor: 'rgba(0, 0, 0, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: 'primary.dark',
            }}
          >
            <Box
              component="pre"
              sx={{
                m: 0,
                fontSize: '0.8rem',
                lineHeight: 1.6,
                color: 'text.primary',
                fontFamily: '"Fira Code", monospace',
              }}
            >
              <code>{code}</code>
            </Box>
          </Paper>
        )}
      </Box>

      <Box
        sx={{
          bgcolor: 'rgba(0, 0, 0, 0.5)',
          py: 1,
          textAlign: 'center',
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Click and drag to rotate | Scroll to zoom | Right-click to pan
        </Typography>
      </Box>
    </Box>
  );
}
