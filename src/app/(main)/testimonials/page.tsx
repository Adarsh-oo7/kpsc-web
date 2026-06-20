// app/(main)/testimonials/page.tsx

import type { Metadata } from 'next';
import TestimonialsClient from './TestimonialsClient';

export const metadata: Metadata = {
  title: 'Student Testimonials — Real Kerala PSC Success Stories',
  description:
    'Read real testimonials from 47,000+ Kerala PSC aspirants who cleared LDC, LGS, Degree Level, and other exams using KPSC Master. Ranked toppers share their preparation journey.',
  keywords: ['kerala psc testimonials', 'psc student reviews', 'kpsc master success stories', 'kerala psc topper'],
  alternates: { canonical: '/testimonials' },
  openGraph: {
    title: 'Student Testimonials — Real Kerala PSC Success Stories',
    description: 'Real students, real results. Hear from toppers who cleared Kerala PSC using KPSC Master.',
    url: 'https://www.kpscmaster.in/testimonials',
  },
};

export default function TestimonialsPage() {
  return <TestimonialsClient />;
}
