// app/(main)/exams/[examId]/page.tsx

import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Container, Box, Typography, Button, Paper, Stack, Grid, Divider, Chip, LinearProgress } from '@mui/material';
import ExamModeSelectionClient from './ExamModeSelectionClient';

interface PageProps {
  params: Promise<{ examId: string }>;
}

// Helpers to fetch public exam details and syllabuses on the server
async function getPublicExam(slug: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    const res = await fetch(`${apiUrl}/api/public/exams/${slug}/`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Error fetching public exam details:", error);
    return null;
  }
}

async function getSyllabusList() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    const res = await fetch(`${apiUrl}/api/syllabuses/`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Error fetching syllabus list:", error);
    return [];
  }
}

// Syllabus weightages helper
const getSyllabusWeightage = (examName: string) => {
  const name = examName.toLowerCase();
  if (name.includes('ldc') || name.includes('clerk')) {
    return [
      { subject: 'General Knowledge & Renaissance', weight: 40 },
      { subject: 'Simple Arithmetic & Mental Ability', weight: 20 },
      { subject: 'General English', weight: 20 },
      { subject: 'Malayalam/Regional Language', weight: 10 },
      { subject: 'General Science & IT', weight: 10 }
    ];
  } else if (name.includes('lgs') || name.includes('servant')) {
    return [
      { subject: 'General Knowledge & Renaissance', weight: 50 },
      { subject: 'General Science', weight: 20 },
      { subject: 'Simple Arithmetic & Mental Ability', weight: 20 },
      { subject: 'Current Affairs', weight: 10 }
    ];
  } else {
    return [
      { subject: 'General Studies & Current Affairs', weight: 40 },
      { subject: 'English Language & Grammar', weight: 20 },
      { subject: 'Regional Language', weight: 20 },
      { subject: 'Arithmetic & Mental Ability', weight: 20 }
    ];
  }
};

// Generate dynamic metadata for slug pages
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { examId } = await params;
  const isNumeric = /^\d+$/.test(examId);

  if (isNumeric) {
    return {
      title: 'Practice Mode Selection | KPSC Master',
      description: 'Choose your study and practice mode parameters for the mock paper.',
    };
  }

  const exam = await getPublicExam(examId);
  if (!exam) {
    return {
      title: 'Exam Mock Test Not Found | KPSC Master',
      description: 'The requested Kerala PSC exam details and syllabus page could not be found.',
    };
  }

  return {
    title: `Kerala PSC ${exam.name} Mock Tests 2026 — Free Online Practice`,
    description: `Access official Kerala PSC ${exam.name} syllabus details, marking schemes, and start a timed mock test simulation with 100 questions. No sign-up required.`,
    alternates: {
      canonical: `/exams/${examId}`,
    }
  };
}

export default async function ExamDetailPage({ params }: PageProps) {
  const { examId } = await params;
  const isNumeric = /^\d+$/.test(examId);

  // If numeric, render the legacy client component for authenticated selection
  if (isNumeric) {
    return <ExamModeSelectionClient examId={examId} />;
  }

  // Otherwise, render the public SEO landing page
  const exam = await getPublicExam(examId);

  if (!exam) {
    return (
      <Container maxWidth="md" sx={{ py: 12, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: 'white' }}>Mock Paper Not Found</Typography>
        <Link href="/exams" style={{ textDecoration: 'none' }}>
          <Button variant="contained">
            Back to Mock Tests
          </Button>
        </Link>
      </Container>
    );
  }

  const syllabuses = await getSyllabusList();
  const syllabus = syllabuses.find((s: any) => s.exam === exam.id);
  const weightages = getSyllabusWeightage(exam.name);

  // FAQ Schema JSON-LD
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': `What is the exam pattern for Kerala PSC ${exam.name}?`,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': `The Kerala PSC ${exam.name} exam is a ${exam.duration_minutes || 75}-minute mock test consisting of 100 multiple choice questions (MCQs). Marks are awarded for correct answers, and standard negative marking rules apply for incorrect selections.`
        }
      },
      {
        '@type': 'Question',
        'name': `Where can I download the official syllabus for Kerala PSC ${exam.name}?`,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': `You can find the subject weightages and full preparation syllabus for ${exam.name} directly on KPSC Master. The topics include GK & Renaissance, Arithmetic, General Science, and Languages.`
        }
      }
    ]
  };

  // Quiz / Mock Exam Product Schema JSON-LD
  const quizSchema = {
    '@context': 'https://schema.org',
    '@type': 'Quiz',
    'name': `Kerala PSC ${exam.name} Mock Test`,
    'description': `Practice the official ${exam.name} ${exam.year} questions in simulated exam conditions.`,
    'about': {
      '@type': 'Thing',
      'name': `Kerala PSC ${exam.name}`
    },
    'educationalAlignment': {
      '@type': 'AlignmentObject',
      'educationalFramework': 'Kerala Public Service Commission (KPSC)',
      'targetName': exam.name
    }
  };

  return (
    <Container maxWidth="lg" sx={{ pt: { xs: 3, md: 6 }, pb: 8 }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(quizSchema) }}
      />

      {/* Breadcrumbs */}
      <Box sx={{ mb: 4, display: 'flex', gap: 1, alignItems: 'center' }}>
        <Link href="/" style={{ color: '#4facfe', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>Home</Link>
        <Typography variant="caption" sx={{ color: 'grey.500' }}>&gt;</Typography>
        <Link href="/exams" style={{ color: '#4facfe', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>Exams</Link>
        <Typography variant="caption" sx={{ color: 'grey.500' }}>&gt;</Typography>
        <Typography variant="caption" sx={{ color: 'grey.400' }}>{exam.name}</Typography>
      </Box>

      {/* Hero Header */}
      <Paper
        sx={{
          p: { xs: 4, md: 6 },
          borderRadius: 6,
          background: 'linear-gradient(135deg, rgba(27, 107, 58, 0.25) 0%, rgba(22, 27, 34, 0.8) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
          mb: 5
        }}
      >
        <Grid container spacing={4} alignItems="center">
          <Grid size={{ xs: 12, md: 8 }}>
            <Stack spacing={2}>
              <Box>
                <Chip
                  label={`YEAR ${exam.year}`}
                  sx={{
                    background: 'rgba(245, 158, 11, 0.12)',
                    color: '#F59E0B',
                    fontWeight: 800,
                    fontSize: '0.75rem',
                  }}
                />
              </Box>
              <Typography
                variant="h1"
                sx={{
                  fontFamily: "'Cabinet Grotesk', sans-serif",
                  fontWeight: 900,
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                  color: 'text.primary',
                  lineHeight: 1.1,
                }}
              >
                Kerala PSC {exam.name} Mock Tests 2026 — Free Online Practice
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 620 }}>
                Experience simulated testing for {exam.name} {exam.year}. Practice under strict exam timers, check real negative marks, and master topic weightages.
              </Typography>

              <Stack direction="row" spacing={3} sx={{ pt: 1 }} useFlexGap flexWrap="wrap">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle2" sx={{ color: '#2E8B57', fontWeight: 800 }}>⏳ {exam.duration_minutes || 75} Mins</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle2" sx={{ color: '#2E8B57', fontWeight: 800 }}>📝 100 MCQs</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle2" sx={{ color: '#8B5CF6', fontWeight: 800 }}>⚡ +100 Study XP</Typography>
                </Box>
              </Stack>
            </Stack>
          </Grid>
          
          <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: { md: 'right' } }}>
            <Link href={`/register`} style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                sx={{
                  py: 2,
                  px: 4,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #1B6B3A, #2E8B57)',
                  fontWeight: 850,
                  fontSize: '1rem',
                  textTransform: 'none',
                  boxShadow: '0 8px 32px rgba(27,107,58,0.25)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1B6B3A, #2E8B57)',
                    filter: 'brightness(1.1)',
                  }
                }}
              >
                Start Free Mock Test — No Signup
              </Button>
            </Link>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Content Layout */}
      <Grid container spacing={4}>
        {/* Left Column: Syllabus & Pattern */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Stack spacing={4}>
            {/* Syllabus section */}
            <Box>
              <Typography variant="h4" component="h2" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 900, color: 'text.primary', mb: 2 }}>
                Kerala PSC {exam.name} Syllabus 2026
              </Typography>
              <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 4 }}>
                {syllabus ? (
                  <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                    {syllabus.details}
                  </Typography>
                ) : (
                  <Typography variant="body1" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                    Detailed chapter notes and subject distributions are currently being updated by the editorial team. Study mode questions remain active.
                  </Typography>
                )}
              </Paper>
            </Box>

            {/* Preparation Strategy */}
            <Box>
              <Typography variant="h4" component="h2" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 900, color: 'text.primary', mb: 2 }}>
                How to Prepare for Kerala PSC {exam.name}
              </Typography>
              <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 4 }}>
                <Typography variant="body2" component="p" sx={{ color: 'text.secondary', lineHeight: 1.7, mb: 2 }}>
                  1. <strong>Master the Basics:</strong> Refer to state school SCERT textbooks for Arithmetic and General Science questions.
                </Typography>
                <Typography variant="body2" component="p" sx={{ color: 'text.secondary', lineHeight: 1.7, mb: 2 }}>
                  2. <strong>Attempt Past Papers:</strong> Solving previous years' papers gives you an exact idea of repeat question patterns.
                </Typography>
                <Typography variant="body2" component="p" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                  3. <strong>Calculate Timings:</strong> Practice mock exams under a strict {exam.duration_minutes || 75}-minute timer to improve your speed-to-accuracy ratio.
                </Typography>
              </Paper>
            </Box>
          </Stack>
        </Grid>

        {/* Right Column: Exam Pattern & FAQ */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={4}>
            {/* Exam Pattern (Weightage) */}
            <Box>
              <Typography variant="h4" component="h2" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 900, color: 'text.primary', mb: 2 }}>
                Kerala PSC {exam.name} Exam Pattern
              </Typography>
              <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 4 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', mb: 3, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem' }}>
                  Subject Weightage Distribution
                </Typography>
                <Stack spacing={2.5}>
                  {weightages.map((sub, idx) => (
                    <Box key={idx}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{sub.subject}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1B6B3A', fontFamily: "'JetBrains Mono'" }}>{sub.weight}%</Typography>
                      </Stack>
                      <LinearProgress 
                        variant="determinate" 
                        value={sub.weight} 
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          bgcolor: 'rgba(255,255,255,0.04)',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 3,
                            background: 'linear-gradient(90deg, #1B6B3A, #2E8B57)'
                          }
                        }} 
                      />
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Box>

            {/* Frequently Asked Questions */}
            <Box>
              <Typography variant="h4" component="h2" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 900, color: 'text.primary', mb: 2 }}>
                Frequently Asked Questions
              </Typography>
              <Stack spacing={2}>
                <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 4 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary', mb: 1 }}>
                    What is the duration of the exam?
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                    The official time limit is {exam.duration_minutes || 75} minutes to answer 100 multiple choice questions.
                  </Typography>
                </Paper>
                <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 4 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary', mb: 1 }}>
                    Is there negative marking?
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                    Yes, standard negative marking rules apply for incorrect selections in the official exam.
                  </Typography>
                </Paper>
              </Stack>
            </Box>
          </Stack>
        </Grid>
      </Grid>

      {/* Footer CTA */}
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Link href="/exams" style={{ textDecoration: 'none' }}>
          <Button
            variant="outlined"
            sx={{ py: 1.5, px: 4, borderRadius: '10px', fontWeight: 700 }}
          >
            View All Mock Exams
          </Button>
        </Link>
      </Box>
    </Container>
  );
}