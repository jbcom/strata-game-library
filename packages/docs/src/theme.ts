import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#D4845C',
      light: '#E09A75',
      dark: '#B86D45',
    },
    secondary: {
      main: '#5B9EA6',
      light: '#7BB5BC',
      dark: '#458790',
    },
    background: {
      default: '#101418',
      paper: '#181C22',
    },
    text: {
      primary: '#E8E6E3',
      secondary: '#9A9590',
    },
    warning: {
      main: '#C49A6C',
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontFamily: '"Archivo", sans-serif',
      fontWeight: 700,
      letterSpacing: '0.05em',
    },
    h2: {
      fontFamily: '"Archivo", sans-serif',
      fontWeight: 700,
    },
    h3: {
      fontFamily: '"Archivo", sans-serif',
      fontWeight: 600,
    },
    h4: {
      fontFamily: '"Archivo", sans-serif',
      fontWeight: 600,
    },
    h5: {
      fontFamily: '"Archivo", sans-serif',
      fontWeight: 600,
    },
    h6: {
      fontFamily: '"Archivo", sans-serif',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
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
          background: 'linear-gradient(135deg, #D4845C 0%, #B86D45 100%)',
          color: '#fff',
          '&:hover': {
            background: 'linear-gradient(135deg, #E09A75 0%, #D4845C 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: '#181C22',
          border: '1px solid rgba(212, 132, 92, 0.15)',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: 'rgba(212, 132, 92, 0.4)',
            transform: 'translateY(-4px)',
            boxShadow: '0 0 30px rgba(212, 132, 92, 0.15)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(16, 20, 24, 0.95)',
          backdropFilter: 'blur(10px)',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
        outlinedPrimary: {
          borderColor: 'rgba(212, 132, 92, 0.5)',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

export default theme;
