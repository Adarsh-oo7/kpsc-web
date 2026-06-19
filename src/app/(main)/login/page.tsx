import LoginClient from './LoginClient';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';

export const metadata: Metadata = {
  title: 'Login — Student & Institute Portal | KPSC Master',
  description: 'Log in to your KPSC Master account to access daily smart quizzes, mock tests, and AI explanations for Kerala PSC preparation, or log in to your coaching center management dashboard.',
  keywords: ['kpsc master login', 'kerala psc thulasi login', 'coaching institute portal', 'psc preparation login'],
};

export default function Page() {
  return (
    <Suspense fallback={
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default' }}>
        <CircularProgress sx={{ color: '#2E8B57' }} />
      </Box>
    }>
      <LoginClient />
    </Suspense>
  );
}