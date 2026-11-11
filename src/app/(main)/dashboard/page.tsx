'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';
import { useAppContext } from '@/context/AppContext';

export default function GenericDashboardRedirect() {
  const router = useRouter();
  const { user, profile, isLoading } = useAppContext();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace('/login');
      } else if (profile?.is_owner) {
        router.replace('/institute/dashboard');
      } else if (profile?.institute?.slug) {
        router.replace(`/${profile.institute.slug}/dashboard`);
      } else {
        router.replace('/home');
      }
    }
  }, [user, profile, isLoading, router]);

  return (
    <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <CircularProgress />
    </Box>
  );
}

