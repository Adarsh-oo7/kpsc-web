import type { Metadata } from 'next';
import LeaderboardClient from './LeaderboardClient';

export const metadata: Metadata = {
  title: 'Leaderboard — Rank Among Kerala PSC Aspirants',
  description:
    'Track your rank on the KPSC Master statewide, district, and batch leaderboards. Compete with 47,000+ Kerala PSC aspirants and climb the rankings through daily quizzes and mock tests.',
  keywords: ['kerala psc leaderboard', 'psc rank list', 'kerala psc topper rank', 'psc study competition'],
  alternates: { canonical: '/leaderboard' },
  robots: { index: false, follow: false }, // authenticated-only page
};

export default function LeaderboardPage() {
  return <LeaderboardClient />;
}
