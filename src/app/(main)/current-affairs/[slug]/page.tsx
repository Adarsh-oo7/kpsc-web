import { Metadata } from 'next';
import Link from 'next/link';
import { Box, Typography, Card, CardContent, Button, Stack, Chip, Divider } from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

async function getCurrentAffair(slug: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  const res = await fetch(`${apiUrl}/api/public/current-affairs/${slug}/`, {
    next: { revalidate: 3600 }
  });
  if (!res.ok) return null;
  return res.json();
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
      <Box sx={{ p: 4, textAlign: 'center', color: 'white' }}>
        <Typography variant="h5" gutterBottom>Current Affairs Article Not Found</Typography>
        <Typography variant="body1" sx={{ mb: 3, color: 'grey.400' }}>
          The article you are looking for does not exist or has been removed.
        </Typography>
        <Button component={Link} href="/" variant="contained" startIcon={<ArrowBackIcon />}>
          Back to Home
        </Button>
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
      <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', color: 'white', borderRadius: 4, border: '1px solid rgba(255,255,255,0.1)' }}>
        <CardContent sx={{ p: 4 }}>
          {/* Tags / Metadata */}
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }} useFlexGap flexWrap="wrap">
            <Chip label={item.category} color="primary" size="small" />
            
            {item.psc_likelihood === 'high' && (
              <Chip 
                icon={<LocalFireDepartmentIcon style={{ color: '#ff9800' }} />}
                label="High PSC Likelihood" 
                variant="outlined" 
                size="small"
                sx={{ borderColor: 'warning.main', color: 'warning.main', bgcolor: 'rgba(255, 152, 0, 0.05)' }} 
              />
            )}

            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: 'grey.400', fontSize: '0.875rem' }}>
              <EventIcon sx={{ fontSize: 16 }} />
              <Typography variant="body2">{new Date(item.publication_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</Typography>
            </Stack>
          </Stack>

          {/* Title */}
          <Typography variant="h4" sx={{ fontWeight: '700', lineHeight: 1.4, mb: 3 }}>
            {item.title}
          </Typography>

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 3 }} />

          {/* AI Summary Highlight Box */}
          {item.ai_summary && (
            <Box sx={{ p: 3, mb: 4, borderRadius: 3, bgcolor: 'rgba(255, 152, 0, 0.05)', border: '1px solid rgba(255, 152, 0, 0.15)' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'warning.main', mb: 1 }}>
                Quick AI Summary (Malayalam / English study highlight)
              </Typography>
              <Typography variant="body1" sx={{ color: 'grey.300', lineHeight: 1.6, fontStyle: 'italic' }}>
                {item.ai_summary}
              </Typography>
            </Box>
          )}

          {/* Content Body */}
          <Typography variant="body1" sx={{ color: 'grey.100', lineHeight: 1.8, fontSize: '1.05rem', whiteSpace: 'pre-line' }}>
            {item.content}
          </Typography>
        </CardContent>
      </Card>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button component={Link} href="/" variant="outlined" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}>
          Back to Home
        </Button>
        <Button component={Link} href="/register" variant="contained">
          Subscribe for Daily AI Summaries
        </Button>
      </Box>
    </Box>
  );
}
