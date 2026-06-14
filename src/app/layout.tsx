'use client';

import { AppProvider, useAppContext } from '@/context/AppContext';
import { getTheme } from '@/theme';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import '@/globals.css';

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Fontshare CDN — Cabinet Grotesk + Satoshi */}
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@700,800,900&f[]=satoshi@400,500,700&display=swap"
          rel="stylesheet"
        />
        {/* JetBrains Mono for numbers */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />

        {/* SEO Meta */}
        <title>KPSC Master — Kerala PSC Topper in Your Pocket | Daily Quiz & Mock Tests</title>
        <meta name="description" content="KPSC Master — Kerala PSC Topper in Your Pocket. Daily quiz, mock tests, current affairs, and AI doubt solving for Kerala PSC aspirants." />
        <meta name="theme-color" content="#0F1117" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body>
        <AppProvider>
          <ThemeWrapper>
            {children}
          </ThemeWrapper>
        </AppProvider>
      </body>
    </html>
  );
}