import { Metadata } from 'next';
import Link from 'next/link';
import { Box, Typography, Card, CardContent, Button, Stack, Chip, Divider } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Helper to fetch data on the server
async function getQuestion(slug: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    const res = await fetch(`${apiUrl}/api/public/questions/${slug}/`, {
      next: { revalidate: 3600 } // Cache and revalidate every hour
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Error fetching question:", error);
    return null;
  }
}


interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate dynamic SEO metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const question = await getQuestion(slug);
  
  if (!question) {
    return {
      title: 'Question Not Found | KPSC Master',
      description: 'The requested Kerala PSC exam question could not be found.',
    };
  }

  const cleanText = question.text.substring(0, 150) + '...';
  return {
    title: `Question: ${cleanText} | KPSC Master`,
    description: `Practice this Kerala PSC exam question: "${cleanText}" and learn the correct answer with detailed explanations.`,
    alternates: {
      canonical: `/psc-question/${slug}`,
    }
  };
}

export default async function QuestionSEOPage({ params }: PageProps) {
  const { slug } = await params;
  const question = await getQuestion(slug);

  if (!question) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', color: 'white' }}>
        <Typography variant="h5" gutterBottom>Question Not Found</Typography>
        <Typography variant="body1" sx={{ mb: 3, color: 'grey.400' }}>
          The question you are looking for does not exist or has been removed.
        </Typography>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Button variant="contained" startIcon={<ArrowBackIcon />}>
            Back to Home
          </Button>
        </Link>
      </Box>
    );
  }

  // Create JSON-LD Q&A Schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'QAPage',
    'mainEntity': {
      '@type': 'Question',
      'name': question.text,
      'text': question.text,
      'answerCount': 1,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': `Correct Answer: Option ${question.correct_answer}. Explanation: ${question.explanation || 'No explanation available.'}`,
        'upvoteCount': 10,
        'url': `${process.env.NEXT_PUBLIC_SITE_URL || 'https://kpscmaster.com'}/psc-question/${slug}`
      }
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3, mt: 4 }}>
      {/* Structured SEO Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumbs */}
      <Box sx={{ mb: 3, display: 'flex', gap: 1, alignItems: 'center' }}>
        <Link href="/" style={{ color: '#42a5f5', textDecoration: 'none', fontSize: '0.875rem' }}>Home</Link>
        <Typography variant="caption" sx={{ color: 'grey.500' }}>&gt;</Typography>
        <Link href="/topics" style={{ color: '#42a5f5', textDecoration: 'none', fontSize: '0.875rem' }}>Topics</Link>
        <Typography variant="caption" sx={{ color: 'grey.500' }}>&gt;</Typography>
        <Typography variant="caption" sx={{ color: 'grey.400' }}>Question Detail</Typography>
      </Box>

      {/* Main Question Card */}
      <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', color: 'white', borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 4 }}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
            <HelpOutlineIcon color="primary" />
            <Chip label={question.difficulty.toUpperCase()} color={question.difficulty === 'easy' ? 'success' : question.difficulty === 'medium' ? 'warning' : 'error'} size="small" />
            {question.sub_topic && <Chip label={question.sub_topic} variant="outlined" size="small" sx={{ borderColor: 'rgba(255,255,255,0.2)', color: 'grey.300' }} />}
          </Stack>

          <Typography variant="h5" sx={{ fontWeight: '600', lineHeight: 1.5, mb: 3 }}>
            {question.text}
          </Typography>

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 3 }} />

          {/* Options Display */}
          <Stack spacing={2} sx={{ mb: 4 }}>
            {Object.entries(question.options || {}).map(([key, val]) => {
              const isCorrect = key.toUpperCase() === question.correct_answer.toUpperCase();
              return (
                <Box
                  key={key}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: isCorrect ? 'success.main' : 'rgba(255,255,255,0.1)',
                    bgcolor: isCorrect ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255,255,255,0.02)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: isCorrect ? 'success.main' : 'primary.light' }}>
                    Option {key.toUpperCase()}:
                  </Typography>
                  <Typography variant="body1">{String(val)}</Typography>
                </Box>
              );
            })}
          </Stack>

          {/* Explanation block */}
          <Box sx={{ p: 3, borderRadius: 3, bgcolor: 'rgba(25, 118, 210, 0.1)', border: '1px solid rgba(25, 118, 210, 0.2)' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'primary.light', mb: 1 }}>
              Correct Answer: {question.correct_answer.toUpperCase()}
            </Typography>
            <Typography variant="body1" sx={{ color: 'grey.300', lineHeight: 1.6 }}>
              {question.explanation || 'No explanation available. Sign in to request AI tutor explanations.'}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Link href="/login" style={{ textDecoration: 'none' }}>
          <Button variant="contained" color="primary" size="large">
            Join KPSC Master to practice more questions
          </Button>
        </Link>
      </Box>
    </Box>
  );
}
