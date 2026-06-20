import type { Metadata } from 'next';
import TopicsClient from './TopicsClient';

export const metadata: Metadata = {
  title: 'PSC Topics — Browse All Kerala PSC Subjects & Chapters',
  description:
    'Browse all Kerala PSC exam topics and chapters. Study subject-wise questions in History, Geography, Indian Constitution, General Science, Current Affairs, and Mathematics.',
  keywords: ['kerala psc topics', 'psc subject chapters', 'kerala psc syllabus topics', 'psc study subjects'],
  alternates: { canonical: '/topics' },
  openGraph: {
    title: 'PSC Topics — Browse All Kerala PSC Subjects & Chapters',
    description: 'Study all Kerala PSC exam topics with chapter-wise MCQs and detailed explanations.',
    url: 'https://www.kpscmaster.in/topics',
  },
};

export default function TopicsPage() {
  return <TopicsClient />;
}