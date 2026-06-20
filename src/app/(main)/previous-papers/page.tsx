import type { Metadata } from 'next';
import PreviousPapersClient from './PreviousPapersClient';

export const metadata: Metadata = {
  title: 'Previous Year Papers — Kerala PSC Question Archives',
  description:
    'Access Kerala PSC previous year question papers for LDC, LGS, Degree Level, Police Constable, Secretariat Assistant, and more. Solve actual exam questions from past years.',
  keywords: [
    'kerala psc previous year papers',
    'psc question papers',
    'ldc previous papers',
    'kerala psc old question paper',
    'psc model papers',
  ],
  alternates: { canonical: '/previous-papers' },
  openGraph: {
    title: 'Previous Year Papers — Kerala PSC Question Archives',
    description: 'Access actual Kerala PSC previous year papers for LDC, LGS, Degree Level, and more.',
    url: 'https://www.kpscmaster.in/previous-papers',
  },
};

export default function PreviousPapersPage() {
  return <PreviousPapersClient />;
}