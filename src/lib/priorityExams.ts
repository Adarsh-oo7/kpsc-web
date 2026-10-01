export type PriorityExam = {
  rank: number;
  slug: string;
  name: string;
  shortName: string;
  opportunity: string;
  badge: string;
  level: string;
  durationMinutes: number;
  catNo: string;
  applyBy?: string;
  keywords: string[];
  title: string;
  description: string;
  syllabus: { topic: string; marks: number }[];
};

/** Current Kerala PSC prep / exam / result-search cycle — keep these first in SEO and search. */
export const PRIORITY_EXAMS: PriorityExam[] = [
  {
    rank: 1,
    slug: 'village-field-assistant',
    name: 'Village Field Assistant',
    shortName: 'VFA',
    opportunity: 'Admit card from 1 Oct · Exam 17 Oct and 31 Oct 2026',
    badge: 'Exam this month',
    level: 'SSLC',
    durationMinutes: 90,
    catNo: '571/2025',
    keywords: ['village field assistant mock test', 'vfa mock test 2026', 'vfa exam 17 october 2026', 'vfa admit card'],
    title: 'VFA Mock Test 2026 | Village Field Assistant Exam 17 & 31 Oct | Kerala PSC',
    description:
      'Kerala PSC Village Field Assistant mock tests for the 17 October and 31 October 2026 district exams. 100 MCQs, Cat 571/2025, agriculture, GK, maths and English. Two sets free, then a one-time unlock.',
    syllabus: [
      { topic: 'History', marks: 5 },
      { topic: 'Geography', marks: 5 },
      { topic: 'Economics', marks: 5 },
      { topic: 'Constitution and Polity', marks: 5 },
      { topic: 'Facts About Kerala', marks: 5 },
      { topic: 'Biology and Public Health', marks: 6 },
      { topic: 'Physics', marks: 3 },
      { topic: 'Chemistry', marks: 3 },
      { topic: 'Arts Culture Literature Sports', marks: 5 },
      { topic: 'Computer', marks: 3 },
      { topic: 'Important Laws', marks: 5 },
      { topic: 'Vocational Agriculture Topics', marks: 20 },
      { topic: 'Maths', marks: 10 },
      { topic: 'English', marks: 10 },
      { topic: 'Malayalam', marks: 10 },
    ],
  },
  {
    rank: 2,
    slug: 'junior-lab-assistant',
    name: 'Junior Lab Assistant',
    shortName: 'Jr Lab Assistant',
    opportunity: 'OMR exam Saturday 3 October 2026 · Medical Education',
    badge: 'Exam 3 Oct',
    level: 'Plus Two Science',
    durationMinutes: 90,
    catNo: '733/2025',
    keywords: ['junior lab assistant kerala psc', 'junior lab assistant exam date 2026', 'cat 733/2025 mock test'],
    title: 'Junior Lab Assistant Mock Test 2026 | Exam 3 Oct | Kerala PSC Cat 733/2025',
    description:
      'Kerala PSC Junior Lab Assistant mock tests for the 3 October 2026 OMR exam. Lab techniques, physics, chemistry, biology and general science. 100 MCQs, Cat 733/2025.',
    syllabus: [
      { topic: 'Lab Safety and Instruments', marks: 20 },
      { topic: 'Physics', marks: 20 },
      { topic: 'Chemistry', marks: 20 },
      { topic: 'Biology and Public Health', marks: 20 },
      { topic: 'Facts About Kerala', marks: 10 },
      { topic: 'Maths', marks: 10 },
    ],
  },
  {
    rank: 3,
    slug: 'motor-mechanic',
    name: 'Motor Mechanic',
    shortName: 'Motor Mechanic',
    opportunity: 'Online exam Tuesday 13 October 2026 · Health Services',
    badge: 'Exam 13 Oct',
    level: 'ITI Automobile',
    durationMinutes: 90,
    catNo: '630/2025',
    keywords: ['motor mechanic kerala psc', 'motor mechanic exam 13 october 2026', 'cat 630/2025 mock test'],
    title: 'Motor Mechanic Mock Test 2026 | Exam 13 Oct | Kerala PSC',
    description:
      'Kerala PSC Motor Mechanic mock tests for the 13 October 2026 exam. Engines, brakes, clutch, steering, lubrication and auto electrical. 100 MCQs, Cat 630/2025 and 603/2025.',
    syllabus: [
      { topic: 'Engine and Fuel System', marks: 20 },
      { topic: 'Brake Clutch and Transmission', marks: 20 },
      { topic: 'Steering and Suspension', marks: 10 },
      { topic: 'Cooling and Lubrication', marks: 10 },
      { topic: 'Auto Electrical', marks: 15 },
      { topic: 'Facts About Kerala', marks: 10 },
      { topic: 'Maths', marks: 10 },
      { topic: 'English', marks: 5 },
    ],
  },
  {
    rank: 4,
    slug: 'special-branch-assistant',
    name: 'Special Branch Assistant',
    shortName: 'SB Assistant',
    opportunity: 'Shortlist published Sept 2026 — strong ongoing search cycle',
    badge: 'Shortlist live',
    level: 'SSLC',
    durationMinutes: 75,
    catNo: 'Various / 2026',
    keywords: ['special branch assistant', 'special branch assistant shortlist 2026', 'kerala psc special branch assistant mock test'],
    title: 'Special Branch Assistant Mock Test 2026 | Shortlist + Free Kerala PSC Practice',
    description:
      'Kerala PSC Special Branch Assistant mock tests after the Sept 2026 shortlist. 100 MCQs, official timer, topic-wise GK, arithmetic, English and police special papers.',
    syllabus: [
      { topic: 'History', marks: 8 },
      { topic: 'Geography', marks: 7 },
      { topic: 'Constitution and Polity', marks: 10 },
      { topic: 'Facts About Kerala', marks: 8 },
      { topic: 'Daily Current Affairs', marks: 10 },
      { topic: 'Maths', marks: 10 },
      { topic: 'English', marks: 10 },
      { topic: 'Malayalam', marks: 10 },
      { topic: 'Science', marks: 7 },
      { topic: 'Special Branch and Police Topics', marks: 20 },
    ],
  },
  {
    rank: 5,
    slug: 'civil-excise-officer',
    name: 'Civil Excise Officer',
    shortName: 'CEO',
    opportunity: 'Current PSC examination updates + recruitment activity',
    badge: 'Exam cycle',
    level: 'SSLC',
    durationMinutes: 75,
    catNo: 'Various / 2026',
    keywords: ['civil excise officer', 'kerala psc civil excise officer mock test', 'excise officer previous questions'],
    title: 'Civil Excise Officer Mock Test 2026 | Kerala PSC CEO Online Practice',
    description:
      'Free Kerala PSC Civil Excise Officer mock tests with 100 MCQs, −0.33 marking, and syllabus covering GK, arithmetic, English and excise special topics.',
    syllabus: [
      { topic: 'History', marks: 8 },
      { topic: 'Geography', marks: 7 },
      { topic: 'Constitution and Polity', marks: 10 },
      { topic: 'Facts About Kerala', marks: 8 },
      { topic: 'Daily Current Affairs', marks: 10 },
      { topic: 'Maths', marks: 10 },
      { topic: 'English', marks: 10 },
      { topic: 'Malayalam', marks: 10 },
      { topic: 'Science', marks: 7 },
      { topic: 'Excise Special Topics', marks: 20 },
    ],
  },
  {
    rank: 6,
    slug: 'lineman',
    name: 'Lineman',
    shortName: 'Lineman',
    opportunity: 'Shortlists appearing in Sept 2026',
    badge: 'Shortlist',
    level: 'ITI / SSLC',
    durationMinutes: 90,
    catNo: 'Various / 2026',
    keywords: ['kerala psc lineman', 'lineman shortlist 2026', 'kseb lineman mock test'],
    title: 'Lineman Mock Test 2026 | Kerala PSC Lineman Shortlist Practice',
    description:
      'Kerala PSC Lineman mock tests aligned to electrical trade papers: Ohm’s law, overhead lines, safety, transformers and GK. Practice after the Sept 2026 shortlists.',
    syllabus: [
      { topic: 'Basic Electricity', marks: 15 },
      { topic: 'Ohm\'s Law and Circuits', marks: 15 },
      { topic: 'Overhead Lines and Safety', marks: 15 },
      { topic: 'Transformers and Distribution', marks: 15 },
      { topic: 'Instruments and Earthing', marks: 10 },
      { topic: 'Facts About Kerala', marks: 10 },
      { topic: 'Maths', marks: 10 },
      { topic: 'English', marks: 10 },
    ],
  },
  {
    rank: 7,
    slug: 'nurse-grade-ii',
    name: 'Nurse Grade II',
    shortName: 'Nurse Gr II',
    opportunity: 'Active district recruitment / shortlist activity',
    badge: 'District lists',
    level: 'GNM / Nursing',
    durationMinutes: 75,
    catNo: 'Various / 2026',
    keywords: ['nurse grade 2 kerala psc', 'staff nurse grade ii mock test', 'kerala psc nurse shortlist'],
    title: 'Nurse Grade II Mock Test 2026 | Kerala PSC Staff Nurse Practice',
    description:
      'Kerala PSC Nurse Grade II mock tests for district recruitment: anatomy, nursing procedures, first aid, public health, GK and English. 100 MCQs like the real paper.',
    syllabus: [
      { topic: 'Anatomy and Physiology', marks: 20 },
      { topic: 'Fundamentals of Nursing', marks: 20 },
      { topic: 'Community Health and First Aid', marks: 15 },
      { topic: 'Biology and Public Health', marks: 10 },
      { topic: 'Facts About Kerala', marks: 10 },
      { topic: 'Daily Current Affairs', marks: 5 },
      { topic: 'English', marks: 10 },
      { topic: 'Malayalam', marks: 10 },
    ],
  },
  {
    rank: 8,
    slug: 'fire-and-rescue',
    name: 'Fire & Rescue Officer',
    shortName: 'Fireman',
    opportunity: 'New 2026 notification categories + ongoing recruitment interest',
    badge: 'New 2026 cats',
    level: 'SSLC',
    durationMinutes: 75,
    catNo: '551/2025 + 2026',
    keywords: ['fire and rescue officer', 'kerala psc fireman mock test', 'fire rescue officer 2026'],
    title: 'Fire & Rescue Officer Mock Test 2026 | Kerala PSC Fireman Practice',
    description:
      'Kerala PSC Fire & Rescue Officer mock tests for 2026 notifications: GK, arithmetic, English, Malayalam and fire-service special topics. 100 MCQs, −0.33 marking.',
    syllabus: [
      { topic: 'History', marks: 5 },
      { topic: 'Geography', marks: 5 },
      { topic: 'Economics', marks: 5 },
      { topic: 'Constitution and Polity', marks: 8 },
      { topic: 'Facts About Kerala', marks: 3 },
      { topic: 'Biology and Public Health', marks: 4 },
      { topic: 'Physics', marks: 3 },
      { topic: 'Chemistry', marks: 3 },
      { topic: 'Arts Culture Literature Sports', marks: 4 },
      { topic: 'Daily Current Affairs', marks: 10 },
      { topic: 'Maths', marks: 10 },
      { topic: 'English', marks: 10 },
      { topic: 'Malayalam', marks: 10 },
      { topic: 'Fire and Rescue Special Topics', marks: 20 },
    ],
  },
  {
    rank: 9,
    slug: 'electrician',
    name: 'Electrician',
    shortName: 'Electrician',
    opportunity: 'New 2026 notification categories',
    badge: 'New 2026',
    level: 'ITI Electrician',
    durationMinutes: 90,
    catNo: '2026 notifications',
    keywords: ['kerala psc electrician', 'electrician mock test kerala psc', 'iti electrician psc'],
    title: 'Electrician Mock Test 2026 | Kerala PSC ITI Electrician Practice',
    description:
      'Kerala PSC Electrician mock tests for 2026 notifications: wiring, machines, electronics, power distribution and GK. Full 100-question OMR style papers.',
    syllabus: [
      { topic: 'Basic Electricity — Fundamentals, Resistance, Conductors, Wires', marks: 10 },
      { topic: 'Ohm\'s Law — Kirchhoff\'s Law, Temperature Effects, Cell Types', marks: 10 },
      { topic: 'Magnetism — Properties, Electromagnetism, Fleming\'s Rules, Faraday\'s Laws', marks: 10 },
      { topic: 'Alternating Current and Earthing — AC, Earthing, Wiring, Megger', marks: 10 },
      { topic: 'DC Machines — Generators, DC Motors, Starters', marks: 10 },
      { topic: 'AC Motors — Single & 3 Phase, DOL, Star-Delta Starters', marks: 10 },
      { topic: 'Instruments and Transformers — Measuring Instruments, EMF Equation', marks: 10 },
      { topic: 'Illumination and Electronics — Lamps, Semiconductors, Diodes, Transistors', marks: 10 },
      { topic: 'Power Generation — Energy Sources, Types of Power Generation', marks: 10 },
      { topic: 'Transmission and Distribution — AC vs DC Comparison', marks: 10 },
    ],
  },
  {
    rank: 10,
    slug: 'beat-forest-officer',
    name: 'Beat Forest Officer',
    shortName: 'BFO',
    opportunity: 'New 2026 notification categories',
    badge: 'New 2026',
    level: 'SSLC / +2',
    durationMinutes: 75,
    catNo: '2026 notifications',
    keywords: ['beat forest officer', 'kerala psc bfo mock test', 'beat forest officer 2026'],
    title: 'Beat Forest Officer Mock Test 2026 | Kerala PSC BFO Online Practice',
    description:
      'Kerala PSC Beat Forest Officer mock tests for 2026 notifications: wildlife, forest laws, GK, arithmetic, English and Malayalam. 100 MCQs like the real paper.',
    syllabus: [
      { topic: 'History', marks: 8 },
      { topic: 'Geography', marks: 10 },
      { topic: 'Facts About Kerala', marks: 10 },
      { topic: 'Constitution and Polity', marks: 8 },
      { topic: 'Daily Current Affairs', marks: 10 },
      { topic: 'Science', marks: 8 },
      { topic: 'Maths', marks: 10 },
      { topic: 'English', marks: 8 },
      { topic: 'Malayalam', marks: 8 },
      { topic: 'Forest and Wildlife Special Topics', marks: 20 },
    ],
  },
  {
    rank: 11,
    slug: 'laboratory-attender',
    name: 'Laboratory Attender',
    shortName: 'Lab Attender',
    opportunity: 'New notification — application window through 7 Oct 2026',
    badge: 'Apply by 7 Oct',
    level: 'SSLC / Lab',
    durationMinutes: 75,
    catNo: '2026',
    applyBy: '2026-10-07',
    keywords: ['laboratory attender kerala psc', 'lab attender notification 2026', 'psc laboratory attender mock test'],
    title: 'Laboratory Attender Mock Test 2026 | Apply by 7 Oct | Kerala PSC',
    description:
      'Kerala PSC Laboratory Attender mock tests while applications are open through 7 October 2026. Science, lab safety, GK, maths and English — 100 MCQs.',
    syllabus: [
      { topic: 'Physics', marks: 15 },
      { topic: 'Chemistry', marks: 15 },
      { topic: 'Biology and Public Health', marks: 15 },
      { topic: 'Lab Safety and Instruments', marks: 15 },
      { topic: 'Facts About Kerala', marks: 10 },
      { topic: 'Maths', marks: 10 },
      { topic: 'English', marks: 10 },
      { topic: 'Daily Current Affairs', marks: 10 },
    ],
  },
  {
    rank: 12,
    slug: 'assistant-project-engineer',
    name: 'Assistant Project Engineer',
    shortName: 'APE',
    opportunity: 'New notification — application window through 7 Oct 2026',
    badge: 'Apply by 7 Oct',
    level: 'Degree (Engg.)',
    durationMinutes: 75,
    catNo: '2026',
    applyBy: '2026-10-07',
    keywords: ['assistant project engineer kerala psc', 'ape notification 2026', 'kerala psc assistant engineer mock test'],
    title: 'Assistant Project Engineer Mock Test 2026 | Apply by 7 Oct | Kerala PSC',
    description:
      'Kerala PSC Assistant Project Engineer mock tests while the 2026 notification is open through 7 October. Engineering aptitude, maths, GK and English.',
    syllabus: [
      { topic: 'Engineering Maths', marks: 20 },
      { topic: 'Physics', marks: 10 },
      { topic: 'Basic Engineering and Drawing', marks: 20 },
      { topic: 'Constitution and Polity', marks: 10 },
      { topic: 'Facts About Kerala', marks: 10 },
      { topic: 'Daily Current Affairs', marks: 10 },
      { topic: 'English', marks: 10 },
      { topic: 'Computer', marks: 10 },
    ],
  },
  {
    rank: 13,
    slug: 'police-constable-band',
    name: 'Police Constable Band / Bugler / Drummer',
    shortName: 'PC Band',
    opportunity: 'New notification — application window through 7 Oct 2026',
    badge: 'Apply by 7 Oct',
    level: 'SSLC + skill',
    durationMinutes: 75,
    catNo: '2026',
    applyBy: '2026-10-07',
    keywords: ['police constable band', 'bugler drummer kerala psc', 'pc band notification 2026'],
    title: 'Police Constable Band / Bugler / Drummer Mock Test 2026 | Apply by 7 Oct',
    description:
      'Kerala PSC Police Constable Band, Bugler and Drummer written mock tests. Applications through 7 October 2026. CPO-style GK paper plus music special topics.',
    syllabus: [
      { topic: 'History', marks: 8 },
      { topic: 'Geography', marks: 7 },
      { topic: 'Constitution and Polity', marks: 10 },
      { topic: 'Facts About Kerala', marks: 8 },
      { topic: 'Daily Current Affairs', marks: 10 },
      { topic: 'Maths', marks: 10 },
      { topic: 'English', marks: 10 },
      { topic: 'Malayalam', marks: 10 },
      { topic: 'Science', marks: 7 },
      { topic: 'Band Music and Police Special Topics', marks: 20 },
    ],
  },
];

export const PRIORITY_SLUGS = PRIORITY_EXAMS.map((exam) => exam.slug);

export function getPriorityExam(slug?: string | null) {
  if (!slug) return null;
  const key = slug.toLowerCase().trim();
  return PRIORITY_EXAMS.find((exam) => exam.slug === key) || null;
}

export function priorityRank(slug?: string | null) {
  const found = getPriorityExam(slug);
  return found ? found.rank : 999;
}

export function sortExamsByPriority<T extends { slug?: string | null; name?: string | null }>(exams: T[]): T[] {
  return [...exams].sort((a, b) => {
    const ra = priorityRank(a.slug) < 999 ? priorityRank(a.slug) : matchPriorityByName(a.name);
    const rb = priorityRank(b.slug) < 999 ? priorityRank(b.slug) : matchPriorityByName(b.name);
    if (ra !== rb) return ra - rb;
    return String(a.name || '').localeCompare(String(b.name || ''));
  });
}

function matchPriorityByName(name?: string | null) {
  const hay = (name || '').toLowerCase();
  const hit = PRIORITY_EXAMS.find((exam) => hay.includes(exam.shortName.toLowerCase()) || hay.includes(exam.name.toLowerCase()));
  return hit ? hit.rank : 999;
}
