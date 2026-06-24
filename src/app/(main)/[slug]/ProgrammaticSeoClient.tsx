'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Chip,
  Stack,
  Avatar,
  Paper,
  LinearProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SchoolIcon from '@mui/icons-material/School';

interface ExamInfo {
  name: string;
  formalName: string;
  duration: number;
  qCount: number;
}

interface ProgrammaticSeoClientProps {
  type: string;
  location: string;
  locationKey: string;
  exam?: ExamInfo;
  examKey?: string;
}

// Subject weightages helper
const getSubjectWeightages = (examName: string) => {
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
      { subject: 'Arithmetic & Mental Ability', weight: 25 },
      { subject: 'English Language & Grammar', weight: 20 },
      { subject: 'Malayalam/Regional Language', weight: 15 }
    ];
  }
};

export default function ProgrammaticSeoClient({
  type,
  location,
  locationKey,
  exam,
  examKey,
}: ProgrammaticSeoClientProps) {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Determine Title, Subtitle and SEO Headlines based on page type
  let pageTitle = '';
  let pageSubtitle = '';
  let badges: string[] = [];
  let descriptionText = '';
  let detailTitle = '';

  const malayalamPhrases = [
    'കേരള PSC തയ്യാറെടുപ്പ്',
    'വിജയത്തിലേക്കുള്ള വഴി',
    'ഇന്ന് തന്നെ പരിശീലനം ആരംഭിക്കൂ',
    'സൗജന്യ PSC Mock Test',
    'PSC വിജയത്തിനുള്ള മികച്ച പ്ലാറ്റ്ഫോം'
  ];

  if (type === 'exam-location' && exam) {
    pageTitle = `${exam.formalName} Online Coaching & Preparation in ${location}`;
    pageSubtitle = `Accelerate your ${exam.name} preparation in ${location} with Kerala's top AI-powered study platform. Timed mock tests, subject weightages, and 24/7 smart revision.`;
    badges = [malayalamPhrases[0], malayalamPhrases[1], `🎯 Target ${exam.name} Exam`];
    descriptionText = `Aspirants in ${location} (Thiruvananthapuram District) preparing for the ${exam.formalName} can now access official syllabus guides, subject-wise mock tests, and smart revision notes on KPSC Master. Solve over 12 Lakh+ daily questions and benchmark your performance against other aspirants in ${location} and across Kerala.`;
    detailTitle = `${exam.name} Subject Distribution & Study Tracker`;
  } else if (type === 'mock-test-location') {
    pageTitle = `Free Kerala PSC Mock Tests & Daily Quizzes in ${location}`;
    pageSubtitle = `Practice timed Kerala PSC exams, daily quizzes, and current affairs online. Designed specifically for aspirants preparing from ${location}.`;
    badges = [malayalamPhrases[3], malayalamPhrases[4], `📊 District Rankings`];
    descriptionText = `Looking for free Kerala PSC online tests in ${location}? Get instant access to simulated exam environments with strict timers, real negative marking, and instant AI doubt solving. Compare your daily scores on the live leaderboard with other Kerala PSC aspirants in ${location}, Thiruvananthapuram, and across Kerala.`;
    detailTitle = `Available Online Mock Exams & Test Series`;
  } else if (type === 'coaching-location') {
    pageTitle = `Best Kerala PSC Coaching in ${location} — Online Classes & Study App`;
    pageSubtitle = `Transform your preparation with the best digital PSC coaching platform. Access structured classes, study cards, and mock exams from the comfort of your home in ${location}.`;
    badges = [malayalamPhrases[4], 'കേരള സർക്കാർ ജോലി', `🏆 Study Streak System`];
    descriptionText = `Traditional offline coaching classes in ${location} can be rigid and expensive. KPSC Master offers a smart, interactive digital coaching environment that adapts to your learning pace. Trusted by 47,000+ students, it is the premier platform to study for LDC, LGS, Degree Level, and other Kerala Government job exams in ${location}, Thiruvananthapuram, and Kollam.`;
    detailTitle = `Why Choose Online Coaching Over Offline Classes in ${location}?`;
  } else if (type === 'online-coaching-location') {
    pageTitle = `Kerala PSC Online Coaching & Classes in ${location} — KPSC Master`;
    pageSubtitle = `Achieve your dream government job with AI-powered Kerala PSC online classes. Study daily quizzes and real mock tests with full Malayalam explanation support in ${location}.`;
    badges = [malayalamPhrases[2], malayalamPhrases[1], `✨ AI Explanations`];
    descriptionText = `Prepare smarter for Kerala PSC exams with our complete digital coaching suite in ${location}. Get subject-wise study material, daily current affairs, leaderboards, and detailed analytics. Experience the flexibility of studying anywhere in ${location} at a fraction of the cost of offline coaching centers.`;
    detailTitle = `Structured Online Syllabus & Prep Strategy`;
  } else if (type === 'exam-generic' && exam) {
    pageTitle = `Kerala PSC ${exam.name} Mock Test — Free Online Practice`;
    pageSubtitle = `Access the official Kerala PSC ${exam.name} mock tests, exam patterns, subject weightages, and detailed explanations. Study for LDC and LGS exams free.`;
    badges = [malayalamPhrases[3], 'വിജയിക്കാനുള്ള സ്മാർട്ട് മാർഗം', `⚡ Timed MCQ Test`];
    descriptionText = `Practice the latest ${exam.formalName} test series online. Access detailed chapter distributions, SCERT-based arithmetic notes, and Kerala Renaissance repeated questions. Challenge yourself with a 100-question timed exam format matching official Kerala Public Service Commission rules.`;
    detailTitle = `${exam.name} Topic Weightage Analysis`;
  } else if (type === 'quiz-generic') {
    pageTitle = `Kerala PSC Daily Smart Quiz — Free Online Practice Questions`;
    pageSubtitle = `Answer high-probability daily quizzes and test your skills with dynamic questions. Instant explanations in Malayalam & English.`;
    badges = [malayalamPhrases[2], 'സൗജന്യ PSC Mock Test', `🔥 Psychology-based Learning`];
    descriptionText = `Boost your memory retention and prepare daily for Kerala PSC LDC, LGS, VEO, and LP/UP teacher exams. Answer questions, check explanation notes, maintain your study streaks, and climb the Kerala rankings. Starts free with no registration required.`;
    detailTitle = `How the KPSC Master Daily Quiz System Works`;
  }

  // FAQs based on page type
  const faqs = [
    {
      q: `Does KPSC Master support aspirants from ${location}?`,
      a: `Yes! KPSC Master is an in-house product of Digital Product Solutions. We serve aspirants in ${location}, Thiruvananthapuram, Kollam, and all other 14 districts of Kerala. We provide online mock tests, daily quizzes, and detailed performance tracking designed to adapt to the local syllabus expectations.`
    },
    {
      q: `Are the questions available in Malayalam and English?`,
      a: `Yes, KPSC Master provides full Malayalam and English support (മലയാളം + English Support) for all mock tests and daily quizzes, including detailed explanation guides for every single answer.`
    },
    {
      q: `Can I see district-wise leaderboards for ${location}?`,
      a: `Absolutely. You can track your study rankings against other aspirants specifically in ${location} and the rest of Thiruvananthapuram/Kerala. This helps you understand where you stand in district-specific recruitment counts.`
    },
    {
      q: `How does KPSC Master compare to traditional offline coaching centers in ${location}?`,
      a: `KPSC Master offers flexible, 24/7 mobile learning with gamified psychology mechanisms (like study streaks), instant AI doubt solving, and a database of 12 Lakh+ daily solved questions, at a fraction of the cost of offline coaching classes in ${location}.`
    }
  ];

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pt: { xs: 4, md: 8 }, pb: 10 }}>
      <Container maxWidth="lg">
        {/* Breadcrumb Navigation */}
        <Box sx={{ mb: 4, display: 'flex', gap: 1, alignItems: 'center' }}>
          <Link href="/" style={{ color: '#2E8B57', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 700 }}>
            Home
          </Link>
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>&gt;</Typography>
          {locationKey !== 'kerala' && (
            <>
              <Link href={`/psc-coaching-${locationKey}`} style={{ color: '#2E8B57', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 700 }}>
                {location}
              </Link>
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>&gt;</Typography>
            </>
          )}
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            {exam ? exam.name : 'Coaching'}
          </Typography>
        </Box>

        {/* ===== HERO SECTION ===== */}
        <Paper
          sx={{
            p: { xs: 4, md: 6 },
            borderRadius: '28px',
            background: 'linear-gradient(135deg, rgba(27, 107, 58, 0.1) 0%, rgba(22, 27, 34, 0.4) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            mb: 6,
          }}
        >
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 8 }}>
              <Stack spacing={2.5}>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                  {badges.map((b, idx) => (
                    <Chip
                      key={idx}
                      label={b}
                      sx={{
                        background: idx === 0 ? 'rgba(27,107,58,0.12)' : idx === 1 ? 'rgba(124,58,237,0.12)' : 'rgba(245,158,11,0.12)',
                        border: '1px solid',
                        borderColor: idx === 0 ? 'rgba(46,139,87,0.25)' : idx === 1 ? 'rgba(124,58,237,0.25)' : 'rgba(245,158,11,0.25)',
                        color: idx === 0 ? '#2E8B57' : idx === 1 ? '#8B5CF6' : '#F59E0B',
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        height: 30,
                      }}
                    />
                  ))}
                </Stack>
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '1.8rem', sm: '2.4rem', md: '3.2rem' },
                    fontWeight: 900,
                    lineHeight: 1.15,
                    color: 'text.primary',
                  }}
                >
                  {pageTitle}
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6, fontSize: '1.025rem', maxWidth: 680 }}>
                  {pageSubtitle}
                </Typography>

                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.65, fontSize: '0.9rem', pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                  {descriptionText}
                </Typography>

                <Stack direction="row" spacing={3} sx={{ pt: 1, flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2" sx={{ color: '#2E8B57', fontWeight: 800 }}>⚡ 47,000+ Aspirants</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2" sx={{ color: '#8B5CF6', fontWeight: 800 }}>📝 12 Lakh+ Solved Daily</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2" sx={{ color: '#F59E0B', fontWeight: 800 }}>🏆 140+ Coaching Institutes</Typography>
                  </Box>
                </Stack>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: { md: 'right' } }}>
              <Button
                variant="contained"
                onClick={() => router.push('/register')}
                sx={{
                  py: 2,
                  px: 4,
                  width: { xs: '100%', md: 'auto' },
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #1B6B3A, #2E8B57)',
                  fontWeight: 800,
                  boxShadow: '0 8px 32px rgba(27,107,58,0.25)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1B6B3A, #2E8B57)',
                    filter: 'brightness(1.1)',
                  }
                }}
              >
                Start Free Preparation
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* ===== DETAILED CONTENT SECTION ===== */}
        <Grid container spacing={4} sx={{ mb: 8 }}>
          {/* Left Column */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack spacing={4}>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 900, mb: 2, fontSize: '1.6rem' }}>
                  {detailTitle}
                </Typography>

                {/* Render Exam Specific Weightages */}
                {exam ? (
                  <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: '16px', bgcolor: 'background.paper' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.6 }}>
                      Mastering the subject weightage distribution is the first step to cracking the {exam.name} exam. Here is the official Kerala PSC marks distribution:
                    </Typography>
                    <Stack spacing={2.5}>
                      {getSubjectWeightages(exam.name).map((sub, idx) => (
                        <Box key={idx}>
                          <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{sub.subject}</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: '#2E8B57' }}>{sub.weight}%</Typography>
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
                    <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                      <Link href={`/exams/${examKey || 'ldc'}`} style={{ textDecoration: 'none' }}>
                        <Button variant="outlined" size="small" sx={{ fontWeight: 700, borderRadius: '8px' }}>
                          Start {exam.name} Mock Test
                        </Button>
                      </Link>
                      <Link href="/exams" style={{ textDecoration: 'none' }}>
                        <Button variant="text" size="small" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                          Browse All Exams
                        </Button>
                      </Link>
                    </Box>
                  </Paper>
                ) : (
                  // Default Mock Exams Lists for locations without specific exam
                  <Stack spacing={2.5}>
                    {[
                      { name: 'LDC Mock Test Series', key: 'ldc', desc: '100 Questions, 75 Mins. Standard LDC syllabus.' },
                      { name: 'LGS Mock Test Series', key: 'lgs', desc: '100 Questions, 75 Mins. Standard LGS syllabus.' },
                      { name: 'Degree Level Mock Tests', key: 'degree-level', desc: '100 Questions, 75 Mins. For Secretariat Assistant and University Assistant exams.' }
                    ].map((m) => (
                      <Paper key={m.key} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                        <Box>
                          <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: 'text.primary' }}>{m.name}</Typography>
                          <Typography sx={{ color: 'text.secondary', fontSize: '0.825rem', mt: 0.5 }}>{m.desc}</Typography>
                        </Box>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => router.push(`/exams/${m.key}`)}
                          sx={{ borderRadius: '8px', fontWeight: 700 }}
                        >
                          Start Test
                        </Button>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </Box>

              {/* Subject-Wise Preparation Strategy */}
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 900, mb: 2, fontSize: '1.6rem' }}>
                  E-E-A-T Recommended Preparation Strategy
                </Typography>
                <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: '16px' }}>
                  <Stack spacing={3.5}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'rgba(46,139,87,0.1)', color: '#2E8B57', width: 40, height: 40 }}>1</Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: 'text.primary', mb: 0.5 }}>Focus on SCERT Textbook Chapters</Typography>
                        <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem', lineHeight: 1.6 }}>
                          Over 65% of Kerala PSC arithmetic and general science questions are derived directly from state SCERT school textbooks. Dedicate time daily to standard 5th to 10th-grade chapters.
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'rgba(139,92,246,0.1)', color: '#8B5CF6', width: 40, height: 40 }}>2</Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: 'text.primary', mb: 0.5 }}>Analyze Repeated Previous Year Questions</Typography>
                        <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem', lineHeight: 1.6 }}>
                          Kerala PSC frequently repeats questions in Kerala History, Renaissance, and Geography. Solving previous paper codes under timed mock settings will significantly increase score thresholds.
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'rgba(245,158,11,0.1)', color: '#F59E0B', width: 40, height: 40 }}>3</Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: 'text.primary', mb: 0.5 }}>Daily Study Streak & Review Engine</Typography>
                        <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem', lineHeight: 1.6 }}>
                          Cracking competitive Kerala Government exams requires consistency. KPSC Master's psychological streak mechanic ensures you solve at least 5 questions daily to keep your streak alive and retain facts.
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>
                </Paper>
              </Box>
            </Stack>
          </Grid>

          {/* Right Column */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Stack spacing={4}>
              {/* Comparison Table */}
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 900, mb: 2, fontSize: '1.6rem' }}>
                  KPSC Master vs Offline Coaching
                </Typography>
                <TableContainer component={Paper} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '16px', overflow: 'hidden' }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: 'rgba(27,107,58,0.06)' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800, py: 1.5 }}>Feature</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#2E8B57', py: 1.5 }}>KPSC Master</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: 'text.secondary', py: 1.5 }}>Offline Center</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {[
                        { f: 'Daily Tests', k: 'Unlimited, Free', o: 'Weekly' },
                        { f: 'AI Doubt Solver', k: '24/7 Malayalam', o: 'Limited teachers' },
                        { f: 'Leaderboard', k: 'Live district ranks', o: 'Classroom only' },
                        { f: 'Syllabus Coverage', k: 'Adaptive & SCERT', o: 'Fixed speed lectures' },
                        { f: 'Pricing', k: 'Affordable / Free tier', o: '₹15,000 - ₹30,000' }
                      ].map((row, idx) => (
                        <TableRow key={idx}>
                          <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem', py: 1.5 }}>{row.f}</TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', color: '#2E8B57', fontWeight: 600, py: 1.5 }}>{row.k}</TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary', py: 1.5 }}>{row.o}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {/* Coaching Institutes Callout */}
              <Box>
                <Paper
                  sx={{
                    p: 4,
                    background: 'linear-gradient(135deg, rgba(27,107,58,0.1) 0%, rgba(37,99,235,0.05) 100%)',
                    border: '1px solid rgba(46,139,87,0.2)',
                    borderRadius: '20px',
                    textAlign: 'center'
                  }}
                >
                  <SchoolIcon sx={{ fontSize: 32, color: '#2E8B57', mb: 1 }} />
                  <Typography sx={{ fontWeight: 900, mb: 1, fontSize: '1.15rem' }}>Coaching Institute Owner in {location}?</Typography>
                  <Typography sx={{ color: 'text.secondary', fontSize: '0.825rem', mb: 3.5, lineHeight: 1.6 }}>
                    Join 140+ coaching centers across Kerala. Manage student syllabuses, set custom mock tests, track study streaks, and launch branded portal app pages.
                  </Typography>
                  <Link href="/institute/login" style={{ textDecoration: 'none' }}>
                    <Button variant="contained" size="small" sx={{ background: 'linear-gradient(135deg, #1B6B3A, #2E8B57)', borderRadius: '8px', fontWeight: 700 }}>
                      Access Institute Portal
                    </Button>
                  </Link>
                </Paper>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        {/* ===== FAQs ACCORDION ===== */}
        <Box sx={{ mb: 8 }}>
          <Typography
            variant="h2"
            sx={{
              fontFamily: "'Cabinet Grotesk'",
              fontWeight: 900,
              textAlign: 'center',
              color: 'text.primary',
              mb: 1.5,
              fontSize: { xs: '1.65rem', sm: '2rem', md: '2.5rem' },
              letterSpacing: '-0.02em',
            }}
          >
            Frequently Asked{" "}
            <Box component="span" sx={{ color: '#2E8B57' }}>
              Questions
            </Box>
          </Typography>
          <Typography sx={{ textAlign: 'center', color: 'text.secondary', mb: 6, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
            Get direct answers to common queries for candidates in {location} (കേരള സർക്കാർ ജോലി).
          </Typography>

          <Stack spacing={2.5} sx={{ maxWidth: '800px', mx: 'auto' }}>
            {faqs.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <Box
                  key={idx}
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  sx={{
                    p: 3,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: isOpen ? 'rgba(46,139,87,0.35)' : 'divider',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    '&:hover': {
                      borderColor: 'rgba(46,139,87,0.5)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                    },
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: isOpen ? '#2E8B57' : 'text.primary', transition: 'color 0.2s' }}>
                      {item.q}
                    </Typography>
                    <Typography sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '1.2rem', ml: 2 }}>
                      {isOpen ? '−' : '+'}
                    </Typography>
                  </Stack>
                  {isOpen && (
                    <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                      <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem', lineHeight: 1.65 }}>
                        {item.a}
                      </Typography>
                    </Box>
                  )}
                </Box>
              );
            })}
          </Stack>
        </Box>

        {/* Dynamic Internal Linking Hub */}
        <Paper sx={{ p: 4, border: '1px solid', borderColor: 'divider', borderRadius: '24px', textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 900, mb: 1.5, fontSize: '1.25rem' }}>Explore KPSC Master Resources</Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: '0.825rem', mb: 3 }}>
            Trusted by Kerala PSC aspirants in Attingal, Thiruvananthapuram, Kollam, and across Kerala.
          </Typography>
          <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'center', flexWrap: 'wrap', gap: 1.5 }} useFlexGap>
            <Link href="/kerala-psc-ldc-online-test" style={{ textDecoration: 'none' }}>
              <Chip label="LDC Online Test" clickable sx={{ fontWeight: 700 }} />
            </Link>
            <Link href="/kerala-psc-lgs-online-test" style={{ textDecoration: 'none' }}>
              <Chip label="LGS Online Test" clickable sx={{ fontWeight: 700 }} />
            </Link>
            <Link href="/kerala-psc-degree-level-online-test" style={{ textDecoration: 'none' }}>
              <Chip label="Degree Level Test" clickable sx={{ fontWeight: 700 }} />
            </Link>
            <Link href="/kerala-psc-current-affairs" style={{ textDecoration: 'none' }}>
              <Chip label="Current Affairs" clickable sx={{ fontWeight: 700 }} />
            </Link>
            <Link href="/kerala-psc-daily-quiz" style={{ textDecoration: 'none' }}>
              <Chip label="Daily Quiz" clickable sx={{ fontWeight: 700 }} />
            </Link>
            <Link href="/blog" style={{ textDecoration: 'none' }}>
              <Chip label="Our Blog" clickable sx={{ fontWeight: 700 }} />
            </Link>
            <Link href="/contact" style={{ textDecoration: 'none' }}>
              <Chip label="Contact Support" clickable sx={{ fontWeight: 700 }} />
            </Link>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
