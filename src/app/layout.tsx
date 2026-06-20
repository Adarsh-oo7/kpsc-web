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

const BASE_URL = 'https://www.kpscmaster.in';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: 'KPSC Master — Kerala PSC Topper in Your Pocket',
    template: '%s | KPSC Master',
  },
  description:
    "Kerala's #1 PSC prep platform with 47,000+ students. Daily mock tests for LDC, LGS, Degree Level & more. AI-powered Malayalam explanations. Free daily quiz — no signup needed.",
  keywords: [
    'kerala psc',
    'kpsc mock test',
    'kerala psc online mock test',
    'psc prep',
    'thulasi psc',
    'kerala psc daily quiz',
    'ldc mock test',
    'lgs mock test',
    'kerala psc current affairs',
    'psc previous year papers',
    'psc study app',
    'kerala psc ai doubt solver',
  ],
  authors: [{ name: 'KPSC Master', url: BASE_URL }],
  creator: 'KPSC Master',
  publisher: 'KPSC Master',
  category: 'Education',

  // Canonical & alternates
  alternates: {
    canonical: '/',
  },

  // Open Graph — social sharing cards
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: BASE_URL,
    siteName: 'KPSC Master',
    title: 'KPSC Master — Kerala PSC Topper in Your Pocket',
    description:
      "Kerala's #1 PSC prep platform. Daily mock tests, AI doubt solver, current affairs & leaderboard for 47,000+ aspirants.",
    images: [
      {
        url: '/KPSC MASTER.png',
        width: 1200,
        height: 630,
        alt: 'KPSC Master — Kerala PSC Preparation Platform',
      },
    ],
  },

  // Twitter / X Card
  twitter: {
    card: 'summary_large_image',
    site: '@kpscmaster',
    creator: '@kpscmaster',
    title: 'KPSC Master — Kerala PSC Topper in Your Pocket',
    description:
      "Kerala's #1 PSC prep platform. Daily mock tests, AI doubt solver, current affairs & leaderboard for 47,000+ aspirants.",
    images: ['/KPSC MASTER.png'],
  },

  // Browser Tab & PWA icons — all sizes
  icons: {
    icon: [
      { url: '/logo.png', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    shortcut: '/favicon.ico',
    apple: [{ url: '/logo.png', sizes: '180x180', type: 'image/png' }],
    other: [
      { rel: 'mask-icon', url: '/logo.png', color: '#16a34a' },
    ],
  },

  // App metadata
  applicationName: 'KPSC Master',
  referrer: 'origin-when-cross-origin',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0F1117' },
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

// Site-wide JSON-LD Organisation schema
const organisationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'KPSC Master',
  url: BASE_URL,
  logo: `${BASE_URL}/logo.png`,
  sameAs: [],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+91-94003-55185',
    contactType: 'customer service',
    areaServed: 'IN',
    availableLanguage: ['English', 'Malayalam'],
  },
  description:
    "Kerala's #1 PSC preparation platform with daily mock tests, AI doubt solving, current affairs, and leaderboard for 47,000+ aspirants.",
};

// Site-wide JSON-LD WebSite schema (enables Google Sitelinks search)
const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'KPSC Master',
  url: BASE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${BASE_URL}/exams?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
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

        {/* Web App Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Google Identity Services SDK */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="https://accounts.google.com/gsi/client" async defer></script>

        {/* JSON-LD: Organisation + Website schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organisationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}