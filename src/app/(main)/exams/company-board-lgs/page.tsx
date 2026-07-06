// app/(main)/exams/company-board-lgs/page.tsx

import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Container, Box, Typography, Button, Paper, Stack, Grid, Divider, Chip, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DateRangeIcon from '@mui/icons-material/DateRange';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// Client components
import LgsCountdown from './LgsCountdown';
import LgsLeaderboard from './LgsLeaderboard';
import LgsSyllabusAccordion from './LgsSyllabusAccordion';

export const metadata: Metadata = {
  title: "Company Board LGS Mock Test 2026 Free | Kerala PSC Cat 423/2025 | Exam July 18 | KPSC Master",
  description: "Free Company Board LGS (Last Grade Servant) mock test 2026 — exam July 18, Cat 423/2025. LGS mock test free Malayalam, 100 questions OMR pattern, no negative marking, no signup needed.",
  keywords: [
    'company board LGS mock test 2026 free',
    'LGS mock test free Malayalam 2026',
    'LGS mock test free online 2026',
    'lgs company board answer key July 2026',
    'kerala psc lgs mock test',
    'company board last grade servant mock test',
    'cat 423/2025 mock test',
    'LGS exam July 18 2026',
  ],
  alternates: {
    canonical: 'https://www.kpscmaster.in/exams/company-board-lgs',
  },
  openGraph: {
    title: 'Company Board LGS Mock Test 2026 Free | Exam July 18 | KPSC Master',
    description: "Free Company Board LGS mock test 2026 — exam July 18, Cat 423/2025. 100 questions, no negative marking, LGS mock test free Malayalam. No signup.",
    url: 'https://www.kpscmaster.in/exams/company-board-lgs',
    images: [{ url: '/KPSC MASTER.png', width: 1200, height: 630, alt: 'Company Board LGS Mock Test 2026 Free' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Company Board LGS Mock Test 2026 Free | July 18 Exam | KPSC Master',
    description: "Free LGS mock test Malayalam 2026 — 100 questions, no negative marking. Exam July 18.",
    images: ['/KPSC MASTER.png'],
  },
};

export default function CompanyBoardLgsPage() {
  const examDate = "2026-07-18T00:00:00";

  // FAQ Schema JSON-LD
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': "When is the Company Board LGS exam 2026?",
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': "The Kerala PSC Company Board LGS (Last Grade Servant) exam is scheduled to be held on July 18, 2026 (Saturday), under Category 423/2025."
        }
      },
      {
        '@type': 'Question',
        'name': "Is there negative marking in LGS Company Board exam?",
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': "There is no negative marking in the Company Board LGS exam. Candidates are encouraged to attempt all 100 questions."
        }
      },
      {
        '@type': 'Question',
        'name': "How many mock tests are available on KPSC Master for LGS?",
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': "KPSC Master offers 10+ free LGS mock tests with simulated timers, district rankings, and AI-powered explanations in Malayalam and English."
        }
      },
      {
        '@type': 'Question',
        'name': "What is the syllabus weightage for Company Board LGS?",
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': "The LGS syllabus consists of General Knowledge (50 marks), Simple Arithmetic & Mental Ability (20 marks), General English (20 marks), and Regional Language Malayalam (10 marks)."
        }
      },
      {
        '@type': 'Question',
        'name': "How can I prepare for the Company Board LGS exam online?",
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': "You can practice full-length LGS mock tests on KPSC Master, study SCERT-based math and science materials, and review daily current affairs. All resources are free and do not require registration."
        }
      },
      {
        '@type': 'Question',
        'name': "Where to find the Company Board LGS answer key July 2026?",
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': "The Kerala PSC Company Board LGS answer key for July 18, 2026 (Cat 423/2025) will be published on the official Kerala PSC website (keralapsc.gov.in) after the exam. KPSC Master will also publish a detailed question-by-question analysis and expected cutoff prediction on this page."
        }
      },
      {
        '@type': 'Question',
        'name': "What is the expected cutoff for Company Board LGS 2026?",
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': "Based on previous LGS exams and the difficulty level, the expected cutoff for Company Board LGS (Cat 423/2025) is approximately 65–75 marks out of 100. Since there is no negative marking, candidates should attempt all questions."
        }
      }
    ]
  };

  // Course Schema JSON-LD
  const courseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    'name': "Company Board LGS Mock Test & Prep Course 2026",
    'description': "Access timed mock exams, structured syllabus guides, and daily quizzes with explanation notes for the Kerala PSC Company Board LGS exam.",
    'provider': {
      '@type': 'Organization',
      'name': "KPSC Master",
      'sameAs': "https://www.kpscmaster.in"
    }
  };

  const subjectWeightages = [
    { subject: 'General Knowledge & Science', weight: 50, color: 'linear-gradient(90deg, #10B981, #059669)' },
    { subject: 'Simple Arithmetic & Mental Ability', weight: 20, color: 'linear-gradient(90deg, #3B82F6, #2563EB)' },
    { subject: 'General English', weight: 20, color: 'linear-gradient(90deg, #8B5CF6, #7C3AED)' },
    { subject: 'Regional Language (Malayalam)', weight: 10, color: 'linear-gradient(90deg, #F59E0B, #D97706)' }
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
        <Typography variant="caption" sx={{ color: 'grey.400' }}>Company Board LGS</Typography>
      </Box>

      {/* Hero Header */}
      <Paper
        sx={{
          p: { xs: 4, md: 5 },
          borderRadius: 6,
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(15, 23, 42, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid', borderColor: 'divider',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          mb: 5
        }}
      >
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={8}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                <Chip
                  label="July 18, 2026"
                  icon={<DateRangeIcon sx={{ fontSize: '0.9rem !important', color: '#10B981 !important' }} />}
                  sx={{
                    background: 'rgba(16, 185, 129, 0.12)',
                    color: '#10B981',
                    fontWeight: 800,
                    fontSize: '0.75rem',
                  }}
                />
                <Chip
                  label="Category 423/2025"
                  icon={<AssignmentIcon sx={{ fontSize: '0.9rem !important', color: '#3B82F6 !important' }} />}
                  sx={{
                    background: 'rgba(59, 130, 246, 0.12)',
                    color: '#3B82F6',
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
                Company Board LGS Mock Test 2026 — Exam on July 18
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 620, fontSize: '1.05rem', lineHeight: 1.6 }}>
                Crack the upcoming Last Grade Servant exam for Company Board, Corporation, and Major Departments. Study using simulated OMR tests with smart Malayalam explanations.
              </Typography>

              {/* Countdown Timer */}
              <LgsCountdown targetDate={examDate} />
            </Stack>
          </Grid>
          
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <Link href="/quiz?exam_id=company-board-lgs" style={{ textDecoration: 'none', width: '100%' }}>
              <Button
                variant="contained"
                fullWidth
                sx={{
                  py: 2.2,
                  px: 4,
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #10B981, #059669)',
                  fontWeight: 900,
                  fontSize: '1.05rem',
                  textTransform: 'none',
                  boxShadow: '0 8px 32px rgba(16,185,129,0.3)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #10B981, #059669)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 40px rgba(16,185,129,0.4)',
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
        <Grid item xs={12} md={7}>
          <Stack spacing={4}>
            {/* Exam Pattern (Weightage) */}
            <Box>
              <Typography variant="h4" component="h2" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: 'text.primary', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssignmentIcon sx={{ color: '#10B981' }} /> Exam Pattern & Weightage
              </Typography>
              <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 4, background: 'background.paper' }}>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800 }}>Feature</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Details</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>Total Questions</TableCell>
                        <TableCell sx={{ fontFamily: "'JetBrains Mono'", fontWeight: 700 }}>100 MCQs</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Duration</TableCell>
                        <TableCell sx={{ fontFamily: "'JetBrains Mono'", fontWeight: 700 }}>75 Minutes (1 Hour 15 Mins)</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Negative Marking</TableCell>
                        <TableCell sx={{ color: '#10B981', fontWeight: 800 }}>None (Attempt All Questions)</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Exam Format</TableCell>
                        <TableCell>OMR Objective Sheet (Pen & Paper Simulator)</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>

                <Stack spacing={2.5} sx={{ mt: 4 }}>
                  {subjectWeightages.map((sub, idx) => (
                    <Box key={idx}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.8 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{sub.subject}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#10B981', fontFamily: "'JetBrains Mono'" }}>{sub.weight} Marks</Typography>
                      </Stack>
                      <Box sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: 'action.hover',
                        overflow: 'hidden'
                      }}>
                        <Box sx={{
                          height: '100%',
                          width: `${sub.weight * 2}%`,
                          borderRadius: 4,
                          background: sub.color
                        }} />
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Box>

            {/* Syllabus section */}
            <Box>
              <Typography variant="h4" component="h2" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: 'text.primary', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <HelpOutlineIcon sx={{ color: '#10B981' }} /> Official Syllabus Details
              </Typography>
              <LgsSyllabusAccordion />
            </Box>
          </Stack>
        </Grid>

        {/* Right Column: Leaderboard & FAQs */}
        <Grid item xs={12} md={5}>
          <Stack spacing={4}>
            {/* Leaderboard Widget */}
            <Box>
              <Typography variant="h4" component="h2" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: 'text.primary', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <LeaderboardIcon sx={{ color: '#10B981' }} /> Top LGS Scorers Today
              </Typography>
              <LgsLeaderboard />
            </Box>

            {/* Frequently Asked Questions */}
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

            {/* Related Exams */}
            <Box>
              <Typography variant="h4" component="h2" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: 'text.primary', mb: 2 }}>
                Related Mock Tests
              </Typography>
              <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 4 }}>
                <Stack spacing={2}>
                  <Link href="/exams/kerala-psc-ldc-online-test" style={{ textDecoration: 'none' }}>
                    <Button variant="outlined" fullWidth sx={{ justifyContent: 'space-between', textTransform: 'none', py: 1.2, borderRadius: '10px' }}>
                      <span>Lower Division Clerk (LDC) Mock Test</span>
                      <ArrowForwardIcon sx={{ fontSize: 16 }} />
                    </Button>
                  </Link>
                  <Link href="/exams/kerala-psc-lgs-online-test" style={{ textDecoration: 'none' }}>
                    <Button variant="outlined" fullWidth sx={{ justifyContent: 'space-between', textTransform: 'none', py: 1.2, borderRadius: '10px' }}>
                      <span>General Last Grade Servant (LGS) Practice</span>
                      <ArrowForwardIcon sx={{ fontSize: 16 }} />
                    </Button>
                  </Link>
                </Stack>
              </Paper>
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}
