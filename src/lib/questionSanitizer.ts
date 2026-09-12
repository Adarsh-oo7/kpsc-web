/**
 * Kerala PSC MCQ sanitizer.
 * Always returns a stem plus exactly four A–D options, with letter prefixes
 * and leaked "Answer:" text stripped so the OMR-style list is clean.
 */

export const KPSC_LETTERS = ['A', 'B', 'C', 'D'] as const;
export type KpscLetter = (typeof KPSC_LETTERS)[number];

export interface QuestionData {
  id?: number;
  question_text?: string;
  text?: string;
  options?: Record<string, string> | string[] | unknown;
  correct_answer?: string;
  explanation?: string;
  [key: string]: any;
}

export interface KpscOption {
  key: KpscLetter;
  text: string;
}

const LETTER_PREFIX = /^\s*(?:\(|\[)?\s*([A-Da-d])\s*(?:\)|\]|\.)\s+/;
const ANSWER_LEAK = /^\s*(?:answer|ans)\.?\s*[:\-]\s*/i;
const ML_LETTER_PREFIX = /^\s*[\[\(]?\s*[എബിസിഡി]\s*[\)\]]\s*/;
const GLUED_B_PREFIX = /^b(?=[\u0D00-\u0D7F])/;
const MATCH_LIST = /^[A-D]\s*[:=\-]\s*\S+.+(?:[A-D]\s*[:=\-]\s*\S+)/i;
const MASHED_QUESTION = /^([\s\S]+?[?।.])\s*\d{1,3}\.\s+([\s\S]{8,})$/;
const MALAYALAM = /[\u0D00-\u0D7F]/;

function asRecord(raw: unknown): Record<string, unknown> {
  if (!raw) return {};
  if (typeof raw === 'string') {
    try {
      return asRecord(JSON.parse(raw));
    } catch {
      return {};
    }
  }
  if (Array.isArray(raw)) {
    const out: Record<string, unknown> = {};
    raw.slice(0, 4).forEach((val, idx) => {
      out[KPSC_LETTERS[idx]] = val;
    });
    return out;
  }
  if (typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    if (obj.options_list && typeof obj.options_list === 'object') {
      return obj.options_list as Record<string, unknown>;
    }
    if (obj.options && typeof obj.options === 'object' && !('A' in obj || 'a' in obj)) {
      return obj.options as Record<string, unknown>;
    }
    return obj;
  }
  return {};
}

export function cleanOptionText(value: unknown): string {
  let text = value == null ? '' : String(value);
  text = text.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
  text = text.replace(ANSWER_LEAK, '').trim();
  text = text.replace(ML_LETTER_PREFIX, '').trim();
  text = text.replace(GLUED_B_PREFIX, '').trim();
  if (MATCH_LIST.test(text)) return text;
  const prefix = text.match(LETTER_PREFIX);
  if (prefix) {
    const remainder = text.slice(prefix[0].length).trim();
    if (remainder && !KPSC_LETTERS.includes(remainder.toUpperCase() as KpscLetter)) {
      text = remainder;
    }
  }
  return text.trim();
}

export function cleanQuestionText(value: unknown): string {
  let text = value == null ? '' : String(value).replace(/\u00a0/g, ' ').trim();
  const mashed = text.match(MASHED_QUESTION);
  if (mashed && mashed[1].trim().length >= 8 && (mashed[2].includes('?') || MALAYALAM.test(mashed[2]))) {
    text = mashed[1].trim();
  }
  return text.replace(/[ \t]+/g, ' ').trim();
}

export function getKpscOptions(raw: unknown): KpscOption[] {
  const source = asRecord(raw);
  const aliases: Record<string, KpscLetter> = {
    '0': 'A', '1': 'B', '2': 'C', '3': 'D',
    OPTION_A: 'A', OPTION_B: 'B', OPTION_C: 'C', OPTION_D: 'D',
  };
  const mapped: Partial<Record<KpscLetter, string>> = {};
  for (const [key, val] of Object.entries(source)) {
    const letter = aliases[String(key).trim().toUpperCase()] || (String(key).trim().toUpperCase() as KpscLetter);
    if ((KPSC_LETTERS as readonly string[]).includes(letter) && mapped[letter] == null) {
      mapped[letter] = cleanOptionText(val);
    }
  }
  return KPSC_LETTERS.map((key) => ({ key, text: mapped[key] || '' }));
}

export function normalizeCorrectAnswer(raw: unknown, options: KpscOption[]): KpscLetter | '' {
  const letter = String(raw || '').trim().toUpperCase();
  if ((KPSC_LETTERS as readonly string[]).includes(letter)) return letter as KpscLetter;
  const needle = cleanOptionText(raw).toLowerCase();
  const match = options.find((opt) => opt.text && opt.text.toLowerCase() === needle);
  return match ? match.key : '';
}

export function sanitizeQuestion<T extends QuestionData>(q: T): T {
  if (!q) return q;

  const optionsList = getKpscOptions(q.options);
  const options = optionsList.reduce((acc, opt) => {
    acc[opt.key] = opt.text;
    return acc;
  }, {} as Record<string, string>);

  const text = cleanQuestionText(q.question_text || q.text || '');
  const correct = normalizeCorrectAnswer(q.correct_answer, optionsList);

  return {
    ...q,
    question_text: text,
    text,
    options,
    correct_answer: correct || q.correct_answer,
  };
}
