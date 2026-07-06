import { MetadataRoute } from 'next';
import { blogPosts } from '@/lib/blogPosts';

const baseUrl = 'https://www.kpscmaster.in';
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.kpscmaster.in';

// Next.js splits sitemaps by ID when generateSitemaps() is defined.
// Each ID maps to a separate /sitemap/{id}.xml file served via the sitemap index.
export function generateSitemaps() {
  return [
    { id: 0 }, // static + exam hub pages (highest priority)
    { id: 1 }, // programmatic SEO location pages
    { id: 2 }, // blog posts
    { id: 3 }, // dynamic current-affairs
    { id: 4 }, // dynamic exam slugs
    { id: 5 }, // dynamic question slugs
  ];
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  switch (id) {
    // ─── 0: Core + Exam Hub Pages (High Priority) ──────────────────
    case 0: {
      const corePages = [
        { path: '', priority: 1.0, freq: 'daily' as const },
        { path: '/exams', priority: 0.9, freq: 'weekly' as const },
        { path: '/current-affairs', priority: 0.9, freq: 'daily' as const },
        { path: '/blog', priority: 0.8, freq: 'weekly' as const },
        { path: '/features', priority: 0.7, freq: 'monthly' as const },
        { path: '/testimonials', priority: 0.6, freq: 'monthly' as const },
        { path: '/contact', priority: 0.6, freq: 'monthly' as const },
        { path: '/leaderboard', priority: 0.7, freq: 'daily' as const },
        { path: '/previous-papers', priority: 0.8, freq: 'weekly' as const },
      ];

      // High-priority dedicated exam hub pages (keyword research Tier 1 & 2)
      const examHubPages = [
        { path: '/exams/kseb-electricity-worker', priority: 1.0, freq: 'daily' as const },   // ⭐⭐⭐⭐⭐ 18K-25K vol
        { path: '/exams/company-board-lgs', priority: 1.0, freq: 'daily' as const },          // ⭐⭐⭐⭐ peak NOW
        { path: '/exams/village-field-assistant', priority: 0.95, freq: 'daily' as const },   // ⭐⭐⭐⭐ Sept 19
        { path: '/exams/fire-and-rescue', priority: 0.95, freq: 'daily' as const },           // ⭐⭐⭐⭐⭐ post-exam spike
        { path: '/exams/ksrtc-conductor', priority: 0.9, freq: 'weekly' as const },           // ⭐⭐⭐⭐⭐ zero competition
        { path: '/exams/ldc-lgs-august-2026', priority: 0.9, freq: 'daily' as const },       // ⭐⭐⭐⭐ Aug 1
      ];

      // High-intent generic online test pages
      const onlineTestPages = [
        '/kerala-psc-ldc-online-test',
        '/kerala-psc-lgs-online-test',
        '/kerala-psc-degree-level-online-test',
        '/kerala-psc-village-field-assistant-online-test',
        '/kerala-psc-panchayat-secretary-online-test',
        '/kerala-psc-daily-quiz',
        '/kerala-psc-assistant-junior-assistant-online-test',
        '/kerala-psc-general-psc-online-test',
      ];

      return [
        ...corePages.map(({ path, priority, freq }) => ({
          url: `${baseUrl}${path}`,
          lastModified: new Date(),
          changeFrequency: freq,
          priority,
        })),
        ...examHubPages.map(({ path, priority, freq }) => ({
          url: `${baseUrl}${path}`,
          lastModified: new Date(),
          changeFrequency: freq,
          priority,
        })),
        ...onlineTestPages.map((path) => ({
          url: `${baseUrl}${path}`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.75,
        })),
      ];
    }

    // ─── 1: Programmatic SEO Location Pages ────────────────────────
    case 1: {
      const locations = [
        'attingal', 'thiruvananthapuram', 'varkala', 'kilimanoor', 'chirayinkeezhu',
        'kazhakkoottam', 'nedumangad', 'neyyattinkara', 'kollam', 'pathanamthitta',
        'ernakulam', 'thrissur', 'kozhikode', 'malappuram', 'palakkad', 'kerala'
      ];
      const examsList = [
        'ldc', 'lgs', 'degree-level', 'veo', 'ld-typist', 'secretariat-assistant',
        'police-constable', 'fire-and-rescue', 'lp-teacher', 'up-teacher', 'clerk',
        'company-board', 'water-authority', 'university-assistant', 'assistant-prison-officer',
        'excise-officer', 'civil-excise-officer', 'assistant-junior-assistant', 'village-field-assistant',
        'panchayat-secretary', 'general-psc', 'kseb-electricity-worker', 'ksrtc-conductor'
      ];

      const entries: MetadataRoute.Sitemap = [];

      examsList.forEach((exam) => {
        locations.forEach((loc) => {
          entries.push({
            url: `${baseUrl}/kerala-psc-${exam}-${loc}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.6,
          });
        });
      });

      // Mock Test + Location
      locations.forEach((loc) => {
        entries.push({
          url: `${baseUrl}/kerala-psc-mock-test-${loc}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.65,
        });
      });

      // Coaching + Location
      locations.forEach((loc) => {
        entries.push(
          {
            url: `${baseUrl}/psc-coaching-${loc}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.6,
          },
          {
            url: `${baseUrl}/psc-online-coaching-${loc}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.6,
          }
        );
      });

      return entries;
    }

    // ─── 2: Blog Posts ─────────────────────────────────────────────
    case 2: {
      return blogPosts.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.date),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }));
    }

    // ─── 3: Dynamic Current Affairs ────────────────────────────────
    case 3: {
      const entries: MetadataRoute.Sitemap = [];
      try {
        const res = await fetch(`${apiUrl}/api/public/current-affairs/`, {
          next: { revalidate: 3600 }
        });
        if (res.ok) {
          const data = await res.json();
          const items = Array.isArray(data) ? data : (data.results || []);
          items.forEach((item: any) => {
            if (item.slug) {
              entries.push({
                url: `${baseUrl}/current-affairs/${item.slug}`,
                lastModified: item.updated_at ? new Date(item.updated_at) : new Date(),
                changeFrequency: 'weekly',
                priority: 0.7,
              });
            }
          });
        }
      } catch (error) {
        console.error('Sitemap[3]: Failed to fetch current affairs:', error);
      }
      return entries;
    }

    // ─── 4: Dynamic Exam Slugs ─────────────────────────────────────
    case 4: {
      const entries: MetadataRoute.Sitemap = [];
      try {
        const res = await fetch(`${apiUrl}/api/exams/`, {
          next: { revalidate: 3600 }
        });
        if (res.ok) {
          const categories = await res.json();
          if (Array.isArray(categories)) {
            categories.forEach((cat: any) => {
              if (cat.exams && Array.isArray(cat.exams)) {
                cat.exams.forEach((exam: any) => {
                  if (exam.slug) {
                    entries.push({
                      url: `${baseUrl}/exams/${exam.slug}`,
                      lastModified: new Date(),
                      changeFrequency: 'monthly',
                      priority: 0.7,
                    });
                  }
                });
              }
            });
          }
        }
      } catch (error) {
        console.error('Sitemap[4]: Failed to fetch exams:', error);
      }
      return entries;
    }

    // ─── 5: Dynamic Question Slugs ─────────────────────────────────
    case 5: {
      const entries: MetadataRoute.Sitemap = [];
      try {
        const res = await fetch(`${apiUrl}/api/questions/?limit=500`, {
          next: { revalidate: 3600 }
        });
        if (res.ok) {
          const data = await res.json();
          const questions = Array.isArray(data) ? data : (data.results || []);
          questions.forEach((q: any) => {
            if (q.slug) {
              entries.push({
                url: `${baseUrl}/psc-question/${q.slug}`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.5,
              });
            }
          });
        }
      } catch (error) {
        console.error('Sitemap[5]: Failed to fetch questions:', error);
      }
      return entries;
    }

    default:
      return [];
  }
}

