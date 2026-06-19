import HomeClient from './HomeClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KPSC Master — Kerala PSC Topper in Your Pocket | Daily Quiz & Mock Tests',
  description: "Kerala's #1 PSC prep platform with 47,000+ students. Daily mock tests for LDC, LGS, Degree Level. AI-powered Malayalam explanations. Start free — no signup needed.",
  keywords: ['kerala psc', 'kerala psc mock test', 'kerala psc online mock test', 'psc prep', 'thulasi psc'],
};

export default function Page() {
  return <HomeClient />;
}