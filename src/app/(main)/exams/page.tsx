import ExamsClient from './ExamsClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kerala PSC Mock Tests 2026 — Special Branch, Excise, Lineman, Nurse, Fire & Rescue',
  description: "Free Kerala PSC mock tests for Special Branch Assistant, Civil Excise Officer, Lineman, Nurse Grade II, Fire & Rescue, Electrician, Beat Forest Officer, Laboratory Attender, Assistant Project Engineer and Police Constable Band. 100 MCQs, official timer.",
  keywords: [
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