import { ReactNode, useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Container,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useTheme,
  useMediaQuery,
  Chip,
  Stack,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import GitHubIcon from '@mui/icons-material/GitHub';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import TerrainIcon from '@mui/icons-material/Terrain';
import WaterIcon from '@mui/icons-material/Water';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import GrassIcon from '@mui/icons-material/Grass';
import CloudIcon from '@mui/icons-material/Cloud';
import PetsIcon from '@mui/icons-material/Pets';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import FlareIcon from '@mui/icons-material/Flare';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import VideocamIcon from '@mui/icons-material/Videocam';
import FormatPaintIcon from '@mui/icons-material/FormatPaint';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import LightModeIcon from '@mui/icons-material/LightMode';
import GamepadIcon from '@mui/icons-material/Gamepad';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

interface LayoutProps {
  children: ReactNode;
}

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/themes', label: 'Choose Theme' },
  { path: '/getting-started', label: 'Getting Started' },
  { path: '/api', label: 'API Reference' },
];

const demoLinks: { path: string; label: string; icon: React.ReactNode }[] = [];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [demoAnchor, setDemoAnchor] = useState<null | HTMLElement>(null);

  const handleDemoClick = (event: React.MouseEvent<HTMLElement>) => {
    setDemoAnchor(event.currentTarget);
  };

  const handleDemoClose = () => {
    setDemoAnchor(null);
  };

  const Logo = () => (
    <Box
      component={RouterLink}
      to="/"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        textDecoration: 'none',
      }}
    >
      <Box
        component="svg"
        width={36}
        height={36}
        viewBox="0 0 100 100"
      >
        <defs>
          <linearGradient id="alloy-nav" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#D4845C' }} />
            <stop offset="100%" style={{ stopColor: '#5B9EA6' }} />
          </linearGradient>
        </defs>
        <rect x="10" y="60" width="80" height="12" rx="2" fill="url(#alloy-nav)" opacity="0.4" />
        <rect x="15" y="45" width="70" height="12" rx="2" fill="url(#alloy-nav)" opacity="0.6" />
        <rect x="20" y="30" width="60" height="12" rx="2" fill="url(#alloy-nav)" opacity="0.8" />
        <rect x="25" y="15" width="50" height="12" rx="2" fill="url(#alloy-nav)" />
      </Box>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          letterSpacing: '0.2em',
          background: 'linear-gradient(135deg, #D4845C 0%, #5B9EA6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        STRATA
      </Typography>
    </Box>
  );

  const drawer = (
    <Box sx={{ width: 280, pt: 2 }}>
      <Box sx={{ px: 2, mb: 2 }}>
        <Logo />
      </Box>
      <List>
        {navLinks.map((link) => (
          <ListItem key={link.path} disablePadding>
            <ListItemButton
              component={RouterLink}
              to={link.path}
              selected={location.pathname === link.path}
              onClick={() => setMobileOpen(false)}
            >
              <ListItemText primary={link.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Typography sx={{ px: 2, py: 1, color: 'text.secondary', fontSize: '0.875rem' }}>
        Demos
      </Typography>
      <List>
        {demoLinks.map((link) => (
          <ListItem key={link.path} disablePadding>
            <ListItemButton
              component={RouterLink}
              to={link.path}
              selected={location.pathname === link.path}
              onClick={() => setMobileOpen(false)}
              sx={{ gap: 1 }}
            >
              {link.icon}
              <ListItemText primary={link.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="sticky">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setMobileOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Logo />

          {!isMobile && (
            <Stack direction="row" spacing={1} alignItems="center">
              {navLinks.map((link) => (
                <Button
                  key={link.path}
                  component={RouterLink}
                  to={link.path}
                  color={location.pathname === link.path ? 'primary' : 'inherit'}
                  sx={{
                    bgcolor: location.pathname === link.path ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                  }}
                >
                  {link.label}
                </Button>
              ))}

              <Button
                color={location.pathname.startsWith('/demos') ? 'primary' : 'inherit'}
                onClick={handleDemoClick}
                endIcon={<KeyboardArrowDownIcon />}
                sx={{
                  bgcolor: location.pathname.startsWith('/demos') ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                }}
              >
                Demos
              </Button>

              <Menu
                anchorEl={demoAnchor}
                open={Boolean(demoAnchor)}
                onClose={handleDemoClose}
                PaperProps={{
                  sx: {
                    bgcolor: 'background.paper',
                    border: '1px solid rgba(255,255,255,0.1)',
                    mt: 1,
                  },
                }}
              >
                {demoLinks.map((link) => (
                  <MenuItem
                    key={link.path}
                    component={RouterLink}
                    to={link.path}
                    onClick={handleDemoClose}
                    selected={location.pathname === link.path}
                    sx={{ gap: 1.5 }}
                  >
                    {link.icon}
                    {link.label}
                  </MenuItem>
                ))}
              </Menu>

              <IconButton
                color="inherit"
                href="https://github.com/jbcom/strata"
                target="_blank"
                rel="noopener noreferrer"
              >
                <GitHubIcon />
              </IconButton>
            </Stack>
          )}
        </Toolbar>

        {location.pathname.startsWith('/demos') && !isMobile && (
          <Box
            sx={{
              bgcolor: 'rgba(5, 5, 8, 0.8)',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              py: 1,
              px: 2,
            }}
          >
            <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
              {demoLinks.map((link) => (
                <Chip
                  key={link.path}
                  component={RouterLink}
                  to={link.path}
                  label={link.label}
                  icon={link.icon}
                  clickable
                  variant={location.pathname === link.path ? 'filled' : 'outlined'}
                  color={location.pathname === link.path ? 'primary' : 'default'}
                  size="small"
                />
              ))}
            </Stack>
          </Box>
        )}
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            bgcolor: 'background.default',
          },
        }}
      >
        {drawer}
      </Drawer>

      <Box component="main" sx={{ flex: 1 }}>
        {children}
      </Box>

      <Box
        component="footer"
        sx={{
          bgcolor: '#050508',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          py: 0.75,
          px: 2,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          spacing={{ xs: 1, sm: 2 }}
          flexWrap="wrap"
          sx={{ 
            '& a, & button': { 
              fontSize: '0.7rem',
              py: 0.25,
              px: { xs: 0.5, sm: 1 },
              minWidth: 'auto',
            }
          }}
        >
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'text.secondary',
              fontSize: '0.7rem',
              display: { xs: 'none', sm: 'block' }
            }}
          >
            MIT
          </Typography>
          <Button
            href="https://github.com/jbcom/strata"
            target="_blank"
            rel="noopener noreferrer"
            color="inherit"
            size="small"
            startIcon={<GitHubIcon sx={{ fontSize: '0.9rem !important' }} />}
            sx={{ textTransform: 'none' }}
          >
            GitHub
          </Button>
          <Button
            href="https://www.npmjs.com/package/@jbcom/strata"
            target="_blank"
            rel="noopener noreferrer"
            color="inherit"
            size="small"
            sx={{ textTransform: 'none' }}
          >
            npm
          </Button>
          <Button 
            component={RouterLink} 
            to="/api" 
            color="inherit"
            size="small"
            sx={{ textTransform: 'none' }}
          >
            API
          </Button>
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'text.disabled',
              fontSize: '0.65rem',
              display: { xs: 'none', md: 'block' }
            }}
          >
            React Three Fiber
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}
