import { blogPosts } from '@/lib/blogPosts';

export const SITE_URL = 'https://www.kpscmaster.in';
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.kpscmaster.in';

export type SitemapEntry = {
  url: string;
  lastModified: Date;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
};

function loc(path: string, priority: number, changeFrequency: SitemapEntry['changeFrequency'] = 'weekly'): SitemapEntry {
  return {
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  };
}

export async function getSitemapEntries(): Promise<SitemapEntry[]> {
  const core: SitemapEntry[] = [
    loc('', 1.0, 'daily'),
    loc('/exams', 0.95, 'daily'),
    loc('/current-affairs', 0.9, 'daily'),
    loc('/blog', 0.8, 'weekly'),
    loc('/features', 0.7, 'monthly'),
    loc('/testimonials', 0.6, 'monthly'),
    loc('/contact', 0.6, 'monthly'),
    loc('/leaderboard', 0.7, 'daily'),
    loc('/previous-papers', 0.8, 'weekly'),
  ];

  const examHubs: SitemapEntry[] = [
    loc('/exams/special-branch-assistant', 1.0, 'daily'),
    loc('/exams/civil-excise-officer', 1.0, 'daily'),
    loc('/exams/lineman', 1.0, 'daily'),
    loc('/exams/nurse-grade-ii', 1.0, 'daily'),
    loc('/exams/fire-and-rescue', 1.0, 'daily'),
    loc('/exams/electrician', 0.98, 'daily'),
    loc('/exams/beat-forest-officer', 0.98, 'daily'),
    loc('/exams/laboratory-attender', 0.98, 'daily'),
    loc('/exams/assistant-project-engineer', 0.98, 'daily'),
    loc('/exams/police-constable-band', 0.98, 'daily'),
    loc('/exams/village-field-assistant', 0.9, 'daily'),
    loc('/exams/kseb-electricity-worker', 0.85, 'weekly'),
    loc('/exams/company-board-lgs', 0.85, 'weekly'),
    loc('/exams/ldc-lgs-august-2026', 0.8, 'weekly'),
    loc('/exams/ksrtc-conductor', 0.75, 'weekly'),
  ];

  const onlineTests = [
    '/kerala-psc-ldc-online-test',
    '/kerala-psc-lgs-online-test',
    '/lgs-mock-test-2026',
    '/company-board-lgs-mock-test',
    '/lgs-mock-test-free',
    '/vfa-mock-test',
    '/village-field-assistant-mock-test-malayalam',
    '/psc-coaching-centre-neyyattinkara',
    '/psc-coaching-centre-nedumangad',
    '/psc-coaching-centre-pathanamthitta',
    '/kerala-psc-degree-level-online-test',
    '/kerala-psc-special-branch-assistant-online-test',
    '/kerala-psc-civil-excise-officer-online-test',
    '/kerala-psc-lineman-online-test',
    '/kerala-psc-nurse-grade-ii-online-test',
    '/kerala-psc-fire-and-rescue-online-test',
    '/kerala-psc-electrician-online-test',
    '/kerala-psc-beat-forest-officer-online-test',
    '/kerala-psc-laboratory-attender-online-test',
    '/kerala-psc-assistant-project-engineer-online-test',
    '/kerala-psc-police-constable-band-online-test',
    '/special-branch-assistant-mock-test',
    '/civil-excise-officer-mock-test',
    '/lineman-mock-test',
    '/nurse-grade-ii-mock-test',
    '/laboratory-attender-mock-test',
    '/kerala-psc-panchayat-secretary-online-test',
    '/kerala-psc-daily-quiz',
    '/kerala-psc-assistant-junior-assistant-online-test',
    '/kerala-psc-general-psc-online-test',
  ].map((path) => loc(path, 0.75, 'weekly'));

  const locations = [
    'attingal', 'thiruvananthapuram', 'varkala', 'kilimanoor', 'chirayinkeezhu',
    'kazhakkoottam', 'nedumangad', 'neyyattinkara', 'kollam', 'pathanamthitta',
    'ernakulam', 'thrissur', 'kozhikode', 'malappuram', 'palakkad', 'kerala',
  ];
  const examsList = [
    'special-branch-assistant', 'civil-excise-officer', 'lineman', 'nurse-grade-ii',
    'fire-and-rescue', 'electrician', 'beat-forest-officer', 'laboratory-attender',
    'assistant-project-engineer', 'police-constable-band',
    'ldc', 'lgs', 'degree-level', 'veo', 'ld-typist', 'secretariat-assistant',
    'police-constable', 'lp-teacher', 'up-teacher', 'clerk',
    'company-board', 'water-authority', 'university-assistant', 'assistant-prison-officer',
    'excise-officer', 'assistant-junior-assistant', 'village-field-assistant',
    'panchayat-secretary', 'general-psc', 'kseb-electricity-worker', 'ksrtc-conductor',
  ];

  const locationPages: SitemapEntry[] = [];
  examsList.forEach((exam) => {
    locations.forEach((place) => {
      locationPages.push(loc(`/kerala-psc-${exam}-${place}`, 0.6, 'weekly'));
    });
  });
  locations.forEach((place) => {
    locationPages.push(loc(`/kerala-psc-mock-test-${place}`, 0.65, 'weekly'));
    locationPages.push(loc(`/psc-coaching-${place}`, 0.6, 'weekly'));
    locationPages.push(loc(`/psc-online-coaching-${place}`, 0.6, 'weekly'));
  });

  const blogs = blogPosts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const dynamicPages: SitemapEntry[] = [];
  try {
    const examRes = await fetch(`${apiUrl}/api/exams/`, { next: { revalidate: 3600 } });
    if (examRes.ok) {
      const categories = await examRes.json();
      if (Array.isArray(categories)) {
        categories.forEach((cat: { exams?: { slug?: string }[] }) => {
          (cat.exams || []).forEach((exam) => {
            if (exam.slug) dynamicPages.push(loc(`/exams/${exam.slug}`, 0.7, 'weekly'));
          });
        });
      }
    }
  } catch {
    // Keep the static hubs even if the API is briefly down.
  }

  const seen = new Set<string>();
  const priorityHubs = examHubs.slice(0, 10);
  const otherHubs = examHubs.slice(10);
  return [...core.slice(0, 2), ...priorityHubs, ...core.slice(2), ...otherHubs, ...onlineTests, ...blogs, ...locationPages, ...dynamicPages].filter((entry) => {
    if (seen.has(entry.url)) return false;
    seen.add(entry.url);
    return true;
  });
}

export function toSitemapXml(entries: SitemapEntry[]) {
  const body = entries
    .map((entry) => {
      const lastmod = entry.lastModified.toISOString();
      return `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority.toFixed(1)}</priority>
  </url>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}
