import type { Metadata } from 'next';
import SubscriptionClient from './SubscriptionClient';

export const metadata: Metadata = {
  title: 'Premium Subscription — Unlock Full KPSC Master Access',
  description:
    'Upgrade to KPSC Master Premium for unlimited mock tests, AI doubt solving, full previous year paper archive, and advanced analytics. Starting at ₹199/month.',
  keywords: ['kpsc master premium', 'psc mock test subscription', 'kerala psc pro plan', 'psc study subscription'],
  alternates: { canonical: '/subscription' },
  openGraph: {
    title: 'Premium Subscription — Unlock Full KPSC Master Access',
    description: 'Upgrade for unlimited mock tests, AI doubt solver, and full analytics. Starting at ₹199/month.',
    url: 'https://www.kpscmaster.in/subscription',
  },
};

export default function SubscriptionPage() {
  return <SubscriptionClient />;
}
