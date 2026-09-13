import type { Metadata } from 'next';
import SettingsClient from './SettingsClient';

export const metadata: Metadata = {
  title: 'Settings — Account, theme, and language | KPSC Master',
  description: 'Change appearance, study language, practice mix, and password for your KPSC Master account.',
  robots: { index: false, follow: false },
};

export default function SettingsPage() {
  return <SettingsClient />;
}
