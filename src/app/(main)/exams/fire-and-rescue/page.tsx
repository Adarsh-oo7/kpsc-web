// app/(main)/exams/fire-and-rescue/page.tsx

import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Container, Box, Typography, Button, Paper, Stack, Grid, Chip } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ForumIcon from '@mui/icons-material/Forum';
import AssessmentIcon from '@mui/icons-material/Assessment';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

export const metadata: Metadata = {
  title: "Fire & Rescue Officer Answer Key July 4 2026 | Expected Cutoff | Kerala PSC Previous Questions | KPSC Master",
  description: "Kerala PSC Fire & Rescue Officer answer key July 4, 2026 — expected cutoff prediction, previous year question papers, and post-exam analysis. Fire rescue officer expected cutoff 2026 discussed here.",
  keywords: [
    'fire rescue officer answer key 2026',
    'fire rescue officer answer key July 2026',
    'fire and rescue officer previous questions 2026',
    'fire rescue officer expected cutoff 2026',
    'kerala psc fire and rescue officer mock test',
    'fire rescue officer exam analysis July 4 2026',
  ],
  alternates: {
    canonical: 'https://www.kpscmaster.in/exams/fire-and-rescue',
  },
  openGraph: {
    title: 'Fire & Rescue Officer Answer Key July 4 2026 | Expected Cutoff | KPSC Master',
    description: "Kerala PSC Fire & Rescue Officer answer key July 4, 2026 — expected cutoff, previous year questions, exam analysis. No signup needed.",
    url: 'https://www.kpscmaster.in/exams/fire-and-rescue',
    images: [{ url: '/KPSC MASTER.png', width: 1200, height: 630, alt: 'Fire Rescue Officer Answer Key July 2026' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fire & Rescue Officer Answer Key July 2026 | Expected Cutoff | KPSC Master',
    description: "Fire rescue officer answer key July 4, 2026 — expected cutoff and previous questions analysis.",
    images: ['/KPSC MASTER.png'],
  },
};

export default function FireAndRescuePage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': "What was the Fire & Rescue Officer exam date 2026?",
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': "The Kerala PSC Fire & Rescue Officer exam was held on July 4, 2026 (Saturday). The exam covered General Knowledge, Current Affairs, and Fire & Rescue-specific technical questions."
        }
      },
      {
        '@type': 'Question',
        'name': "What is the Fire Rescue Officer answer key July 2026?",
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': "The official Kerala PSC Fire & Rescue Officer answer key for July 4, 2026 will be published on the official Kerala PSC website (keralapsc.gov.in). KPSC Master provides a community discussion board and question-by-question analysis on this page."
        }
      },
      {
        '@type': 'Question',
        'name': "What is the expected cutoff for Fire Rescue Officer 2026?",
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': "Based on student feedback and exam difficulty analysis, the expected cutoff marks for the Kerala PSC Fire & Rescue Officer 2026 exam (general category) are estimated between 58 and 65 marks out of 100. Final cutoffs will be published by Kerala PSC after rank list preparation."
        }
      },
      {
        '@type': 'Question',
        'name': "Where can I find Fire & Rescue Officer previous year question papers?",
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': "KPSC Master provides Fire & Rescue Officer previous year questions in interactive mock test format. You can practice all past papers with answers and AI explanations directly in your browser — no download or signup required."
        }
      }
    ]
  };

  return (
    <Container maxWidth="lg" sx={{ pt: { xs: 3, md: 6 }, pb: 8 }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Breadcrumbs */}
      <Box sx={{ mb: 4, display: 'flex', gap: 1, alignItems: 'center' }}>
        <Link href="/" style={{ color: '#3B82F6', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>Home</Link>
        <Typography variant="caption" sx={{ color: 'grey.500' }}>&gt;</Typography>
        <Link href="/exams" style={{ color: '#3B82F6', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>Exams</Link>
        <Typography variant="caption" sx={{ color: 'grey.500' }}>&gt;</Typography>
        <Typography variant="caption" sx={{ color: 'grey.400' }}>Fire & Rescue</Typography>
      </Box>

      {/* Hero Header */}
      <Paper
        sx={{
          p: { xs: 4, md: 5 },
          borderRadius: 6,
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(15, 23, 42, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid', borderColor: 'divider',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          mb: 5
        }}
      >
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={8}>
            <Stack spacing={2}>
              <Box>
                <Chip
                  label="July 4, 2026 (Recent)"
                  sx={{
                    background: 'rgba(239, 68, 68, 0.12)',
                    color: '#EF4444',
                    fontWeight: 800,
                    fontSize: '0.75rem',
                  }}
                />
              </Box>
              <Typography
                variant="h1"
                sx={{
                  fontFamily: "'Outfit', 'Cabinet Grotesk', sans-serif",
                  fontWeight: 900,
                  fontSize: { xs: '2.2rem', sm: '2.8rem', md: '3.2rem' },
                  color: 'text.primary',
                  lineHeight: 1.1,
                }}
              >
                Fire & Rescue Officer Exam Hub — Expected Cut Off
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 620, fontSize: '1.05rem', lineHeight: 1.6 }}>
                Check the latest post-exam analysis, projected category cut-offs, answer keys, and participate in peer discussions for the recent July 4 exam.
              </Typography>
            </Stack>
          </Grid>
          
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <Link href="/quiz?exam_id=fire-and-rescue" style={{ textDecoration: 'none', width: '100%' }}>
              <Button
                variant="contained"
                fullWidth
                sx={{
                  py: 2.2,
                  px: 4,
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                  fontWeight: 900,
                  fontSize: '1.05rem',
                  textTransform: 'none',
                  boxShadow: '0 8px 32px rgba(239,68,68,0.3)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 40px rgba(239,68,68,0.4)',
                  }
                }}
              >
                Practice Fire & Rescue Mock Tests
              </Button>
            </Link>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Content Layout */}
      <Grid container spacing={4}>
        {/* Left Column: Post-Exam Cutoff */}
        <Grid item xs={12} md={7}>
          <Stack spacing={4}>
            {/* Expected Cut Off */}
            <Box>
              <Typography variant="h4" component="h2" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: 'text.primary', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssessmentIcon sx={{ color: '#EF4444' }} /> Expected Cut Off Marks 2026
              </Typography>
              <Paper sx={{ p: 4, border: '1px solid', borderColor: 'divider', borderRadius: 4, background: 'background.paper' }}>
                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.7 }}>
                  Our team has analyzed the question standard of the July 4, 2026 examination. Below are the estimated cut-off ranges for various categories based on difficulty level and candidate performance.
                </Typography>
                
                <Stack spacing={2.5}>
                  {[
                    { category: 'General / Open Merit', cutoff: '58 - 64 Marks' },
                    { category: 'OBC / Ezhava / Muslim', cutoff: '54 - 59 Marks' },
                    { category: 'SC (Scheduled Caste)', cutoff: '46 - 52 Marks' },
                    { category: 'ST (Scheduled Tribe)', cutoff: '38 - 43 Marks' }
                  ].map((row, idx) => (
                    <Box key={idx} sx={{ p: 2, borderRadius: '12px', bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                        {row.category}
                      </Typography>
                      <Chip label={row.cutoff} sx={{ bgcolor: 'rgba(239, 68, 68, 0.12)', color: '#EF4444', fontWeight: 800 }} />
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Box>

            {/* Answer Key Discussion */}
            <Box>
              <Typography variant="h4" component="h2" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: 'text.primary', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ForumIcon sx={{ color: '#EF4444' }} /> Live Answer Key Discussion
              </Typography>
              <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 4 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.7 }}>
                  Join other KPSC Master candidates to review contested answers, calculate your net marks with negative markers, and discuss potential question key challenges.
                </Typography>
                <Link href="/community" style={{ textDecoration: 'none' }}>
                  <Button variant="contained" color="error" startIcon={<ForumIcon />} sx={{ py: 1.2, px: 3, borderRadius: '10px', fontWeight: 800, textTransform: 'none' }}>
                    Open Community Discussion Board
                  </Button>
                </Link>
              </Paper>
            </Box>
          </Stack>
        </Grid>

        {/* Right Column: FAQs */}
        <Grid item xs={12} md={5}>
          <Stack spacing={4}>
            {/* FAQs */}
            <Box>
              <Typography variant="h4" component="h2" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: 'text.primary', mb: 2 }}>
                Frequently Asked Questions
              </Typography>
              <Stack spacing={2}>
                {faqSchema.mainEntity.map((item, idx) => (
                  <Paper key={idx} sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary', mb: 1, fontSize: '0.95rem' }}>
                      {item.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                      {item.acceptedAnswer.text}
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}
