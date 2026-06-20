import type { Metadata } from 'next';
import CommunityClient from './CommunityClient';

export const metadata: Metadata = {
  title: 'Community — Connect with Kerala PSC Aspirants',
  description:
    'Join the KPSC Master community forum. Share tips, ask questions, discuss exam strategies, and connect with 47,000+ Kerala PSC aspirants across the state.',
  keywords: ['kerala psc community', 'psc forum', 'kerala psc discussion', 'psc study group'],
  alternates: { canonical: '/community' },
  openGraph: {
    title: 'Community — Connect with Kerala PSC Aspirants',
    description: 'Join 47,000+ aspirants. Share study tips, ask questions, and discuss exam strategies.',
    url: 'https://www.kpscmaster.in/community',
  },
};

export default function CommunityPage() {
  return <CommunityClient />;
}
