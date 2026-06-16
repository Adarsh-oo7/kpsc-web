'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';

export default function InstituteRootRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the dashboard immediately. 
    // The main layout wrapper will automatically handle redirecting 
    // to /institute/login if the user is not authenticated.
    router.replace('/institute/dashboard');
  }, [router]);

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '80vh' 
      }}
    >
      <CircularProgress />
    </Box>
  );
}
