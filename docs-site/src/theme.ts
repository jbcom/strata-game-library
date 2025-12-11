import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#d4af37',
      light: '#f0d77f',
      dark: '#b8860b',
    },
    secondary: {
      main: '#6366f1',
    },
    background: {
      default: '#0a0a0f',
      paper: '#12121a',
    },
    text: {
      primary: '#e0e0e0',
      secondary: '#888888',
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '0.1em',
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 24px',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
          color: '#000',
          '&:hover': {
            background: 'linear-gradient(135deg, #f0d77f 0%, #d4af37 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: '#12121a',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: 'rgba(212, 175, 55, 0.4)',
            transform: 'translateY(-4px)',
            boxShadow: '0 0 30px rgba(212, 175, 55, 0.15)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(10, 10, 15, 0.95)',
          backdropFilter: 'blur(10px)',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
});

export default theme;
