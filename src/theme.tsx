'use client';

import { createTheme, alpha } from '@mui/material/styles';

// ===================================================
// KPSC Master — MUI Theme Generator (Light & Dark Mode)
// Primary: Forest Green #1B6B3A | Accent: Amber #F59E0B
// ===================================================

declare module '@mui/material/styles' {
  interface Palette {
    surface: { main: string; card: string; card2: string };
    streak: { main: string };
    xp: { main: string };
  }
  interface PaletteOptions {
    surface?: { main: string; card: string; card2: string };
    streak?: { main: string };
    xp?: { main: string };
  }
}

export const getTheme = (mode: 'light' | 'dark') => {
  const isDark = mode === 'dark';
  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#1B6B3A',
        light: '#2E8B57',
        dark: '#145228',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#F59E0B',
        light: '#FCD34D',
        dark: '#D97706',
        contrastText: isDark ? '#000000' : '#ffffff',
      },
      background: {
        default: isDark ? '#0F1117' : '#F8FAFC',
        paper: isDark ? '#161B22' : '#ffffff',
      },
      surface: {
        main: isDark ? '#161B22' : '#ffffff',
        card: isDark ? '#1C2230' : '#F1F5F9',
        card2: isDark ? '#252D3D' : '#E2E8F0',
      },
      streak: {
        main: '#FF6B2B',
      },
      xp: {
        main: '#8B5CF6',
      },
      text: {
        primary: isDark ? '#F0F4F8' : '#0F172A',
        secondary: isDark ? '#8892A4' : '#475569',
        disabled: isDark ? '#4A5568' : '#94A3B8',
      },
      success: {
        main: '#22c55e',
        light: '#86efac',
        dark: '#16a34a',
      },
      error: {
        main: '#EF4444',
        light: '#FCA5A5',
        dark: '#DC2626',
      },
      warning: {
        main: '#F59E0B',
        light: '#FCD34D',
        dark: '#D97706',
      },
      info: {
        main: '#3B82F6',
        light: '#93C5FD',
        dark: '#2563EB',
      },
      divider: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
    },

    typography: {
      fontFamily: "'Satoshi', 'Inter', sans-serif",
      h1: {
        fontFamily: "'Cabinet Grotesk', 'Inter', sans-serif",
        fontWeight: 800,
        letterSpacing: '-0.03em',
      },
      h2: {
        fontFamily: "'Cabinet Grotesk', 'Inter', sans-serif",
        fontWeight: 800,
        letterSpacing: '-0.02em',
      },
      h3: {
        fontFamily: "'Cabinet Grotesk', 'Inter', sans-serif",
        fontWeight: 700,
        letterSpacing: '-0.01em',
      },
      h4: {
        fontFamily: "'Cabinet Grotesk', 'Inter', sans-serif",
        fontWeight: 700,
      },
      h5: {
        fontFamily: "'Cabinet Grotesk', 'Inter', sans-serif",
        fontWeight: 700,
      },
      h6: {
        fontFamily: "'Cabinet Grotesk', 'Inter', sans-serif",
        fontWeight: 700,
        letterSpacing: '0.01em',
      },
      subtitle1: { fontWeight: 600 },
      subtitle2: { fontWeight: 600 },
      body1: {
        fontFamily: "'Satoshi', 'Inter', sans-serif",
        fontWeight: 400,
        lineHeight: 1.6,
      },
      body2: {
        fontFamily: "'Satoshi', 'Inter', sans-serif",
        fontWeight: 400,
      },
      button: {
        fontWeight: 600,
        textTransform: 'none',
        letterSpacing: '0.02em',
        fontFamily: "'Satoshi', 'Inter', sans-serif",
      },
      caption: {
        fontFamily: "'Satoshi', 'Inter', sans-serif",
        fontSize: '0.75rem',
      },
      overline: {
        fontFamily: "'Cabinet Grotesk', 'Inter', sans-serif",
        letterSpacing: '0.1em',
        fontWeight: 700,
      },
    },

    shape: {
      borderRadius: 12,
    },

    components: {
      // AppBar
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: isDark ? 'rgba(22, 27, 34, 0.85)' : 'rgba(255, 255, 255, 0.85)',
            borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
            boxShadow: isDark ? '0 1px 24px rgba(0,0,0,0.4)' : '0 1px 12px rgba(0,0,0,0.05)',
            backdropFilter: 'blur(16px)',
            color: isDark ? '#F0F4F8' : '#0F172A',
          },
        },
      },

      // Button
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            padding: '10px 20px',
            fontWeight: 600,
            transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
            '&:hover': {
              transform: 'translateY(-2px)',
            },
            '&:active': {
              transform: 'scale(0.97)',
            },
          },
          contained: {
            background: 'linear-gradient(135deg, #1B6B3A, #2E8B57)',
            boxShadow: '0 4px 16px rgba(27, 107, 58, 0.35)',
            color: '#ffffff',
            '&:hover': {
              background: 'linear-gradient(135deg, #2E8B57, #3da068)',
              boxShadow: '0 8px 24px rgba(27, 107, 58, 0.5)',
            },
          },
          containedSecondary: {
            background: 'linear-gradient(135deg, #D97706, #F59E0B)',
            color: '#000000',
            boxShadow: '0 4px 16px rgba(245, 158, 11, 0.35)',
            '&:hover': {
              background: 'linear-gradient(135deg, #F59E0B, #FCD34D)',
              boxShadow: '0 8px 24px rgba(245, 158, 11, 0.5)',
            },
          },
          outlined: {
            borderWidth: '1.5px',
            borderColor: 'rgba(46, 139, 87, 0.5)',
            color: '#2E8B57',
            '&:hover': {
              borderColor: '#2E8B57',
              background: 'rgba(27, 107, 58, 0.1)',
              borderWidth: '1.5px',
            },
          },
          text: {
            color: '#2E8B57',
            '&:hover': {
              background: 'rgba(27, 107, 58, 0.1)',
            },
          },
        },
      },

      // Card
      MuiCard: {
        styleOverrides: {
          root: {
            background: isDark ? '#161B22' : '#ffffff',
            border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
            boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.04)',
            borderRadius: 16,
            backgroundImage: 'none',
          },
        },
      },

      // Paper
      MuiPaper: {
        styleOverrides: {
          root: {
            background: isDark ? '#161B22' : '#ffffff',
            backgroundImage: 'none',
            border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
            color: isDark ? '#F0F4F8' : '#0F172A',
          },
          elevation1: {
            boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.03)',
          },
          elevation3: {
            boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.4)' : '0 4px 16px rgba(0,0,0,0.05)',
          },
        },
      },

      // Drawer
      MuiDrawer: {
        styleOverrides: {
          paper: {
            background: isDark ? '#0F1117' : '#ffffff',
            borderRight: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
            boxShadow: isDark ? '4px 0 32px rgba(0,0,0,0.5)' : '4px 0 16px rgba(0,0,0,0.03)',
          },
        },
      },

      // List items
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            margin: '2px 8px',
            transition: 'all 0.2s ease',
            color: isDark ? '#8892A4' : '#475569',
            '&:hover': {
              backgroundColor: isDark ? 'rgba(27, 107, 58, 0.12)' : 'rgba(27, 107, 58, 0.08)',
              color: '#2E8B57',
            },
            '&.Mui-selected': {
              backgroundColor: isDark ? 'rgba(27, 107, 58, 0.2)' : 'rgba(27, 107, 58, 0.12)',
              color: '#2E8B57',
              '&:hover': {
                backgroundColor: isDark ? 'rgba(27, 107, 58, 0.25)' : 'rgba(27, 107, 58, 0.16)',
              },
            },
          },
        },
      },

      // TextField
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              background: isDark ? '#1C2230' : '#ffffff',
              borderRadius: 10,
              color: isDark ? '#F0F4F8' : '#0F172A',
              '& fieldset': {
                borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(46, 139, 87, 0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#2E8B57',
                borderWidth: 2,
              },
              '& input:-webkit-autofill': {
                WebkitBoxShadow: isDark ? '0 0 0 1000px #1C2230 inset !important' : '0 0 0 1000px #ffffff inset !important',
                WebkitTextFillColor: isDark ? '#F0F4F8 !important' : '#0F172A !important',
                transition: 'background-color 5000s ease-in-out 0s',
              },
            },
            '& .MuiInputLabel-root': {
              color: isDark ? '#8892A4' : '#64748B',
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#2E8B57',
            },
          },
        },
      },

      // Chip
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            fontWeight: 600,
            fontSize: '0.75rem',
          },
          colorPrimary: {
            background: 'rgba(27, 107, 58, 0.2)',
            color: '#2E8B57',
            border: '1px solid rgba(46, 139, 87, 0.3)',
          },
          colorSecondary: {
            background: 'rgba(245, 158, 11, 0.15)',
            color: '#F59E0B',
            border: '1px solid rgba(245, 158, 11, 0.3)',
          },
        },
      },

      // Linear Progress
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            height: 8,
            background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          },
          bar: {
            borderRadius: 10,
            background: 'linear-gradient(90deg, #1B6B3A, #2E8B57)',
          },
        },
      },

      // Tabs
      MuiTab: {
        styleOverrides: {
          root: {
            color: isDark ? '#8892A4' : '#475569',
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '0.95rem',
            '&.Mui-selected': {
              color: '#2E8B57',
            },
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            background: 'linear-gradient(90deg, #1B6B3A, #2E8B57)',
            height: 3,
            borderRadius: '3px 3px 0 0',
          },
        },
      },

      // Alert
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            border: '1px solid',
          },
          standardSuccess: {
            background: isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.08)',
            borderColor: 'rgba(34, 197, 94, 0.3)',
            color: isDark ? '#86efac' : '#15803d',
          },
          standardError: {
            background: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.08)',
            borderColor: 'rgba(239, 68, 68, 0.3)',
            color: isDark ? '#fca5a5' : '#b91c1c',
          },
          standardInfo: {
            background: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.08)',
            borderColor: 'rgba(59, 130, 246, 0.3)',
            color: isDark ? '#93c5fd' : '#1d4ed8',
          },
          standardWarning: {
            background: isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.08)',
            borderColor: 'rgba(245, 158, 11, 0.3)',
            color: isDark ? '#fcd34d' : '#b45309',
          },
        },
      },

      // Tooltip
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            background: isDark ? '#252D3D' : '#ffffff',
            color: isDark ? '#F0F4F8' : '#0F172A',
            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
            borderRadius: 8,
            fontSize: '0.8rem',
            fontFamily: "'Satoshi', 'Inter', sans-serif",
          },
        },
      },

      // Dialog
      MuiDialog: {
        styleOverrides: {
          paper: {
            background: isDark ? '#161B22' : '#ffffff',
            border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
            borderRadius: 20,
          },
        },
      },

      // Select
      MuiSelect: {
        styleOverrides: {
          root: {
            background: isDark ? '#1C2230' : '#ffffff',
            color: isDark ? '#F0F4F8' : '#0F172A',
            '& fieldset': {
              borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
            },
          },
        },
      },

      // Badge
      MuiBadge: {
        styleOverrides: {
          badge: {
            background: '#EF4444',
            color: 'white',
            fontWeight: 700,
            fontSize: '0.7rem',
          },
        },
      },

      // Skeleton
      MuiSkeleton: {
        styleOverrides: {
          root: {
            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
            '&::after': {
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)',
            },
          },
        },
      },

      // Circular Progress
      MuiCircularProgress: {
        styleOverrides: {
          colorPrimary: {
            color: '#2E8B57',
          },
        },
      },
    },
  });
};

// Fallback theme export for static / backward compatibility imports
const theme = getTheme('dark');
export default theme;