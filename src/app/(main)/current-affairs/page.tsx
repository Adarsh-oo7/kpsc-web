import CurrentAffairsClient from './CurrentAffairsClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kerala PSC Current Affairs — Daily News Feed with MCQs',
  description: "Read carefully curated daily current affairs updates with probability tags indicating high-yield PSC topics, news summaries, and interactive MCQs.",
  keywords: ['kerala psc current affairs', 'psc current affairs malayalam', 'daily psc gk questions', 'current affairs news pdf'],
};

export default function Page() {
  return <CurrentAffairsClient />;
}
