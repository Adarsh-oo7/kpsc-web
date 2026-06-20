import HomeClient from './HomeClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KPSC Master — Kerala PSC Topper in Your Pocket | Daily Quiz & Mock Tests',
  description: "Kerala's #1 PSC prep platform with 47,000+ students. Daily mock tests for LDC, LGS, Degree Level. AI-powered Malayalam explanations. Start free — no signup needed.",
  keywords: ['kerala psc', 'kerala psc mock test', 'kerala psc online mock test', 'psc prep', 'thulasi psc', 'ldc mock test', 'lgs mock test'],
  alternates: { canonical: 'https://www.kpscmaster.in' },
  openGraph: {
    title: 'KPSC Master — Kerala PSC Topper in Your Pocket',
    description: "Kerala's #1 PSC prep platform. Daily mock tests, AI doubt solver & leaderboard for 47,000+ aspirants.",
    url: 'https://www.kpscmaster.in',
    images: [{ url: '/KPSC MASTER.png', width: 1200, height: 630, alt: 'KPSC Master' }],
  },
};


export default function Page() {
  return <HomeClient />;
}