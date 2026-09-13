import LoginClient from './LoginClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login — Student & Institute Portal | KPSC Master',
  description: 'Log in to your KPSC Master account to access daily smart quizzes, mock tests, and AI explanations for Kerala PSC preparation, or log in to your coaching center management dashboard.',
  keywords: ['kpsc master login', 'kerala psc thulasi login', 'coaching institute portal', 'psc preparation login'],
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; tab?: string; type?: string }>;
}) {
  const params = await searchParams;
  return (
    <LoginClient
      nextParam={params.next ?? null}
      tabParam={params.tab ?? null}
      typeParam={params.type ?? null}
    />
  );
}
