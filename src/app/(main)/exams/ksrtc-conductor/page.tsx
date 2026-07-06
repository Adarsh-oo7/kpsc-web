// app/(main)/exams/ksrtc-conductor/page.tsx

import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Container, Box, Typography, Button, Paper, Stack, Grid, Divider, Chip, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export const metadata: Metadata = {
  title: "Conductor Syllabus 2026 PDF + Free Mock Test | Kerala PSC KSRTC",
  description: "Download Conductor Syllabus 2026 PDF. KSRTC Conductor exam pattern, 40M General Studies + 40M Arithmetic + 20M Special Topics. Free mock test.",
  alternates: {
    canonical: 'https://www.kpscmaster.in/exams/ksrtc-conductor',
  }
};

export default function KsrtcConductorPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': "What is the KSRTC Conductor syllabus 2026?",
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': "The KSRTC Conductor syllabus consists of 100 marks total: General Studies (40 marks), Simple Arithmetic & Mental Ability (40 marks), and Special Topics including KSRTC Act, duties, and First Aid (20 marks)."
        }
      },
      {
        '@type': 'Question',
        'name': "How can I download the conductor syllabus 2026 PDF?",
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': "You can download the official KSRTC Conductor Syllabus 2026 PDF and subject weightage summary directly from the syllabus section on KPSC Master."
        }
      },
      {
        '@type': 'Question',
        'name': "When is the next KSRTC conductor bharti 2026 exam?",
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': "The Kerala PSC KSRTC Conductor exam dates and vacancy notifications for the 2026 bharti are updated live on the official KPSC website and tracked on KPSC Master."
        }
      },
      {
        '@type': 'Question',
        'name': "Is there negative marking in the KSRTC Conductor exam?",
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': "Yes, standard Kerala PSC rules apply: 1 mark is awarded for each correct answer, and 1/3 (0.33) marks are deducted for every incorrect selection."
        }
      }
    ]
  };

  const subjects = [
    { subject: 'Part I: General Studies & Current Affairs', marks: 40, desc: 'History of India & Kerala, Geography, Civics, and National movements.' },
    { subject: 'Part II: Simple Arithmetic & Mental Ability', marks: 40, desc: 'Fractions, Percentage, Profit & Loss, Time & Work, Logical reasoning.' },
    { subject: 'Part III: Special Topics (Duties & KSRTC Rules)', marks: 20, desc: 'First Aid basics, passenger relations, conductor duties, Motor Vehicles Act.' }
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
        <Typography variant="caption" sx={{ color: 'grey.400' }}>KSRTC Conductor</Typography>
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
          <Grid item xs={12} md={8}>
            <Stack spacing={2}>
              <Box>
                <Chip
                  label="KSRTC CONDUCTOR 2026"
                  sx={{
                    background: 'rgba(59, 130, 246, 0.12)',
                    color: '#3B82F6',
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
                Conductor Syllabus 2026 PDF + Free Mock Test
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 620, fontSize: '1.05rem', lineHeight: 1.6 }}>
                Access KSRTC Conductor exam syllabus details, subject weightages, and practice mock tests in Malayalam and English with simulated negative marking.
              </Typography>
            </Stack>
          </Grid>
          
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <Link href="/quiz?exam_id=ksrtc-conductor" style={{ textDecoration: 'none', width: '100%' }}>
              <Button
                variant="contained"
                fullWidth
                sx={{
                  py: 2.2,
                  px: 4,
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                  fontWeight: 900,
                  fontSize: '1.05rem',
                  textTransform: 'none',
                  boxShadow: '0 8px 32px rgba(59,130,246,0.3)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
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

      {/* Main Content Layout */}
      <Grid container spacing={4}>
        {/* Left Column: Syllabus & Download */}
        <Grid item xs={12} md={7}>
          <Stack spacing={4}>
            {/* Syllabus summary card */}
            <Box>
              <Typography variant="h4" component="h2" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: 'text.primary', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssignmentIcon sx={{ color: '#3B82F6' }} /> KSRTC Conductor Exam Syllabus 2026 PDF Download
              </Typography>
              
              <Paper sx={{ p: 4, border: '1px solid', borderColor: 'divider', borderRadius: 4, background: 'background.paper', mb: 3 }}>
                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.7 }}>
                  Below is the official KSRTC Conductor syllabus weightage breakdown. You can download the complete topic list or study directly using our simulated quiz modules.
                </Typography>
                
                <Stack spacing={3}>
                  {subjects.map((sub, idx) => (
                    <Box key={idx} sx={{ p: 2, borderRadius: '12px', bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                          {sub.subject}
                        </Typography>
                        <Chip label={`${sub.marks} Marks`} color="primary" size="small" sx={{ fontWeight: 800 }} />
                      </Stack>
                      <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                        {sub.desc}
                      </Typography>
                    </Box>
                  ))}
                </Stack>

                <Button
                  variant="outlined"
                  startIcon={<FileDownloadIcon />}
                  sx={{ mt: 4, textTransform: 'none', py: 1.2, px: 3, borderRadius: '10px', fontWeight: 800 }}
                  onClick={() => alert("Syllabus PDF download will begin shortly...")}
                >
                  Download Syllabus PDF Summary
                </Button>
              </Paper>
            </Box>
          </Stack>
        </Grid>

        {/* Right Column: FAQs & Links */}
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

            {/* Related Mock Tests */}
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
