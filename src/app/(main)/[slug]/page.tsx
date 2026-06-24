import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import ProgrammaticSeoClient from './ProgrammaticSeoClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const LOCATIONS: Record<string, string> = {
  attingal: 'Attingal',
  thiruvananthapuram: 'Thiruvananthapuram',
  varkala: 'Varkala',
  kilimanoor: 'Kilimanoor',
  chirayinkeezhu: 'Chirayinkeezhu',
  kazhakkoottam: 'Kazhakkoottam',
  nedumangad: 'Nedumangad',
  neyyattinkara: 'Neyyattinkara',
  kollam: 'Kollam',
  pathanamthitta: 'Pathanamthitta',
  kera: 'Kerala', // Support kera/kerala
  kerala: 'Kerala',
};

interface ExamInfo {
  name: string;
  formalName: string;
  duration: number;
  qCount: number;
}

const EXAMS: Record<string, ExamInfo> = {
  'ldc': { name: 'LDC', formalName: 'Kerala PSC LDC', duration: 75, qCount: 100 },
  'lgs': { name: 'LGS', formalName: 'Kerala PSC LGS', duration: 75, qCount: 100 },
  'degree-level': { name: 'Degree Level', formalName: 'Kerala PSC Degree Level', duration: 75, qCount: 100 },
  'veo': { name: 'VEO', formalName: 'Kerala PSC VEO', duration: 75, qCount: 100 },
  'ld-typist': { name: 'LD Typist', formalName: 'Kerala PSC LD Typist', duration: 75, qCount: 100 },
  'secretariat-assistant': { name: 'Secretariat Assistant', formalName: 'Kerala PSC Secretariat Assistant', duration: 75, qCount: 100 },
  'police-constable': { name: 'Police Constable', formalName: 'Kerala PSC Police Constable', duration: 75, qCount: 100 },
  'fire-and-rescue': { name: 'Fire & Rescue Officer', formalName: 'Kerala PSC Fire & Rescue Officer', duration: 75, qCount: 100 },
  'lp-teacher': { name: 'LP Teacher', formalName: 'Kerala PSC LP Teacher', duration: 75, qCount: 100 },
  'up-teacher': { name: 'UP Teacher', formalName: 'Kerala PSC UP Teacher', duration: 75, qCount: 100 },
  'clerk': { name: 'Clerk', formalName: 'Kerala PSC Clerk', duration: 75, qCount: 100 },
  'company-board': { name: 'Company Board Assistant', formalName: 'Kerala PSC Company Board Assistant', duration: 75, qCount: 100 },
  'water-authority': { name: 'Water Authority', formalName: 'Kerala Water Authority', duration: 75, qCount: 100 },
  'university-assistant': { name: 'University Assistant', formalName: 'University Assistant', duration: 75, qCount: 100 },
  'assistant-prison-officer': { name: 'Assistant Prison Officer', formalName: 'Assistant Prison Officer', duration: 75, qCount: 100 },
  'excise-officer': { name: 'Excise Officer', formalName: 'Excise Officer', duration: 75, qCount: 100 },
  'civil-excise-officer': { name: 'Civil Excise Officer', formalName: 'Civil Excise Officer', duration: 75, qCount: 100 },
};

function parseSlug(slug: string) {
  // Check exact high-intent pages
  if (slug === 'kerala-psc-ldc-online-test') {
    return { type: 'exam-generic', examKey: 'ldc', exam: EXAMS['ldc'], location: 'Kerala', locationKey: 'kerala' };
  }
  if (slug === 'kerala-psc-lgs-online-test') {
    return { type: 'exam-generic', examKey: 'lgs', exam: EXAMS['lgs'], location: 'Kerala', locationKey: 'kerala' };
  }
  if (slug === 'kerala-psc-degree-level-online-test') {
    return { type: 'exam-generic', examKey: 'degree-level', exam: EXAMS['degree-level'], location: 'Kerala', locationKey: 'kerala' };
  }
  if (slug === 'kerala-psc-daily-quiz') {
    return { type: 'quiz-generic', location: 'Kerala', locationKey: 'kerala' };
  }

  // Check 1: kerala-psc-mock-test-[location]
  if (slug.startsWith('kerala-psc-mock-test-')) {
    const locKey = slug.replace('kerala-psc-mock-test-', '');
    if (LOCATIONS[locKey]) {
      return { type: 'mock-test-location', locationKey: locKey, location: LOCATIONS[locKey] };
    }
  }

  // Check 2: psc-online-coaching-[location]
  if (slug.startsWith('psc-online-coaching-')) {
    const locKey = slug.replace('psc-online-coaching-', '');
    if (LOCATIONS[locKey]) {
      return { type: 'online-coaching-location', locationKey: locKey, location: LOCATIONS[locKey] };
    }
  }

  // Check 3: psc-coaching-[location]
  if (slug.startsWith('psc-coaching-')) {
    const locKey = slug.replace('psc-coaching-', '');
    if (LOCATIONS[locKey]) {
      return { type: 'coaching-location', locationKey: locKey, location: LOCATIONS[locKey] };
    }
  }

  // Check 4: kerala-psc-[exam]-[location]
  if (slug.startsWith('kerala-psc-')) {
    const withoutPrefix = slug.replace('kerala-psc-', '');
    const parts = withoutPrefix.split('-');
    if (parts.length >= 2) {
      const locKey = parts[parts.length - 1];
      if (LOCATIONS[locKey]) {
        const examKey = parts.slice(0, -1).join('-');
        if (EXAMS[examKey]) {
          return {
            type: 'exam-location',
            examKey,
            locationKey: locKey,
            exam: EXAMS[examKey],
            location: LOCATIONS[locKey]
          };
        }
      }
    }
  }

  return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = parseSlug(slug);

  if (!data) {
    return {
      title: 'Page Not Found | KPSC Master',
      description: 'The requested Kerala PSC preparation page does not exist.',
    };
  }

  let title = '';
  let description = '';

  if (data.type === 'exam-location' && data.exam) {
    title = `Kerala PSC ${data.exam.name} Coaching & Mock Test in ${data.location} | KPSC Master`;
    description = `Preparing for Kerala PSC ${data.exam.name} in ${data.location}? Access free online mock tests, subject weightages, SCERT materials, and leaderboards on KPSC Master.`;
  } else if (data.type === 'mock-test-location') {
    title = `Free Kerala PSC Online Mock Tests in ${data.location} | KPSC Master`;
    description = `Practice official syllabus Kerala PSC mock tests online. Simulators with timer, negative marks, and daily current affairs for aspirants in ${data.location}.`;
  } else if (data.type === 'coaching-location') {
    title = `Best Kerala PSC Coaching Classes in ${data.location} | KPSC Master`;
    description = `Looking for top Kerala PSC coaching in ${data.location}? Get digital classes, daily study streak systems, and AI explanations. Trusted by 47,000+ aspirants.`;
  } else if (data.type === 'online-coaching-location') {
    title = `Kerala PSC Online Coaching & Classes in ${data.location} | KPSC Master`;
    description = `Accelerate your Kerala PSC preparation with our complete online coaching program in ${data.location}. Practice Daily Smart Quizzes & Mock Exams.`;
  } else if (data.type === 'exam-generic' && data.exam) {
    title = `Kerala PSC ${data.exam.name} Mock Test — Free Online Practice | KPSC Master`;
    description = `Practice the latest ${data.exam.formalName} mock tests. Includes subject weightages, SCERT-based arithmetic, and repeated renaissance questions.`;
  } else if (data.type === 'quiz-generic') {
    title = `Kerala PSC Daily Smart Quiz — Free Online Practice | KPSC Master`;
    description = `Solve daily smart quizzes with explanations in Malayalam and English. Maintain streaks, earn badges, and track rankings. Free to start.`;
  }

  return {
    title,
    description,
    alternates: {
      canonical: `https://www.kpscmaster.in/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://www.kpscmaster.in/${slug}`,
      siteName: 'KPSC Master',
      images: [
        {
          url: '/KPSC MASTER.png',
          width: 1200,
          height: 630,
          alt: `KPSC Master — ${title}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/KPSC MASTER.png'],
    },
  };
}

export async function generateStaticParams() {
  const paths: { slug: string }[] = [];
  const locKeys = Object.keys(LOCATIONS).filter(k => k !== 'kera'); // Exclude duplicate key
  const examKeys = Object.keys(EXAMS);

  // 1. Exam + Location (17 exams * 11 locations = 187 paths)
  examKeys.forEach(exam => {
    locKeys.forEach(loc => {
      paths.push({ slug: `kerala-psc-${exam}-${loc}` });
    });
  });

  // 2. Mock Test + Location (11 paths)
  locKeys.forEach(loc => {
    paths.push({ slug: `kerala-psc-mock-test-${loc}` });
  });

  // 3. Coaching + Location (11 paths)
  locKeys.forEach(loc => {
    paths.push({ slug: `psc-coaching-${loc}` });
  });

  // 4. Online Coaching + Location (11 paths)
  locKeys.forEach(loc => {
    paths.push({ slug: `psc-online-coaching-${loc}` });
  });

  // 5. Generic Pages (4 paths)
  paths.push({ slug: 'kerala-psc-ldc-online-test' });
  paths.push({ slug: 'kerala-psc-lgs-online-test' });
  paths.push({ slug: 'kerala-psc-degree-level-online-test' });
  paths.push({ slug: 'kerala-psc-daily-quiz' });

  return paths;
}

export default async function ProgrammaticSeoPage({ params }: PageProps) {
  const { slug } = await params;
  const data = parseSlug(slug);

  if (!data) {
    return notFound();
  }

  const BASE_URL = 'https://www.kpscmaster.in';

  // Build JSON-LD Schemas based on page data
  const schemas: any[] = [];

  // 1. BreadcrumbList Schema (Applies to all)
  const breadcrumbList: any = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': BASE_URL,
      },
    ],
  };

  if (data.locationKey !== 'kerala') {
    breadcrumbList.itemListElement.push({
      '@type': 'ListItem',
      'position': 2,
      'name': `Coaching in ${data.location}`,
      'item': `${BASE_URL}/psc-coaching-${data.locationKey}`,
    });
  }

  breadcrumbList.itemListElement.push({
    '@type': 'ListItem',
    'position': data.locationKey !== 'kerala' ? 3 : 2,
    'name': data.exam ? data.exam.name : 'Coaching',
    'item': `${BASE_URL}/${slug}`,
  });
  schemas.push(breadcrumbList);

  // 2. Course Schema (For exam + location pages)
  if (data.type === 'exam-location' && data.exam) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Course',
      'name': `${data.exam.formalName} online coaching classes in ${data.location}`,
      'description': `Comprehensive online preparation course for the ${data.exam.formalName} exam, tailored for aspirants in ${data.location}. Includes daily smart quizzes, mock test series, study cards, and live leaderboards.`,
      'provider': {
        '@type': 'EducationalOrganization',
        'name': 'KPSC Master',
        'sameAs': BASE_URL,
        'location': {
          '@type': 'Place',
          'name': 'Attingal, Thiruvananthapuram, Kerala, India'
        }
      },
    });
  }

  // 3. Quiz / SoftwareApplication Schema (For mock test / quiz pages)
  if (data.type === 'mock-test-location' || data.type === 'quiz-generic') {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Quiz',
      'name': data.exam ? `Kerala PSC ${data.exam.name} mock test` : `Kerala PSC Mock Tests in ${data.location}`,
      'description': `Simulated online practice tests with timer & negative marks. Optimized for candidates preparing in ${data.location}.`,
      'educationalAlignment': {
        '@type': 'AlignmentObject',
        'educationalFramework': 'Kerala Public Service Commission (KPSC)',
        'targetName': data.exam ? data.exam.name : 'Kerala PSC Exams',
      },
    });
  }

  // 4. FAQ Schema
  const faqs = [
    {
      q: `Does KPSC Master support aspirants from ${data.location}?`,
      a: `Yes! KPSC Master is an in-house product of Digital Product Solutions. We serve aspirants in ${data.location}, Thiruvananthapuram, Kollam, and all other 14 districts of Kerala. We provide online mock tests, daily quizzes, and detailed performance tracking designed to adapt to the local syllabus expectations.`
    },
    {
      q: `Are the questions available in Malayalam and English?`,
      a: `Yes, KPSC Master provides full Malayalam and English support (മലയാളം + English Support) for all mock tests and daily quizzes, including detailed explanation guides for every single answer.`
    },
    {
      q: `Can I see district-wise leaderboards for ${data.location}?`,
      a: `Absolutely. You can track your study rankings against other aspirants specifically in ${data.location} and the rest of Thiruvananthapuram/Kerala. This helps you understand where you stand in district-specific recruitment counts.`
    },
    {
      q: `How does KPSC Master compare to traditional offline coaching centers in ${data.location}?`,
      a: `KPSC Master offers flexible, 24/7 mobile learning with gamified psychology mechanisms (like study streaks), instant AI doubt solving, and a database of 12 Lakh+ daily solved questions, at a fraction of the cost of offline coaching classes in ${data.location}.`
    }
  ];

  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map(f => ({
      '@type': 'Question',
      'name': f.q,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': f.a,
      },
    })),
  });

  return (
    <>
      {/* Inject schemas on Server Side */}
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <ProgrammaticSeoClient
        type={data.type}
        location={data.location}
        locationKey={data.locationKey}
        exam={data.exam}
        examKey={data.examKey}
      />
    </>
  );
}
