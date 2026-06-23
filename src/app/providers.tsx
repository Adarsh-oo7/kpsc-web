'use client';

import React, { useEffect } from 'react';
import { AppProvider, useAppContext } from '@/context/AppContext';
import { getTheme } from '@/theme';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { themeMode } = useAppContext();
  const currentTheme = getTheme(themeMode);
  
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (themeMode === 'light') {
        root.classList.add('light');
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
        root.style.colorScheme = 'light';
      } else {
        root.classList.add('dark');
        root.classList.remove('light');
        root.setAttribute('data-theme', 'dark');
        root.style.colorScheme = 'dark';
      }
    }
  }, [themeMode]);
  
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
