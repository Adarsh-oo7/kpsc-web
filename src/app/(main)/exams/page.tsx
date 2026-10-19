import ExamsClient from './ExamsClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kerala PSC Mock Tests — Free Online Practice for LDC, LGS, Degree Level',
  description: "Sit a full Kerala PSC mock paper. The next large paper is the 5 December 2026 main exam for Assistant Grade II, LD Clerk and Junior Assistant. Also practise University Assistant, LD Typist on 11 December, LDC, LGS, Degree and the October papers.",
  keywords: [
    'kerala psc mock test',
    'psc mock test malayalam',
    'kerala psc online exam practice',
    'ldc mock test',
    'lgs mock test',
    'special branch assistant mock test',
    'civil excise officer mock test',
    'kerala psc lineman',
    'nurse grade ii kerala psc',
    'fire and rescue officer mock test',
    'kerala psc electrician',
    'beat forest officer mock test',
    'laboratory attender kerala psc',
    'assistant project engineer psc',
    'police constable band mock test',
    'junior lab assistant mock test',
    'motor mechanic kerala psc',
    'vfa mock test 17 october 2026',
  ],
};

export default function Page() {
  return <ExamsClient />;
}