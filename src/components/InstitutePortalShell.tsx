// src/components/InstitutePortalShell.tsx

'use client';

import { useState } from 'react';
import { Box } from '@mui/material';
import { useRouter } from 'next/navigation';
import InstituteSidebar, { instituteDrawerWidth } from '@/components/InstituteSidebar';
import InstituteHeader from '../components/InstituteSidebar'; // We'll also create a separate header component

export default function InstitutePortalShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      <InstituteSidebar
        open={mobileOpen}
        onClose={handleDrawerToggle}
        onNavigate={(path) => router.push(path)}
      />
      <Box 
        component="main"
        sx={{ 
          flexGrow: 1, 
          // Make space for the permanent drawer on large screens
          ml: { lg: `${instituteDrawerWidth}px` },
          width: { lg: `calc(100% - ${instituteDrawerWidth}px)` }
        }}
      >
        <InstituteHeader onDrawerToggle={handleDrawerToggle} />
        <Box sx={{ p: { xs: 2, md: 4 } }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}