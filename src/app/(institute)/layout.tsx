'use client';

import { useState, useEffect } from 'react';
import { Box, CssBaseline, Toolbar, CircularProgress } from '@mui/material';
import { useRouter, usePathname } from 'next/navigation';
import { useAppContext } from '../../context/AppContext';
import InstituteSidebar from '@/components/InstituteSidebar';
import InstituteHeader from '@/components/InstituteHeader';

export default function InstitutePortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isInstituteOwner, isLoading } = useAppContext();

  const isLoginPage = pathname === '/institute/login';
  const isRegisterPage = pathname === '/institute/register';
  const isBypassAuth = isLoginPage || isRegisterPage;

  // This is the protection logic for the entire portal
  useEffect(() => {
    if (isLoading || isBypassAuth) return; // Wait until user check is complete, or bypass on login/register pages
    if (!user || !isInstituteOwner) {
      router.push('/institute/login'); // Redirect if not an authenticated owner
    }
  }, [user, isInstituteOwner, isLoading, router, isBypassAuth]);

  // If on login or register page, directly render children without portal frame or loading overlay
  if (isBypassAuth) {
    return <>{children}</>;
  }

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
          width: '100%',
        }}
      >
        {/* This Toolbar adds space to push content below the fixed header */}
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}