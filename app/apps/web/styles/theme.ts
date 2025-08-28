import { ThemeOptions } from '@mui/material/styles';

const themeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: { 
      main: '#1e3a5f',
      light: '#2d5a87',
      dark: '#0f1d2f'
    },
    secondary: { 
      main: '#f39c12',
      light: '#f5b041',
      dark: '#e67e22'
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff'
    },
    text: {
      primary: '#2c3e50',
      secondary: '#6c757d'
    }
  },
  typography: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    h1: {
      fontWeight: 600,
      color: '#1e3a5f'
    },
    h2: {
      fontWeight: 600,
      color: '#1e3a5f'
    },
    h3: {
      fontWeight: 600,
      color: '#1e3a5f'
    },
    h4: {
      fontWeight: 600,
      color: '#1e3a5f'
    },
    h5: {
      fontWeight: 600,
      color: '#1e3a5f'
    },
    h6: {
      fontWeight: 500,
      color: '#1e3a5f'
    }
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          borderRadius: '12px',
          '&:hover': {
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
            transform: 'translateY(-2px)',
            transition: 'all 0.3s ease'
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 500,
          transition: 'all 0.3s ease'
        }
      }
    }
  }
};

export default themeOptions;
