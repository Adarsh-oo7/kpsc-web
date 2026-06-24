import HomeClient from './HomeClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KPSC Master — Kerala PSC Topper in Your Pocket | Daily Quiz & Mock Tests',
  description: "Kerala's #1 PSC prep platform with 47,000+ students. Trusted by aspirants in Attingal, Thiruvananthapuram, and across Kerala. Daily mock tests for LDC, LGS & Degree Level. AI-powered Malayalam explanations.",
  keywords: [
    'kerala psc',
    'kerala psc mock test',
    'kerala psc online mock test',
    'psc prep',
    'thulasi psc',
    'ldc mock test',
    'lgs mock test',
    'kerala psc coaching attingal',
    'psc coaching thiruvananthapuram',
    'best psc app in attingal',
    'psc online test thiruvananthapuram',
    'kerala psc preparation app',
    'kerala psc daily quiz with answers'
  ],
  alternates: { canonical: 'https://www.kpscmaster.in' },
  openGraph: {
    title: 'KPSC Master — Kerala PSC Topper in Your Pocket',
    description: "Kerala's #1 PSC prep platform. Trusted by aspirants in Attingal, Thiruvananthapuram, and across Kerala. Free daily mock tests, AI explanations & leaderboard.",
    url: 'https://www.kpscmaster.in',
    images: [{ url: '/KPSC MASTER.png', width: 1200, height: 630, alt: 'KPSC Master' }],
  },
};

export default function Page() {
  return <HomeClient />;
}