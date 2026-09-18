import { formatVfaCatalogDate, isVfaExam, resolveVfaExamDate, VFA_FIRST_DATE } from '@/lib/vfaSchedule';

export type CatalogExam = {
  id: number;
  name: string;
  slug?: string;
  year?: number;
  category?: string;
  category_number?: string;
  expected_exam_date?: string | null;
  exam_dates?: Record<string, string[]> | null;
  official_syllabus?: unknown;
  question_pattern?: unknown;
};

export function flattenExamCatalog(data: unknown): CatalogExam[] {
  const payload = Array.isArray(data) ? data : (data as { results?: unknown[] })?.results || [];
  if (!payload.length) return [];
  const first = payload[0] as { exams?: CatalogExam[]; id?: number; name?: string };
  if (Array.isArray(first?.exams)) {
    return (payload as Array<{ name?: string; exams?: CatalogExam[] }>).flatMap((category) =>
      (category.exams || []).map((exam) => ({
        ...exam,
        category: category.name,
      }))
    );
  }
  return (payload as CatalogExam[]).filter((exam) => exam?.id && exam?.name);
}

export function parseExamDate(raw?: string | null): Date | null {
  if (!raw) return null;
  const match = String(raw).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** Approximate 2026 Kerala PSC windows used when the API date is empty. */
const APPROX_DATES: Array<[string, string]> = [
  ['company board', '2026-07-18'],
  ['village field', VFA_FIRST_DATE],
  ['vfa', VFA_FIRST_DATE],
  ['kseb', '2026-09-05'],
  ['electricity worker', '2026-09-05'],
  ['fire', '2026-09-26'],
  ['ksrtc', '2026-10-03'],
  ['degree level', '2026-10-10'],
  ['university lgs', '2026-10-24'],
  ['university assistant', '2026-11-28'],
  ['secretariat', '2026-11-07'],
  ['sub inspector', '2026-11-21'],
  ['si police', '2026-11-21'],
  ['civil police', '2026-09-12'],
  ['police constable', '2026-09-12'],
  ['cpo', '2026-09-12'],
  ['civil excise', '2026-12-05'],
  ['women civil excise', '2026-12-05'],
  ['last grade', '2026-08-01'],
  ['lgs', '2026-08-01'],
  ['lower division', '2026-08-15'],
  ['ld clerk', '2026-08-15'],
  ['ldc', '2026-08-15'],
  ['ld typist', '2026-09-08'],
  ['panchayat secretary', '2026-11-14'],
  ['forest guard', '2026-10-15'],
  ['beat forest', '2026-10-15'],
  ['jail warden', '2026-10-22'],
  ['kas', '2026-12-19'],
  ['staff nurse', '2026-10-18'],
  ['lp school', '2026-11-01'],
  ['up school', '2026-11-01'],
  ['high school assistant', '2026-11-08'],
  ['hsst', '2026-12-12'],
  ['assistant engineer', '2026-11-15'],
  ['junior health', '2026-10-25'],
  ['assistant prison', '2026-11-22'],
  ['general psc', '2026-08-15'],
];

export function approxExamDate(
  exam: { name?: string; slug?: string; expected_exam_date?: string | null },
  district?: string | null
): string | null {
  if (isVfaExam(exam)) return resolveVfaExamDate(district);
  if (exam.expected_exam_date) return exam.expected_exam_date;
  const hay = `${exam.name || ''} ${exam.slug || ''}`.toLowerCase();
  const match = APPROX_DATES.find(([key]) => hay.includes(key));
  return match?.[1] || null;
}

export function formatExamDate(raw?: string | null, fallback = 'Date to be announced'): string {
  const date = parseExamDate(raw);
  if (!date) return fallback;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatCatalogExamDate(
  exam: { name?: string; slug?: string; expected_exam_date?: string | null },
  district?: string | null,
  fallback = 'Date to be announced'
): string {
  if (isVfaExam(exam)) return formatVfaCatalogDate(district);
  return formatExamDate(exam.expected_exam_date || approxExamDate(exam, district), fallback);
}

