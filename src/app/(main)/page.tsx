import HomeClient from './HomeClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KPSC Master — Free Kerala PSC Mock Tests 2026 | LDC, LGS, KSEB, VFA | AI Malayalam Explanations',
  description: "Kerala's #1 free PSC prep platform — 47,000+ students. Free mock tests for KSEB Electricity Worker (Mazdoor), LGS, VFA, LDC, KSRTC Conductor 2026. AI Malayalam explanations, daily quiz & leaderboard.",
  keywords: [
    'kerala psc mock test free 2026',
    'KSEB electricity worker mock test 2026 free',
    'KSEB mazdoor mock test free online',
    'VFA mock test 2026 free',
    'village field assistant mock test 2026',
    'company board LGS mock test 2026 free',
    'LGS mock test free Malayalam 2026',
    'conductor syllabus 2026 PDF Kerala PSC',
    'KSRTC conductor mock test free',
    'psc mock test AI explanation Malayalam',
    'kerala psc lgs mock test',
    'ldc mock test free online 2026',
    'kerala psc coaching thiruvananthapuram',
    'psc online coaching malayalam 2026',
    'kerala psc preparation app 2026',
    'kerala psc daily quiz with answers',
    'psc mock test streak leaderboard',
  ],
  alternates: { canonical: 'https://www.kpscmaster.in' },
  openGraph: {
    title: 'KPSC Master — Free Kerala PSC Mock Tests 2026 | KSEB, LGS, VFA, LDC',
    description: "Kerala's #1 free PSC prep platform. KSEB Electricity Worker, LGS, VFA, KSRTC Conductor mock tests 2026. AI Malayalam explanations, streak leaderboard & daily quiz.",
    url: 'https://www.kpscmaster.in',
    images: [{ url: '/KPSC MASTER.png', width: 1200, height: 630, alt: 'KPSC Master — Free Kerala PSC Mock Tests 2026' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KPSC Master — Free Kerala PSC Mock Tests 2026 | AI Malayalam Explanations',
    description: "Free mock tests for KSEB Mazdoor, LGS, VFA, LDC, KSRTC Conductor 2026. Kerala's #1 PSC prep platform.",
    images: ['/KPSC MASTER.png'],
  },
};

export default function Page() {
  return <HomeClient />;
}