import { MetadataRoute } from 'next';
import { blogPosts } from '@/lib/blogPosts';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.kpscmaster.in';
  
  // 1. Static Pages
  const staticPaths = [
    '',
    '/exams',
    '/current-affairs',
    '/blog',
    '/features',
    '/testimonials',
    '/contact',
  ];
  
  const sitemapEntries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1.0 : 0.8,
  }));

  // 1.5 Programmatic SEO Pages
  const locations = [
    'attingal', 'thiruvananthapuram', 'varkala', 'kilimanoor', 'chirayinkeezhu',
    'kazhakkoottam', 'nedumangad', 'neyyattinkara', 'kollam', 'pathanamthitta', 'kerala'
  ];
  const examsList = [
    'ldc', 'lgs', 'degree-level', 'veo', 'ld-typist', 'secretariat-assistant',
    'police-constable', 'fire-and-rescue', 'lp-teacher', 'up-teacher', 'clerk',
    'company-board', 'water-authority', 'university-assistant', 'assistant-prison-officer',
    'excise-officer', 'civil-excise-officer'
  ];

  // 1.5.1 Exam + Location (187 pages)
  examsList.forEach((exam) => {
    locations.forEach((loc) => {
      sitemapEntries.push({
        url: `${baseUrl}/kerala-psc-${exam}-${loc}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    });
  });

  // 1.5.2 Mock Test + Location (11 pages)
  locations.forEach((loc) => {
    sitemapEntries.push({
      url: `${baseUrl}/kerala-psc-mock-test-${loc}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    });
  });

  // 1.5.3 Coaching + Location (11 pages)
  locations.forEach((loc) => {
    sitemapEntries.push({
      url: `${baseUrl}/psc-coaching-${loc}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    });
  });

  // 1.5.4 Online Coaching + Location (11 pages)
  locations.forEach((loc) => {
    sitemapEntries.push({
      url: `${baseUrl}/psc-online-coaching-${loc}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    });
  });

  // 1.5.5 High-Intent Generic (4 pages)
  const genericPaths = [
    '/kerala-psc-ldc-online-test',
    '/kerala-psc-lgs-online-test',
    '/kerala-psc-degree-level-online-test',
    '/kerala-psc-daily-quiz'
  ];
  genericPaths.forEach((path) => {
    sitemapEntries.push({
      url: `${baseUrl}${path}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  });

  // 2. Blog Posts (Statically defined in code)
  blogPosts.forEach((post) => {
    sitemapEntries.push({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: 'monthly',
      priority: 0.6,
    });
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

  // 3. Fetch Dynamic Current Affairs Slugs
  try {
    const res = await fetch(`${apiUrl}/api/public/current-affairs/`, {
      next: { revalidate: 3600 }
    });
    if (res.ok) {
      const data = await res.json();
      const items = Array.isArray(data) ? data : data.results || [];
      items.forEach((item: any) => {
        if (item.slug) {
          sitemapEntries.push({
            url: `${baseUrl}/current-affairs/${item.slug}`,
            lastModified: item.updated_at ? new Date(item.updated_at) : new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
          });
        }
      });
    }
  } catch (error) {
    console.error('Sitemap: Failed to fetch current affairs:', error);
  }

  // 4. Fetch Dynamic Exams Slugs
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
                sitemapEntries.push({
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
    console.error('Sitemap: Failed to fetch exams:', error);
  }

  // 5. Fetch Dynamic Questions Slugs
  try {
    const res = await fetch(`${apiUrl}/api/questions/?limit=200`, {
      next: { revalidate: 3600 }
    });
    if (res.ok) {
      const data = await res.json();
      const questions = Array.isArray(data) ? data : data.results || [];
      questions.forEach((q: any) => {
        if (q.slug) {
          sitemapEntries.push({
            url: `${baseUrl}/psc-question/${q.slug}`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
          });
        }
      });
    }
  } catch (error) {
    console.error('Sitemap: Failed to fetch questions:', error);
  }

  return sitemapEntries;
}
