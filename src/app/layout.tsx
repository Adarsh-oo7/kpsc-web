import '@/globals.css';
import type { Metadata, Viewport } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import { Providers } from './providers';

const jetbrainsMono = JetBrains_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'KPSC Master — Kerala PSC Topper in Your Pocket | Daily Quiz & Mock Tests',
  description: 'KPSC Master — Kerala PSC Topper in Your Pocket. Daily quiz, mock tests, current affairs, and AI doubt solving for Kerala PSC aspirants.',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#0F1117',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jetbrainsMono.variable}>
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
        
        {/* Google Identity Services SDK */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="https://accounts.google.com/gsi/client" async defer></script>
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}