import BlogIndexClient from './BlogIndexClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KPSC Master Blog — Study Guides & Kerala PSC Preparation Tips',
  description: 'Stay updated with official exam notifications, syllabus revisions, time management tips, and step-by-step subject preparation guides for Kerala PSC.',
  keywords: ['kerala psc blog', 'psc exam dates', 'psc syllabus', 'kerala psc preparation books'],
};

export default function Page() {
  return <BlogIndexClient />;
}
