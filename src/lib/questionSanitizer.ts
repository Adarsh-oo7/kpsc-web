/**
 * Front-end defensive sanitizer for Kerala PSC Question Data.
 * Automatically cleans embedded options like [a], [b], [c], [d] from question text
 * and strips option letter prefixes from options dictionary before rendering.
 */

export interface QuestionData {
  id?: number;
  question_text?: string;
  text?: string;
  options?: Record<string, string>;
  correct_answer?: string;
  explanation?: string;
  [key: string]: any;
}

export function sanitizeQuestion<T extends QuestionData>(q: T): T {
  if (!q) return q;

  let text = q.question_text || q.text || '';
  let options = { ...(q.options || {}) };

  // 1. Regex to check if question_text contains embedded [a] ... [b] ... [c] ... [d] ...
  const embeddedMatch = text.match(/^(.*?)\s*(?:\[|\(|\b)a[.\)\]]\s*(.*?)\s*(?:\[|\(|\b)b[.\)\]]\s*(.*?)\s*(?:\[|\(|\b)c[.\)\]]\s*(.*?)\s*(?:\[|\(|\b)d[.\)\]]\s*(.*)$/is);

  if (embeddedMatch) {
    text = embeddedMatch[1].trim();
    const optA = embeddedMatch[2].trim();
    const optB = embeddedMatch[3].trim();
    const optC = embeddedMatch[4].trim();
    const optD = embeddedMatch[5].trim();

    const cleanOpt = (s: string) => s.replace(/^(?:\[|\(|\b)[a-d][.\)\]]\s*/i, '').trim();

    options = {
      A: cleanOpt(optA),
      B: cleanOpt(optB),
      C: cleanOpt(optC),
      D: cleanOpt(optD),
    };
    // 2. Clean leading option prefixes like [a], [b], [c], [d] or A), B)
    const hasMalayalamText = /[\u0D00-\u0D7F]/.test(text);
    const cleanedOpts: Record<string, string> = {};
    for (const [k, v] of Object.entries(options)) {
      if (typeof v === 'string') {
        let cleanVal = v.replace(/^(?:\[|\(|\b)[a-d][.\)\]]\s*/i, '').trim();
        // If question text is purely English, clean mismatched Malayalam option corruption
        if (!hasMalayalamText && /[\u0D00-\u0D7F]/.test(cleanVal)) {
          cleanVal = cleanVal.replace(/[\u0D00-\u0D7F]+/g, '').trim();
          if (!cleanVal) cleanVal = `Option ${k}`;
        }
        cleanedOpts[k] = cleanVal;
      } else {
        cleanedOpts[k] = v;
      }
    }
    options = cleanedOpts;
  }

  return {
    ...q,
    question_text: text,
    text: text,
    options: options,
  };
}
