import InstituteRegisterClient from './InstituteRegisterClient';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';

export const metadata: Metadata = {
  title: 'Register Academy — Coaching Center Portal | KPSC Master',
  description: 'Register your coaching institute on KPSC Master. Provide custom subdomains, branded student portals, mock exams, fees tracker, and detailed analytics for your academy.',
  keywords: ['coaching institute register', 'kpsc master academy signup', 'institute management portal'],
};

export default function Page() {
  return (
    <Suspense fallback={
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default' }}>
        <CircularProgress sx={{ color: '#8B5CF6' }} />
      </Box>
    }>
      <InstituteRegisterClient />
    </Suspense>
  );
}
