import type { Metadata } from 'next';
import FeaturesClient from './FeaturesClient';

export const metadata: Metadata = {
  title: 'Features — Study Smarter with KPSC Master',
  description:
    'Explore all KPSC Master features: AI-powered daily quiz, full-length mock tests, interactive current affairs, leaderboard, infinite study feed, and an AI doubt solver — all designed for Kerala PSC aspirants.',
  keywords: [
    'kerala psc features',
    'psc daily quiz',
    'psc mock test features',
    'kerala psc ai tutor',
    'psc leaderboard',
    'psc study feed',
  ],
  alternates: { canonical: '/features' },
  openGraph: {
    title: 'Features — Study Smarter with KPSC Master',
    description:
      'Spaced-repetition daily quiz, full-length mock tests, AI doubt solver & more — built for Kerala PSC success.',
    url: 'https://www.kpscmaster.in/features',
  },
};

export default function FeaturesPage() {
  return <FeaturesClient />;
}