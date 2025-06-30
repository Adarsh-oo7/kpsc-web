'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CssBaseline, Toolbar, Container } from '@mui/material';
import Sidebar, { drawerWidth } from '@/components/Sidebar';
import MainHeader from '@/components/MainHeader';

// Clean Modern Blue Theme Colors
const blueTheme = {
  primary: '#1976d2',      // Material Blue 700
  primaryDark: '#1565c0',  // Material Blue 800
  primaryLight: '#42a5f5', // Material Blue 400
  secondary: '#546e7a',    // Blue Gray 600
  background: '#fafafa',   // Light Gray
  surface: '#ffffff',      // White
  text: {
    primary: '#263238',    // Blue Gray 900
    secondary: '#546e7a',  // Blue Gray 600
    white: '#ffffff'
  },
  accent: '#e3f2fd'        // Light Blue 50
};

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh', 
      bgcolor: blueTheme.background,
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 20% 80%, ${blueTheme.accent}40 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, ${blueTheme.primaryLight}20 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, ${blueTheme.accent}30 0%, transparent 50%)
        `,
        pointerEvents: 'none',
        zIndex: 0
      }
    }}>
      <CssBaseline />
      
      <MainHeader onDrawerToggle={() => setDrawerOpen(!drawerOpen)} />
      
      <Sidebar
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onNavigate={(path) => {
          router.push(path);
          setDrawerOpen(false); // Close drawer on mobile after navigation
        }}
      />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          ml: { lg: `${drawerWidth}px` },
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Toolbar sx={{ minHeight: 64 }} /> {/* This pushes content below the fixed AppBar */}
        
        <Container
          maxWidth="xl"
          sx={{
            flex: 1,
            py: 3,
            px: { xs: 2, sm: 3 },
            display: 'flex',
            flexDirection: 'column',
            gap: 3
          }}
        >
          {/* Content wrapper with subtle styling */}
          <Box
            sx={{
              flex: 1,
              borderRadius: 2,
              bgcolor: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${blueTheme.accent}`,
              boxShadow: '0 4px 20px rgba(25, 118, 210, 0.08)',
              p: { xs: 2, sm: 3 },
              minHeight: 'calc(100vh - 120px)',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                boxShadow: '0 8px 32px rgba(25, 118, 210, 0.12)',
              }
            }}
          >
            {children}
          </Box>
        </Container>
        
        {/* Optional: Footer space */}
        <Box
          sx={{
            py: 2,
            px: 3,
            textAlign: 'center',
            color: blueTheme.text.secondary,
            fontSize: '0.875rem',
            borderTop: `1px solid ${blueTheme.accent}`,
            bgcolor: 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(5px)'
          }}
        >
          {/* You can add footer content here if needed */}
        </Box>
      </Box>
    </Box>
  );
}