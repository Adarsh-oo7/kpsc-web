import { Metadata } from 'next';
import Link from 'next/link';
import { Box, Typography, Card, CardContent, Button, Stack, Chip, Divider } from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

async function getCurrentAffair(slug: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    const res = await fetch(`${apiUrl}/api/public/current-affairs/${slug}/`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Error fetching current affair:", error);
    return null;
  }
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getCurrentAffair(slug);
  
  if (!item) {
    return {
      title: 'Current Affairs Not Found | KPSC Master',
      description: 'The requested current affairs detail page could not be found.',
    };
  }

  return {
    title: `${item.title} | Kerala PSC Current Affairs`,
    description: item.ai_summary || `Read details and PSC likelihood analysis for: ${item.title}`,
    alternates: {
      canonical: `/current-affairs/${slug}`,
    }
  };
}

export default async function CurrentAffairSEOPage({ params }: PageProps) {
  const { slug } = await params;
  const item = await getCurrentAffair(slug);

  if (!item) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', color: 'text.primary' }}>
        <Typography variant="h5" gutterBottom>Current Affairs Article Not Found</Typography>
        <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
          The article you are looking for does not exist or has been removed.
        </Typography>
        <Link href="/current-affairs" style={{ textDecoration: 'none' }}>
          <Button variant="contained" startIcon={<ArrowBackIcon />}>
            Back to Current Affairs
          </Button>
        </Link>
      </Box>
    );
  }

  // JSON-LD NewsArticle Schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    'headline': item.title,
    'datePublished': item.publication_date,
    'dateModified': item.publication_date,
    'description': item.ai_summary || item.title,
    'articleBody': item.content,
    'author': {
      '@type': 'Organization',
      'name': 'KPSC Master Editorial Team'
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3, mt: 4 }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumbs */}
      <Box sx={{ mb: 3, display: 'flex', gap: 1, alignItems: 'center' }}>
        <Link href="/" style={{ color: '#42a5f5', textDecoration: 'none', fontSize: '0.875rem' }}>Home</Link>
        <Typography variant="caption" sx={{ color: 'grey.500' }}>&gt;</Typography>
        <Link href="/current-affairs" style={{ color: '#42a5f5', textDecoration: 'none', fontSize: '0.875rem' }}>Current Affairs</Link>
        <Typography variant="caption" sx={{ color: 'grey.500' }}>&gt;</Typography>
        <Typography variant="caption" sx={{ color: 'grey.400' }}>Article</Typography>
      </Box>

      {/* Article Container */}
      <Card sx={{ bgcolor: 'background.paper', color: 'text.primary', borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 4 }}>
          {/* Tags / Metadata */}
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }} useFlexGap flexWrap="wrap">
            <Chip label={item.category} color="primary" size="small" />
            
            {item.psc_likelihood === 'high' && (
              <Chip 
                icon={<LocalFireDepartmentIcon style={{ color: '#ff9800' }} />}
                label="Likely in PSC" 
                variant="outlined" 
                size="small"
                sx={{ borderColor: 'warning.main', color: 'warning.main', bgcolor: 'rgba(255, 152, 0, 0.05)' }} 
              />
            )}

            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
              <EventIcon sx={{ fontSize: 16 }} />
              <Typography variant="body2">{new Date(item.publication_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</Typography>
            </Stack>
          </Stack>

          {/* Title */}
          <Typography variant="h4" sx={{ fontWeight: '700', lineHeight: 1.4, mb: 3 }}>
            {item.title}
          </Typography>

          <Divider sx={{ mb: 3 }} />

          {/* AI Summary Highlight Box */}
          {item.ai_summary && (
            <Box sx={{ p: 3, mb: 4, borderRadius: 3, bgcolor: 'rgba(255, 152, 0, 0.05)', border: '1px solid rgba(255, 152, 0, 0.15)' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'warning.main', mb: 1 }}>
                PSC takeaway
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.primary', lineHeight: 1.6, fontStyle: 'italic' }}>
                {item.ai_summary}
              </Typography>
            </Box>
          )}

          {/* Content Body */}
          <Typography variant="body1" sx={{ color: 'text.primary', lineHeight: 1.8, fontSize: '1.05rem', whiteSpace: 'pre-line' }}>
            {item.content}
          </Typography>

          {item.mcq?.question && (
            <Box sx={{ mt: 4, p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, color: 'primary.main' }}>
                Practice this question
              </Typography>
              <Typography sx={{ fontWeight: 700, mb: 1.5 }}>{item.mcq.question}</Typography>
              <Stack spacing={0.75}>
                {(Array.isArray(item.mcq.options) ? item.mcq.options : Object.values(item.mcq.options || {})).map((option: string, index: number) => (
                  <Typography key={index} sx={{ color: 'text.secondary' }}>
                    {['A', 'B', 'C', 'D'][index] || index + 1}) {option}
                  </Typography>
                ))}
              </Stack>
              {item.mcq.explanation && (
                <Typography sx={{ mt: 2, color: 'text.secondary', fontSize: '0.95rem' }}>
                  {item.mcq.explanation}
                </Typography>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/current-affairs" style={{ textDecoration: 'none' }}>
          <Button variant="outlined">
            Back to Current Affairs
          </Button>
        </Link>
        <Link href="/quiz?current_affairs=weekly" style={{ textDecoration: 'none' }}>
          <Button variant="contained">
            This week's quiz
          </Button>
        </Link>
      </Box>
    </Box>
  );
}
