import ExamsClient from './ExamsClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kerala PSC Mock Tests — Free Online Practice for LDC, LGS, Degree Level',
  description: "Experience direct Kerala PSC exam simulation. Practice full length papers under strict exam timers, check real negative marks, and master topic weightages.",
  keywords: ['kerala psc mock test', 'psc mock test malayalam', 'kerala psc online exam practice', 'ldc mock test', 'lgs mock test'],
};

export default function Page() {
  return <ExamsClient />;
}