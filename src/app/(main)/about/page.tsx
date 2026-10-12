import type { Metadata } from 'next';
import AboutClient from './AboutClient';

const BASE_URL = 'https://www.kpscmaster.in';
const PAGE_URL = `${BASE_URL}/about`;

export const metadata: Metadata = {
  title: 'About KPSC Master — Kerala PSC Preparation Platform',
  description:
    'KPSC Master is a Kerala PSC exam-prep platform for mock tests, daily quizzes, current affairs, and institute tools. It is developed and maintained by Digital Product Solutions, with development contributions from Adarsh B S.',
  keywords: [
    'about kpsc master',
    'kerala psc preparation platform',
    'digital product solutions',
    'adarsh b s',
  ],
  alternates: { canonical: '/about' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'About KPSC Master',
    description:
      'Learn what KPSC Master offers Kerala PSC aspirants, and who develops and maintains the platform.',
    url: PAGE_URL,
    siteName: 'KPSC Master',
    type: 'website',
    images: [{ url: '/KPSC MASTER.png', width: 1200, height: 630, alt: 'KPSC Master' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About KPSC Master',
    description:
      'Kerala PSC mock tests, quizzes, and study tools — built by Digital Product Solutions with development from Adarsh B S.',
    images: ['/KPSC MASTER.png'],
  },
};

const aboutPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'About KPSC Master',
  url: PAGE_URL,
  description:
    'KPSC Master is a Kerala PSC exam-prep platform developed and maintained by Digital Product Solutions, with development contributions from Adarsh B S.',
  isPartOf: {
    '@type': 'WebSite',
    name: 'KPSC Master',
    url: BASE_URL,
  },
  about: {
    '@type': 'SoftwareApplication',
    name: 'KPSC Master',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web',
    url: BASE_URL,
  },
  publisher: {
    '@type': 'Organization',
    name: 'Digital Product Solutions',
    url: 'https://www.digitalproductsolutions.in/',
  },
  author: {
    '@type': 'Person',
    name: 'Adarsh B S',
    url: 'https://adarsh.digitalproductsolutions.in/',
    worksFor: {
      '@type': 'Organization',
      name: 'Digital Product Solutions',
      url: 'https://www.digitalproductsolutions.in/',
    },
  },
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageSchema) }}
      />
      <AboutClient />
    </>
  );
}
