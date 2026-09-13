import ExamsClient from './ExamsClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kerala PSC Mock Tests — Free Online Practice for LDC, LGS, Degree Level',
  description: "Sit a full Kerala PSC mock paper for LDC, LGS, Degree and more. Official timer, 100 MCQs, and +1 / −0.33 marking.",
  keywords: ['kerala psc mock test', 'psc mock test malayalam', 'kerala psc online exam practice', 'ldc mock test', 'lgs mock test'],
};

export default function Page() {
  return <ExamsClient />;
}