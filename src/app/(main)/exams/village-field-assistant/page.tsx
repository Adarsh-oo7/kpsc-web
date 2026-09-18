// app/(main)/exams/village-field-assistant/page.tsx

import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Container, Box, Typography, Button, Paper, Stack, Grid, Chip } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DateRangeIcon from '@mui/icons-material/DateRange';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

import VfaCountdown from './VfaCountdown';
import VfaDistrictStats from './VfaDistrictStats';
import { VFA_PHASES, vfaFaqAnswer } from '@/lib/vfaSchedule';

export const metadata: Metadata = {
  title: "VFA Mock Test 2026 Free | Village Field Assistant Kerala PSC Sept 19, Oct 17 & Oct 31 | Bilingual Malayalam | KPSC Master",
  description: "Free Village Field Assistant (VFA) mock test 2026 — Kerala PSC district-wise exam on 19 September, 17 October and 31 October 2026. VFA mock test Malayalam medium, bilingual questions, downloadable syllabus summary. Cat 571/2025. No signup.",
  keywords: [
    'village field assistant mock test',
    'vfa mock test',
    'village field assistant mock test malayalam',
    'psc vfa mock test',
    'vfa question paper 2024',
    'VFA mock test 2026 free',
    'village field assistant mock test 2026',
    'VFA mock test Malayalam medium',
    'VFA syllabus 2026 PDF',
    'VFA Kerala PSC Sept 19',
    'VFA Kerala PSC Oct 17',
    'VFA Kerala PSC Oct 31',
    'village field assistant syllabus 2026',
    'VFA previous year questions Kerala PSC',
    'cat 571/2025 mock test',
  ],
  alternates: {
    canonical: 'https://www.kpscmaster.in/exams/village-field-assistant',
  },
  openGraph: {
    title: 'VFA Mock Test 2026 Free | Village Field Assistant Kerala PSC District-wise Dates | KPSC Master',
    description: "Free VFA mock test Malayalam 2026 — Kerala PSC on 19 Sep, 17 Oct and 31 Oct 2026 (district-wise), Cat 571/2025. Bilingual questions, syllabus summary, AI explanations. No signup.",
    url: 'https://www.kpscmaster.in/exams/village-field-assistant',
    images: [{ url: '/KPSC MASTER.png', width: 1200, height: 630, alt: 'Village Field Assistant Mock Test 2026 Free' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VFA Mock Test 2026 Free | Village Field Assistant District-wise Dates | KPSC Master',
    description: "Free VFA mock test Malayalam 2026 — Kerala PSC exam 19 Sep, 17 Oct and 31 Oct. Bilingual, AI explanations. No signup.",
    images: ['/KPSC MASTER.png'],
  },
};

export default function VillageFieldAssistantPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': "When is the Kerala PSC Village Field Assistant (VFA) exam 2026?",
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': vfaFaqAnswer()
        }
      },
      {
        '@type': 'Question',
        'name': "What is the VFA exam pattern and marks distribution?",
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': "The VFA exam is a 100-mark OMR test consisting of: General Knowledge (50 marks), General Mathematics (20 marks), General English (10 marks), Regional Language Malayalam (10 marks), and Special Topics on Agriculture & VFA Duties (10 marks)."
        }
      },
      {
        '@type': 'Question',
        'name': "Are there VFA previous year question papers available?",
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': "Yes! You can practice the official VFA previous year papers (2022 and 2024 VFA exams) in interactive mock test mode on KPSC Master."
        }
      },
      {
        '@type': 'Question',
        'name': "Does the mock exam support negative marking?",
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': "Yes, the VFA mock tests on KPSC Master enforce standard KPSC negative marking rules where 1/3 (0.33) mark is deducted for each incorrect answer."
        }
      },
      {
        '@type': 'Question',
        'name': "Where can I find the special topics notes for VFA?",
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': "VFA-specific agriculture and revenue system special topics notes are integrated into KPSC Master's smart study feed and revision card system."
        }
      }
    ]
  };

  const courseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    'name': "Village Field Assistant (VFA) Complete Preparation Course",
    'description': "Access bilingual mock exams, topic quizzes, daily current affairs, and special topics notes for the Kerala PSC VFA exam.",
    'provider': {
      '@type': 'Organization',
      'name': "KPSC Master",
      'sameAs': "https://www.kpscmaster.in"
    }
  };

  const weightages = [
    { subject: 'General Knowledge & Science', weight: 50, details: 'History, Geography, Civics, Science & Current Affairs' },
    { subject: 'General Mathematics', weight: 20, details: 'Simple Arithmetic, Fractions, Profit & Loss, Percentages' },
    { subject: 'General English', weight: 10, details: 'English Grammar, Vocabulary, Word correction' },
    { subject: 'Regional Language (Malayalam)', weight: 10, details: 'Spelling, translation, idioms, and grammar' },
    { subject: 'Agriculture & Special VFA Topics', weight: 10, details: 'Agricultural schemes, revenue laws, and local governance' }
  ];

  return (
    <Container maxWidth="lg" sx={{ pt: { xs: 3, md: 6 }, pb: 8 }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />

      {/* Breadcrumbs */}
      <Box sx={{ mb: 4, display: 'flex', gap: 1, alignItems: 'center' }}>
        <Link href="/" style={{ color: '#3B82F6', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>Home</Link>
        <Typography variant="caption" sx={{ color: 'grey.500' }}>&gt;</Typography>
        <Link href="/exams" style={{ color: '#3B82F6', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>Exams</Link>
        <Typography variant="caption" sx={{ color: 'grey.500' }}>&gt;</Typography>
        <Typography variant="caption" sx={{ color: 'grey.400' }}>Village Field Assistant</Typography>
      </Box>

      {/* Hero Header */}
      <Paper
        sx={{
          p: { xs: 4, md: 5 },
          borderRadius: 6,
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(15, 23, 42, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid', borderColor: 'divider',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          mb: 5
        }}
      >
        <Grid container spacing={4} alignItems="center">
          <Grid size={{ xs: 12, md: 8 }}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {VFA_PHASES.map((phase) => (
                  <Chip
                    key={phase.date}
                    label={phase.label}
                    icon={<DateRangeIcon sx={{ fontSize: '0.9rem !important', color: '#3B82F6 !important' }} />}
                    sx={{
                      background: 'rgba(59, 130, 246, 0.12)',
                      color: '#3B82F6',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                    }}
                  />
                ))}
                <Chip
                  label="Category 571/2025"
                  icon={<AssignmentIcon sx={{ fontSize: '0.9rem !important', color: '#8B5CF6 !important' }} />}
                  sx={{
                    background: 'rgba(139, 92, 246, 0.12)',
                    color: '#8B5CF6',
                    fontWeight: 800,
                    fontSize: '0.75rem',
                  }}
                />
              </Stack>
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
                Village Field Assistant Mock Test 2026 — District-wise exam
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 620, fontSize: '1.05rem', lineHeight: 1.6 }}>
                Kerala PSC is conducting VFA on three Saturdays: 19 September, 17 October and 31 October 2026. Pick your district below for the live countdown, then practise with bilingual mock tests and SCERT-based math & science questions.
              </Typography>

              <VfaCountdown />
            </Stack>
          </Grid>
          
          <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <Link href="/quiz?exam_id=village-field-assistant" style={{ textDecoration: 'none', width: '100%' }}>
              <Button
                variant="contained"
                fullWidth
                sx={{
                  py: 2.2,
                  px: 4,
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                  fontWeight: 900,
                  fontSize: '1.05rem',
                  textTransform: 'none',
                  boxShadow: '0 8px 32px rgba(59,130,246,0.3)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 40px rgba(59,130,246,0.4)',
                  }
                }}
              >
                Start Free Mock Test — No Signup
              </Button>
            </Link>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ mb: 5 }}>
        <Typography variant="h4" component="h2" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: 'text.primary', mb: 2 }}>
          Official VFA exam dates by district
        </Typography>
        <Grid container spacing={2}>
          {VFA_PHASES.map((phase) => (
            <Grid size={{ xs: 12, md: 4 }} key={phase.date}>
              <Paper sx={{ p: 2.5, height: '100%', border: '1px solid', borderColor: 'divider', borderRadius: 4 }}>
                <Chip
                  label={phase.weekday}
                  size="small"
                  sx={{ fontWeight: 800, mb: 1.25, bgcolor: 'rgba(59, 130, 246, 0.12)', color: '#3B82F6' }}
                />
                <Typography sx={{ fontWeight: 900, fontSize: '1.15rem', mb: 1 }}>{phase.label}</Typography>
                <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  {phase.districts.join(', ')}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Main Content Layout */}
      <Grid container spacing={4}>
        {/* Left Column: Syllabus & District Stats */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Stack spacing={4}>
            {/* Syllabus breakdown */}
            <Box>
              <Typography variant="h4" component="h2" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: 'text.primary', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssignmentIcon sx={{ color: '#3B82F6' }} /> Official Syllabus Weightages
              </Typography>
              <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 4 }}>
                <Stack spacing={3}>
                  {weightages.map((item, idx) => (
                    <Box key={idx}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.8 }}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>{item.subject}</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>{item.details}</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#3B82F6', fontFamily: "'JetBrains Mono'" }}>{item.weight} Marks</Typography>
                      </Stack>
                      <Box sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: 'action.hover',
                        overflow: 'hidden'
                      }}>
                        <Box sx={{
                          height: '100%',
                          width: `${item.weight * 2}%`,
                          borderRadius: 3,
                          bgcolor: '#3B82F6'
                        }} />
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Box>

            {/* District applicant stats */}
            <Box>
              <Typography variant="h4" component="h2" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: 'text.primary', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                📊 VFA District-wise Stats
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.6 }}>
                Exam Saturday, applicant load and vacancy projections across all 14 districts. Use this to plan your cutoff and revision window.
              </Typography>
              <VfaDistrictStats />
            </Box>
          </Stack>
        </Grid>

        {/* Right Column: PYQ & FAQs */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={4}>
            {/* VFA Previous Year Papers */}
            <Box>
              <Typography variant="h4" component="h2" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: 'text.primary', mb: 2 }}>
                📁 VFA Previous Year Papers
              </Typography>
              <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 4 }}>
                <Stack spacing={2}>
                  <Button variant="outlined" startIcon={<PictureAsPdfIcon />} fullWidth sx={{ justifyContent: 'space-between', textTransform: 'none', py: 1.2, borderRadius: '10px' }}>
                    <span>VFA Question Paper 2024 (Interactive)</span>
                    <ArrowForwardIcon sx={{ fontSize: 16 }} />
                  </Button>
                  <Button variant="outlined" startIcon={<PictureAsPdfIcon />} fullWidth sx={{ justifyContent: 'space-between', textTransform: 'none', py: 1.2, borderRadius: '10px' }}>
                    <span>VFA Question Paper 2022 (Interactive)</span>
                    <ArrowForwardIcon sx={{ fontSize: 16 }} />
                  </Button>
                </Stack>
              </Paper>
            </Box>

            {/* FAQs Accordion */}
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
