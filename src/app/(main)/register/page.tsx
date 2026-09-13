import RegisterClient from './RegisterClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register — Create Account | KPSC Master',
  description: 'Create a free KPSC Master account to start daily smart quizzes, mock tests, and get AI-powered explanations for Kerala PSC exams.',
  keywords: ['kpsc master register', 'kerala psc signup', 'free psc mock tests sign up'],
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  return <RegisterClient nextParam={params.next ?? null} />;
}
