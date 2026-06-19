'use client';

import React from 'react';
import { AppProvider, useAppContext } from '@/context/AppContext';
import { getTheme } from '@/theme';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { themeMode } = useAppContext();
  const currentTheme = getTheme(themeMode);
  
  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <ThemeWrapper>
        {children}
      </ThemeWrapper>
    </AppProvider>
  );
}
