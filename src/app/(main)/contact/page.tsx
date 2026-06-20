// app/(main)/contact/page.tsx

import type { Metadata } from 'next';
import ContactClient from './ContactClient';

export const metadata: Metadata = {
  title: 'Contact Us — KPSC Master Support & Partnerships',
  description:
    'Get in touch with the KPSC Master team for support, subscriptions, features, or coaching institute partnership opportunities. We reply within 12 hours.',
  keywords: ['kpsc master contact', 'kerala psc support', 'psc institute partnership', 'kpsc master help'],
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact KPSC Master',
    description: 'Reach our support team for subscriptions, features, and institute partnerships.',
    url: 'https://www.kpscmaster.in/contact',
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
