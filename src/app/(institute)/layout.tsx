'use client';

import { useState, useEffect } from 'react';
import { Box, CssBaseline, Toolbar, CircularProgress } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useAppContext } from '../../context/AppContext';
import InstituteSidebar from '@/components/InstituteSidebar';
import InstituteHeader from '@/components/InstituteHeader';

export default function InstitutePortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isInstituteOwner, isLoading } = useAppContext();

  // This is the protection logic for the entire portal
  useEffect(() => {
    if (isLoading) return; // Wait until user check is complete
    if (!user || !isInstituteOwner) {
      router.push('/institute/login'); // Redirect if not an authenticated owner
    }
  }, [user, isInstituteOwner, isLoading, router]);

  // While checking the user's status, show a loading screen
  if (isLoading || !user || !isInstituteOwner) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default' }}>
        <CircularProgress />
      </Box>
    );
  }

  // If authorized, show the portal layout
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <InstituteHeader onDrawerToggle={() => setMobileOpen(!mobileOpen)} />
      <InstituteSidebar
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onNavigate={(path) => router.push(path)}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { lg: `calc(100% - ${280}px)` }, // Use instituteDrawerWidth
          ml: { lg: `${280}px` }, // Use instituteDrawerWidth
        }}
      >
        {/* This Toolbar adds space to push content below the fixed header */}
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}