'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Toolbar } from '@mui/material';
import Sidebar, { drawerWidth } from '@/components/Sidebar';
import MainHeader from '@/components/MainHeader';
import { useAppContext } from '@/context/AppContext';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();
  const { user } = useAppContext();

  return (
    <Box sx={{
      display: 'flex',
      minHeight: '100vh',
      bgcolor: 'background.default',
    }}>
      <MainHeader onDrawerToggle={() => setDrawerOpen(!drawerOpen)} />

      {user && (
        <Sidebar
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          onNavigate={() => setDrawerOpen(false)}
        />
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflowX: 'hidden',
        }}
      >
        {/* Spacer for fixed AppBar */}
        <Toolbar sx={{ minHeight: 64 }} />

        {/* Page content */}
        <Box sx={{
          flex: 1,
          px: { xs: 2, sm: 3 },
          pt: { xs: 1.5, sm: 2 },
          pb: { xs: 2, sm: 3 },
          maxWidth: '100%',
        }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}