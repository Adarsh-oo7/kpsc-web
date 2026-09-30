import ExamsClient from './ExamsClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kerala PSC Mock Tests — Free Online Practice for LDC, LGS, Degree Level',
  description: "Sit a full Kerala PSC mock paper for LDC, LGS, Degree and more. Official timer, 100 MCQs, and +1 / −0.33 marking. Also practice Special Branch Assistant, Civil Excise Officer, Lineman, Nurse Grade II, Fire & Rescue, Electrician, Beat Forest Officer, Laboratory Attender, Assistant Project Engineer and Police Constable Band.",
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
  ],
};

export default function Page() {
  return <ExamsClient />;
}