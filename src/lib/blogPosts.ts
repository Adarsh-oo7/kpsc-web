// lib/blogPosts.ts

export interface BlogPost {
  slug: string;
  title: string;
  category: string;
  date: string;
  summary: string;
  readTime: string;
  emoji: string;
  color: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'how-to-crack-kerala-psc-ldc',
    title: 'How to Crack Kerala PSC LDC Exam in 6 Months: Complete Study Plan',
    category: 'Study Plans',
    date: 'June 12, 2026',
    summary: 'Preparing for the Lower Division Clerk (LDC) exam? Follow our step-by-step 6-month study schedule with subject-wise priority tips to crack the list and secure a government job.',
    readTime: '6 min read',
    emoji: '📅',
    color: '#1B6B3A'
  },
  {
    slug: 'kerala-psc-degree-level-syllabus-guide',
    title: 'Kerala PSC Degree Level Exams 2026: Syllabus and Strategy Guide',
    category: 'Syllabus Guides',
    date: 'May 28, 2026',
    summary: 'Comprehensive syllabus analysis for upcoming Degree Level preliminary and mains exams. Discover high-yield sections and how to maximize marks effectively.',
    readTime: '8 min read',
    emoji: '📖',
    color: '#7C3AED'
  },
  {
    slug: 'mastering-kerala-history-renaissance',
    title: 'Mastering Kerala History & Renaissance: Essential Notes for LDC & LGS',
    category: 'Study Notes',
    date: 'May 15, 2026',
    summary: 'A curated list of core historical facts, movements, and key social reformers of Kerala. Perfect study summary cards for last-minute revisions.',
    readTime: '5 min read',
    emoji: '🏛️',
    color: '#2563EB'
  },
  {
    slug: 'kerala-psc-current-affairs-daily-routine',
    title: 'How to Score Full Marks in Kerala PSC Current Affairs: Daily Routine',
    category: 'Current Affairs',
    date: 'April 29, 2026',
    summary: 'Current affairs carries major weightage. Learn our interactive daily method of reading newspapers and solving practice MCQs to remember everything on exam day.',
    readTime: '4 min read',
    emoji: '📰',
    color: '#DC2626'
  }
];
