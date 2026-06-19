import RegisterClient from './RegisterClient';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';

export const metadata: Metadata = {
  title: 'Register — Create Account | KPSC Master',
  description: 'Create a free KPSC Master account to start daily smart quizzes, mock tests, and get AI-powered explanations for Kerala PSC exams.',
  keywords: ['kpsc master register', 'kerala psc signup', 'free psc mock tests sign up'],
};

export default function Page() {
  return (
    <Suspense fallback={
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default' }}>
        <CircularProgress sx={{ color: '#2E8B57' }} />
      </Box>
    }>
      <RegisterClient />
    </Suspense>
  );
}