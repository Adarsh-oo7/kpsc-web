// app/(main)/exams/ldc-lgs-august-2026/page.tsx

import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Container, Box, Typography, Button, Paper, Stack, Grid, Chip } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DateRangeIcon from '@mui/icons-material/DateRange';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ShieldIcon from '@mui/icons-material/Shield';

import HubCountdown from './HubCountdown';

export const metadata: Metadata = {
  title: "BEVCO LDC Mock Test 2026 Free | August LDC LGS Exam Hub | Kerala PSC | KPSC Master",
  description: "Free BEVCO LDC mock test 2026 (Cat 618/2025) + LDC General (Cat 619/2025) + Storeman (Cat 620/2025). August 1, 2026 Kerala PSC exam hub — OMR simulation, bilingual practice, no signup.",
  keywords: [
    'BEVCO LDC mock test 2026',
    'BEVCO LDC mock test 2026 free',
    'LDC mock test August 2026',
    'LDC mock test free online 2026',
    'kerala psc LDC August 2026',
    'storeman PSC mock test 2026',
    'cat 618/2025 mock test',
    'cat 619/2025 mock test',
  ],
  alternates: {
    canonical: 'https://www.kpscmaster.in/exams/ldc-lgs-august-2026',
  },
  openGraph: {
    title: 'BEVCO LDC Mock Test 2026 Free | August LDC LGS Exam Hub | KPSC Master',
    description: "Free BEVCO LDC, LDC General & Storeman mock tests for August 1, 2026 Kerala PSC exams. No signup required.",
    url: 'https://www.kpscmaster.in/exams/ldc-lgs-august-2026',
    images: [{ url: '/KPSC MASTER.png', width: 1200, height: 630, alt: 'BEVCO LDC Mock Test 2026 Free' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BEVCO LDC Mock Test 2026 Free | August LDC LGS Hub | KPSC Master',
    description: "Free BEVCO LDC, LDC General & Storeman mock tests — August 1, 2026 Kerala PSC.",
    images: ['/KPSC MASTER.png'],
  },
};

export default function LdcLgsAugust2026HubPage() {
  const targetDate = "2026-08-01T00:00:00";

  const exams = [
    { title: 'LDC General (Cat 619/2025)', desc: 'Lower Division Clerk general vacancy mock tests.', link: '/exams/kerala-psc-ldc-online-test' },
    { title: 'BEVCO LDC (Cat 618/2025)', desc: 'Kerala State Beverages Corporation LDC mock papers.', link: '/quiz?exam_id=bevco-ldc' },
    { title: 'Storeman PSC (Cat 620/2025)', desc: 'Specialized storeman role OMR exam simulators.', link: '/quiz?exam_id=storeman-psc' }
  ];

  return (
    <Container maxWidth="lg" sx={{ pt: { xs: 3, md: 6 }, pb: 8 }}>
      {/* Breadcrumbs */}
      <Box sx={{ mb: 4, display: 'flex', gap: 1, alignItems: 'center' }}>
        <Link href="/" style={{ color: '#3B82F6', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>Home</Link>
        <Typography variant="caption" sx={{ color: 'grey.500' }}>&gt;</Typography>
        <Link href="/exams" style={{ color: '#3B82F6', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>Exams</Link>
        <Typography variant="caption" sx={{ color: 'grey.500' }}>&gt;</Typography>
        <Typography variant="caption" sx={{ color: 'grey.400' }}>August 2026 Exam Hub</Typography>
      </Box>

      {/* Hero Header */}
      <Paper
        sx={{
          p: { xs: 4, md: 5 },
          borderRadius: 6,
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(15, 23, 42, 0.95) 100%)',
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
                  label="August 1, 2026"
                  icon={<DateRangeIcon sx={{ fontSize: '0.9rem !important', color: '#8B5CF6 !important' }} />}
                  sx={{
                    background: 'rgba(139, 92, 246, 0.12)',
                    color: '#8B5CF6',
                    fontWeight: 800,
                    fontSize: '0.75rem',
                  }}
                />
                <Chip
                  label="Multiple Categories"
                  icon={<ShieldIcon sx={{ fontSize: '0.9rem !important', color: '#10B981 !important' }} />}
                  sx={{
                    background: 'rgba(16, 185, 129, 0.12)',
                    color: '#10B981',
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
                August 2026 LDC & LGS Exam Hub
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 620, fontSize: '1.05rem', lineHeight: 1.6 }}>
                Simultaneous exams hub for General LDC, Storeman, and BEVCO LDC. Access tailored question sets for each role and benchmark your performance today.
              </Typography>

              {/* Countdown Timer */}
              <HubCountdown targetDate={targetDate} />
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Grid of Exams */}
      <Typography variant="h4" component="h2" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: 'text.primary', mb: 3 }}>
        Select Your Target Exam Mock Test
      </Typography>
      <Grid container spacing={3}>
        {exams.map((exam, idx) => (
          <Grid item xs={12} md={4} key={idx}>
            <Paper
              sx={{
                p: 3,
                height: '100%',
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: 'background.paper',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  borderColor: '#8B5CF6'
                }
              }}
            >
              <Box>
                <Chip label="OMR Simulator" color="secondary" size="small" sx={{ mb: 2, fontWeight: 800 }} />
                <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', mb: 1.5 }}>
                  {exam.title}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6, mb: 3 }}>
                  {exam.desc}
                </Typography>
              </Box>

              <Link href={exam.link} style={{ textDecoration: 'none' }}>
                <Button variant="contained" fullWidth endIcon={<ArrowForwardIcon />} sx={{ textTransform: 'none', py: 1.2, borderRadius: '10px', fontWeight: 800 }}>
                  Start Free Test
                </Button>
              </Link>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
