// app/(main)/exams/kseb-electricity-worker/page.tsx

import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Container, Box, Typography, Button, Paper, Stack, Grid, Chip, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DateRangeIcon from '@mui/icons-material/DateRange';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export const metadata: Metadata = {
  title: "KSEB Electricity Worker Mock Test 2026 | Mazdoor Cat 021/2026 Free",
  description: "Free KSEB Electricity Worker (Mazdoor) mock tests. Exam Sept 30, 2026. Basic Electricity, Ohm's Law, Magnetism, Kerala PSC GK. No signup needed.",
  alternates: {
    canonical: 'https://www.kpscmaster.in/exams/kseb-electricity-worker',
  }
};

export default function KsebElectricityWorkerPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': "When is the KSEB Electricity Worker exam date 2026?",
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': "The KSEB Electricity Worker (also known as KSEB Mazdoor) exam is scheduled to be held on September 30, 2026, under Category 021/2026."
        }
      },
      {
        '@type': 'Question',
        'name': "What is the syllabus for the KSEB Electricity Worker exam?",
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': "The syllabus covers Basic Technical Electricity topics (60 marks) including Ohm's Law, Magnetism, AC Circuits, Electrical Wiring, and Safety Precautions, along with General Knowledge & Current Affairs (40 marks)."
        }
      },
      {
        '@type': 'Question',
        'name': "Are the KSEB Mazdoor questions bilingual?",
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': "Yes! The KSEB Electricity Worker practice questions are available in both Malayalam and English (മലയാളം + English) on KPSC Master with AI explanations."
        }
      },
      {
        '@type': 'Question',
        'name': "Does the electricity worker exam have negative marking?",
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': "Yes, a deduction of 1/3 (0.33) marks applies for each wrong answer as per standard Kerala PSC exam regulations."
        }
      }
    ]
  };

  const technicalModules = [
    { module: 'Module 1: Basic Electricity & Ohm\'s Law', desc: 'Atomic structure, conductors, insulators, current, voltage, resistance, Ohm\'s law series & parallel connections.' },
    { module: 'Module 2: Magnetism & Electromagnetism', desc: 'Magnetic fields, magnetic flux, electromagnetism laws, electromagnetic induction, Faraday\'s laws.' },
    { module: 'Module 3: Alternating Current (AC) Circuits', desc: 'AC terms, RMS value, phase differences, single phase and three phase basics.' },
    { module: 'Module 4: Wiring Systems & Earthing', desc: 'Types of wiring, safety fuses, circuit breakers, earthing installation, lightning conductors.' },
    { module: 'Module 5: Safety Rules & First Aid', desc: 'Electrical shock safety rules, artificial respiration, fire fighting on electrical installations.' }
  ];

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
        <Typography variant="caption" sx={{ color: 'grey.400' }}>KSEB Electricity Worker</Typography>
      </Box>

      {/* Hero Header */}
      <Paper
        sx={{
          p: { xs: 4, md: 5 },
          borderRadius: 6,
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(15, 23, 42, 0.95) 100%)',
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
                  label="Sept 30, 2026"
                  icon={<DateRangeIcon sx={{ fontSize: '0.9rem !important', color: '#F59E0B !important' }} />}
                  sx={{
                    background: 'rgba(245, 158, 11, 0.12)',
                    color: '#F59E0B',
                    fontWeight: 800,
                    fontSize: '0.75rem',
                  }}
                />
                <Chip
                  label="Category 021/2026"
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
                KSEB Electricity Worker Mock Test 2026 — Cat 021/2026
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 620, fontSize: '1.05rem', lineHeight: 1.6 }}>
                Secure your job in KSEB. Practice with technical mock papers, wiring diagrams revision cards, and basic electricity principles drills in Malayalam.
              </Typography>
            </Stack>
          </Grid>
          
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <Link href="/quiz?exam_id=kseb-electricity-worker" style={{ textDecoration: 'none', width: '100%' }}>
              <Button
                variant="contained"
                fullWidth
                sx={{
                  py: 2.2,
                  px: 4,
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                  fontWeight: 900,
                  fontSize: '1.05rem',
                  textTransform: 'none',
                  boxShadow: '0 8px 32px rgba(245,158,11,0.3)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 40px rgba(245,158,11,0.4)',
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
        {/* Left Column: Syllabus & Modules */}
        <Grid item xs={12} md={7}>
          <Stack spacing={4}>
            {/* Technical Syllabus Modules */}
            <Box>
              <Typography variant="h4" component="h2" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: 'text.primary', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <FlashOnIcon sx={{ color: '#F59E0B' }} /> KSEB Technical Syllabus Modules (60 Marks)
              </Typography>
              
              <Paper sx={{ p: 4, border: '1px solid', borderColor: 'divider', borderRadius: 4, background: 'background.paper' }}>
                <Stack spacing={3}>
                  {technicalModules.map((item, idx) => (
                    <Box key={idx} sx={{ p: 2, borderRadius: '12px', bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', mb: 1 }}>
                        {item.module}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                        {item.desc}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Box>
          </Stack>
        </Grid>

        {/* Right Column: General Knowledge & FAQ */}
        <Grid item xs={12} md={5}>
          <Stack spacing={4}>
            {/* GK Syllabus Card */}
            <Box>
              <Typography variant="h4" component="h2" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: 'text.primary', mb: 2 }}>
                🌍 General Knowledge Section (40 Marks)
              </Typography>
              <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 4 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                  * **Indian Geography & Civics (15 Marks):** States, borders, rivers, constitution articles, and fundamental rights.
                  <br />
                  * **Kerala Renaissance (15 Marks):** Sree Narayana Guru, Ayyankali, and prominent reforms.
                  <br />
                  * **Current Affairs (10 Marks):** National and state events in science, politics, and sports.
                </Typography>
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
