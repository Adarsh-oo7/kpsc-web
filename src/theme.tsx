'use client';

import { createTheme } from '@mui/material/styles';

// Clean Modern Blue Theme - Professional and Modern
const theme = createTheme({
  palette: {
    mode: 'light', // Light mode for clean, professional appearance
    primary: {
      main: '#1976d2',      // Material Blue 700
      dark: '#1565c0',      // Material Blue 800  
      light: '#42a5f5',     // Material Blue 400
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#546e7a',      // Blue Gray 600
      dark: '#455a64',      // Blue Gray 700
      light: '#78909c',     // Blue Gray 400
      contrastText: '#ffffff',
    },
    background: {
      default: '#fafafa',   // Light Gray - clean main background
      paper: '#ffffff',     // White - for cards, menus, sidebars
    },
    surface: {
      main: '#ffffff',      // White surface color
    },
    text: {
      primary: '#263238',   // Blue Gray 900 - primary text
      secondary: '#546e7a', // Blue Gray 600 - secondary text
    },
    grey: {
      50: '#e3f2fd',        // Light Blue 50 - for accents
      100: '#bbdefb',       // Light Blue 100
      200: '#90caf9',       // Light Blue 200
      300: '#64b5f6',       // Light Blue 300
      400: '#42a5f5',       // Light Blue 400
      500: '#2196f3',       // Light Blue 500
      600: '#1976d2',       // Blue 700 (our primary)
      700: '#1565c0',       // Blue 800
      800: '#0d47a1',       // Blue 900
      900: '#263238',       // Blue Gray 900
    },
    info: {
      main: '#2196f3',      // Light Blue 500
      light: '#64b5f6',     // Light Blue 300
      dark: '#1976d2',      // Blue 700
    },
    success: {
      main: '#4caf50',      // Green 500
      light: '#81c784',     // Green 300
      dark: '#388e3c',      // Green 700
    },
    warning: {
      main: '#ff9800',      // Orange 500
      light: '#ffb74d',     // Orange 300
      dark: '#f57c00',      // Orange 700
    },
    error: {
      main: '#f44336',      // Red 500
      light: '#e57373',     // Red 300
      dark: '#d32f2f',      // Red 700
    },
    divider: 'rgba(25, 118, 210, 0.12)', // Blue-tinted dividers
  },
  typography: {
    fontFamily: 'inherit', // Inherit font from globals.css
    h1: {
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '0.5px',
    },
    subtitle1: {
      fontWeight: 500,
    },
    subtitle2: {
      fontWeight: 500,
    },
    button: {
      fontWeight: 500,
      textTransform: 'none', // Prevent uppercase transformation
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 8, // Consistent rounded corners
  },
  components: {
    // AppBar customizations
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          boxShadow: '0 4px 20px rgba(25, 118, 210, 0.15)',
        },
      },
    },
    // Button customizations
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.25)',
          },
        },
        contained: {
          boxShadow: '0 2px 8px rgba(25, 118, 210, 0.2)',
        },
        outlined: {
          borderWidth: '1.5px',
          '&:hover': {
            borderWidth: '1.5px',
          },
        },
      },
    },
    // Card customizations
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 12px rgba(25, 118, 210, 0.08)',
          borderRadius: 12,
          border: '1px solid rgba(25, 118, 210, 0.08)',
        },
      },
    },
    // Paper customizations
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none', // Remove default gradient
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)',
        },
      },
    },
    // Drawer customizations
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid #e3f2fd',
          boxShadow: '0 0 20px rgba(25, 118, 210, 0.08)',
        },
      },
    },
    // List item customizations
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '0 8px 4px 8px',
          '&:hover': {
            backgroundColor: '#e3f2fd',
            '& .MuiListItemIcon-root': {
              color: '#1976d2',
            },
            '& .MuiListItemText-primary': {
              color: '#1976d2',
              fontWeight: 600,
            },
          },
        },
      },
    },
    // Input field customizations
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#42a5f5',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#1976d2',
              borderWidth: '2px',
            },
          },
        },
      },
    },
    // Chip customizations
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
});

export default theme;