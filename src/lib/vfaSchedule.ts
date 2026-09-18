export const VFA_FIRST_DATE = '2026-09-19';

export type VfaPhase = {
  date: string;
  weekday: 'Saturday';
  label: string;
  shortLabel: string;
  districts: string[];
  codes: string[];
};

export const VFA_PHASES: VfaPhase[] = [
  {
    date: '2026-09-19',
    weekday: 'Saturday',
    label: '19 September 2026',
    shortLabel: '19 Sep 2026',
    districts: ['Thiruvananthapuram', 'Pathanamthitta', 'Idukki', 'Malappuram', 'Wayanad'],
    codes: ['TVM', 'PTA', 'IDK', 'MLP', 'WYD'],
  },
  {
    date: '2026-10-17',
    weekday: 'Saturday',
    label: '17 October 2026',
    shortLabel: '17 Oct 2026',
    districts: ['Alappuzha', 'Kottayam', 'Thrissur', 'Kozhikode', 'Kasaragod'],
    codes: ['ALP', 'KTY', 'TCR', 'KOZ', 'KSD'],
  },
  {
    date: '2026-10-31',
    weekday: 'Saturday',
    label: '31 October 2026',
    shortLabel: '31 Oct 2026',
    districts: ['Kollam', 'Ernakulam', 'Palakkad', 'Kannur'],
    codes: ['KLM', 'EKM', 'PKD', 'KNR'],
  },
];

export const VFA_DISTRICTS = [
  { key: 'TVM', name: 'Thiruvananthapuram' },
  { key: 'KLM', name: 'Kollam' },
  { key: 'PTA', name: 'Pathanamthitta' },
  { key: 'ALP', name: 'Alappuzha' },
  { key: 'KTY', name: 'Kottayam' },
  { key: 'IDK', name: 'Idukki' },
  { key: 'EKM', name: 'Ernakulam' },
  { key: 'TCR', name: 'Thrissur' },
  { key: 'PKD', name: 'Palakkad' },
  { key: 'MLP', name: 'Malappuram' },
  { key: 'KOZ', name: 'Kozhikode' },
  { key: 'WYD', name: 'Wayanad' },
  { key: 'KNR', name: 'Kannur' },
  { key: 'KSD', name: 'Kasaragod' },
];

export const VFA_DATE_SUMMARY = '19 Sep, 17 Oct & 31 Oct 2026';
export const VFA_DATE_SUMMARY_LONG =
  '19 September, 17 October and 31 October 2026 (district-wise, all Saturdays)';

function parseIsoDate(raw: string): Date {
  const [year, month, day] = raw.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function startOfToday(from = new Date()): Date {
  return new Date(from.getFullYear(), from.getMonth(), from.getDate());
}

export function isVfaExam(exam?: { name?: string; slug?: string } | string | null): boolean {
  const hay = typeof exam === 'string' ? exam : `${exam?.name || ''} ${exam?.slug || ''}`;
  const lower = hay.toLowerCase();
  return lower.includes('village field') || /\bvfa\b/.test(lower) || lower.includes('village-field');
}

export function vfaPhaseForDistrict(district?: string | null): VfaPhase | null {
  if (!district) return null;
  const key = district.trim().toUpperCase();
  const name = district.trim().toLowerCase();
  return (
    VFA_PHASES.find(
      (phase) =>
        phase.codes.includes(key) ||
        phase.districts.some((item) => item.toLowerCase() === name)
    ) || null
  );
}

export function vfaDistrictName(district?: string | null): string | null {
  if (!district) return null;
  const key = district.trim().toUpperCase();
  const match = VFA_DISTRICTS.find((item) => item.key === key || item.name.toLowerCase() === district.trim().toLowerCase());
  return match?.name || null;
}

export function vfaExamDateForDistrict(district?: string | null): string | null {
  return vfaPhaseForDistrict(district)?.date || null;
}

/** District date when known; otherwise the next remaining VFA Saturday. */
export function resolveVfaExamDate(district?: string | null, from = new Date()): string {
  const districtDate = vfaExamDateForDistrict(district);
  if (districtDate) return districtDate;

  const today = startOfToday(from);
  const upcoming = VFA_PHASES.find((phase) => parseIsoDate(phase.date) >= today);
  return upcoming?.date || VFA_PHASES[VFA_PHASES.length - 1].date;
}

export function formatVfaCatalogDate(district?: string | null): string {
  const phase = vfaPhaseForDistrict(district);
  if (phase) {
    const name = vfaDistrictName(district);
    return name ? `${phase.label} (${name})` : phase.label;
  }
  return VFA_DATE_SUMMARY;
}

export function formatVfaChipDate(district?: string | null): string {
  const phase = vfaPhaseForDistrict(district);
  return phase ? phase.shortLabel : '19 Sep / 17 Oct / 31 Oct';
}

export function vfaFaqAnswer(): string {
  return [
    'The Village Field Assistant (VFA) exam is held district-wise on three Saturdays under Category 571/2025:',
    '19 September 2026 — Thiruvananthapuram, Pathanamthitta, Idukki, Malappuram, Wayanad;',
    '17 October 2026 — Alappuzha, Kottayam, Thrissur, Kozhikode, Kasaragod;',
    '31 October 2026 — Kollam, Ernakulam, Palakkad, Kannur.',
  ].join(' ');
}
