'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Box, Typography, Button, Container, Grid, Chip, Stack, Avatar, CircularProgress, TextField } from '@mui/material';
import { motion } from 'framer-motion';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useAppContext } from '@/context/AppContext';
import { useTheme, useMediaQuery } from '@mui/material';
import QuizIcon from '@mui/icons-material/Quiz';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PublicIcon from '@mui/icons-material/Public';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import DynamicFeedIcon from '@mui/icons-material/DynamicFeed';
import SchoolIcon from '@mui/icons-material/School';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';

// Ticker messages
const tickerMessages = [
  '🔥 Rahul from Thrissur answered 15 questions today',
  '⚡ Streak 23 days — Nisha from Kozhikode',
  '🏆 Amal just completed LDC Mock Test — Score 91/100',
  '📚 Priya answered 47 questions today as a Pro user',
  '🎯 Sanjay joined from Ernakulam — Day 1 streak started',
  '⭐ Meera achieved Subject Master badge in Kerala History',
  '🔥 Streak 45 days — Vishnu from Palakkad',
];

const features = [
  {
    icon: <QuizIcon />,
    title: 'Daily Smart Quiz',
    desc: 'Addictive psychology-based questions that boost retention daily',
    color: '#16A34A',
  },
  {
    icon: <AssignmentIcon />,
    title: 'Real Exam Mock Tests',
    desc: 'Timed LDC, LGS & Degree-level exams with real pressure simulation',
    color: '#7C3AED',
  },
  {
    icon: <PublicIcon />,
    title: 'PSC Current Affairs',
    desc: 'High-probability news with MCQs curated for Kerala PSC',
    color: '#2563EB',
  },
  {
    icon: <SmartToyIcon />,
    title: 'AI-Powered Explanations',
    desc: 'Clear Malayalam + English explanations for every answer',
    color: '#DC2626',
  },
  {
    icon: <EmojiEventsIcon />,
    title: 'Live Leaderboard',
    desc: 'Compete with district & Kerala rankings in real-time',
    color: '#F59E0B',
  },
  {
    icon: <DynamicFeedIcon />,
    title: 'Smart Study Feed',
    desc: 'Scrollable feed of questions, facts & daily updates',
    color: '#06B6D4',
  },
];

const exams = ['LDC', 'LGS', 'Degree Level', 'VEO', 'LD Typist', 'LP/UP Teacher', 'Police Constable', 'Fire & Rescue', 'PSC Secretariat', 'KPSC Clerk', 'Company Board', 'Water Authority'];

const testimonials = [
  { name: 'Rahul Krishnan', place: 'Thrissur', rank: '#1 LDC 2025', text: 'KPSC Master\'s daily quiz kept me on track for 6 months. The streak mechanic genuinely worked — I couldn\'t let go of my 90-day streak!', avatar: 'R' },
  { name: 'Priya Menon', place: 'Kozhikode', rank: 'Qualified LGS', text: 'The AI Malayalam explanations are a game-changer. Understood every concept without needing a tutor. Scored 87/100 in my mock test.', avatar: 'P' },
  { name: 'Amal Thomas', place: 'Ernakulam', rank: 'District Topper', text: 'The leaderboard kept me competitive. When I saw I was #47, I studied 3 more hours to reach #40. This app understands psychology.', avatar: 'A' },
];

// GPU-accelerated CSS Marquee for high performance and smooth animation
const tickerStyles = `
  @keyframes tickerMarquee {
    0% { transform: translate3d(0, 0, 0); }
    100% { transform: translate3d(-50%, 0, 0); }
  }
  .ticker-strip-container {
    width: 100%;
    max-width: 100vw;
    overflow: hidden;
    white-space: nowrap;
    padding: 14px 0;
    background: rgba(27, 107, 58, 0.08);
    border-top: 1px solid rgba(27,107,58,0.15);
    border-bottom: 1px solid rgba(27,107,58,0.15);
  }
  .ticker-strip-wrapper {
    display: inline-block;
    animation: tickerMarquee 28s linear infinite;
    will-change: transform;
  }
  .ticker-strip-item {
    display: inline-block;
    padding: 0 32px;
    font-size: 0.825rem;
    font-family: 'Satoshi', sans-serif;
    font-weight: 600;
    color: #8892A4;
  }
`;

function TickerStrip() {
  return (
    <Box className="ticker-strip-container">
      <style dangerouslySetInnerHTML={{ __html: tickerStyles }} />
      <Box className="ticker-strip-wrapper">
        {tickerMessages.map((msg, i) => (
          <span key={i} className="ticker-strip-item">
            {msg}
          </span>
        ))}
        {/* Double messages to enable seamless wrapping */}
        {tickerMessages.map((msg, i) => (
          <span key={`dup-${i}`} className="ticker-strip-item">
            {msg}
          </span>
        ))}
      </Box>
    </Box>
  );
}

function StatCounter({ end, label }: { end: string; label: string }) {
  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography sx={{
        fontFamily: "'Cabinet Grotesk', sans-serif",
        fontSize: { xs: '1.4rem', sm: '1.6rem', md: '2.1rem' },
        fontWeight: 900,
        color: 'text.primary',
        lineHeight: 1,
      }}>
        {end}
      </Typography>
      <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mt: 0.5, fontWeight: 600 }}>
        {label}
      </Typography>
    </Box>
  );
}

export default function PublicHomePage() {

  const { user } = useAppContext();
  const router = useRouter();

  const theme = useTheme();
  const hideImage = useMediaQuery('(min-width:767px) and (max-width:1024px)');

  // Logged in users get redirected automatically to their dashboard
  useEffect(() => {
    if (user) {
      router.replace('/home');
    }
  }, [user, router]);

  if (user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', bgcolor: 'background.default' }}>
        <CircularProgress sx={{ color: '#2E8B57' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', overflow: 'hidden' }}>
      {/* ===== HERO ===== */}
      <Box
        sx={{
          position: 'relative',
          minHeight: { xs: 'auto', md: '80vh' },
          pt: { xs: 3, md: 4 },
          pb: { xs: 4, md: 6 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          overflow: 'hidden',
          backgroundImage: `
    radial-gradient(circle, rgba(46,139,88,0.12) 2px, transparent 1px)
  `,
          backgroundSize: '70px 70px', // 👈 controls spacing (grid size)
        }}
      >
        {/* Background effects */}
        <Box sx={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 90% 80% at 70% 20%, rgba(27,107,58,0.25) 0%, transparent 50%)',
          pointerEvents: 'none',
        }} />
        <Box sx={{
          position: 'absolute', top: '10%', right: '5%',
          width: 300, height: 300, borderRadius: '50%',
          background: 'rgba(27,107,58,0.05)',
          filter: 'blur(45px)',
          pointerEvents: 'none',
        }} />

        {/* Kerala map SVG outline (subtle) */}
        <Box sx={{
          position: 'absolute', right: '10%', top: '40%', transform: 'translateY(-50%)',
          opacity: 0.04, fontSize: '18rem', lineHeight: 1,
          pointerEvents: 'none', display: { xs: 'none', lg: 'block' }
        }}>
          🗺️
        </Box>

        <Box sx={{ width: '100%', px: { xs: 2, md: 6 }, position: 'relative', zIndex: 1 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: 'center',
              justifyContent: 'space-between', // 👈 KEY
              width: '100%',
              gap: { xs: 4, md: 6 },
            }}
          >
            <Box sx={{
              flex: 1, maxWidth: 600, mx: { xs: 'auto', md: 'auto', lg: 0 }, // 👈 THIS is the fix
              textAlign: { xs: 'center', md: 'center', lg: 'left' },
            }}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Badge */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: { xs: 'center', md: 'center', lg: 'flex-start' },
                    mb: 3
                  }}
                >
                  <Chip
                    label="🇮🇳 #1 Kerala PSC Platform"
                    sx={{
                      background: 'rgba(27,107,58,0.12)',
                      border: '1px solid rgba(46,139,87,0.25)',
                      color: '#2E8B57',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      height: 32,
                    }}
                  />
                </Box>

                {/* Headline */}
                <Typography
                  component="h1"
                  sx={{
                    fontFamily: "'Cabinet Grotesk', sans-serif",
                    fontWeight: 900,

                    // 🔥 Fluid typography instead of breakpoint jumps
                    fontSize: "clamp(1.8rem, 4vw, 4.2rem)",

                    color: 'text.primary',
                    lineHeight: { xs: 1.2, sm: 1.1, md: 1.05 },
                    letterSpacing: '-0.03em',

                    mb: { xs: 2, sm: 2.5, md: 3 },

                    textAlign: { xs: 'center', md: 'center', lg: 'left' },
                    px: { xs: 1, sm: 0 }, // 👈 prevents text touching edges on small screens
                  }}
                >
                  Kerala PSC Topper

                  <Box
                    component="span"
                    sx={{
                      display: 'block',
                      color: '#2E8B57',
                      fontSize: "clamp(1.8rem, 4vw, 4.2rem)", // 👈 match scaling
                    }}
                  >
                    in Your Pocket
                  </Box>
                </Typography>

                {/* Sub-headline */}
                <Typography
                  sx={{
                    fontSize: "clamp(0.9rem, 1.2vw, 1.2rem)", // 🔥 fluid scaling
                    color: 'text.secondary',

                    maxWidth: { xs: '100%', sm: 520 },
                    lineHeight: 1.6,

                    textAlign: { xs: 'center', md: 'center', lg: 'left' },
                    mx: { xs: 'auto', lg: 0 },

                    px: { xs: 1.5, sm: 0 }, // 👈 padding for small devices
                    mb: { xs: 3, sm: 4, md: 4.5 },
                  }}
                >
                  Daily quiz, mock tests, current affairs, and AI doubt solving — free to start. Used by 47,000+ aspirants across Kerala.
                </Typography>

                {/* CTAs */}
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={{ xs: 1.5, sm: 2 }}
                  sx={{
                    justifyContent: { xs: 'center', md: 'center', lg: 'flex-start' },
                    alignItems: 'stretch', // 👈 important for equal button height
                    mb: { xs: 4, md: 5 },
                    width: '100%',
                    maxWidth: 500, // 👈 keeps it neat on large screens
                    mx: { xs: 'auto', lg: 0 }, // 👈 center on mobile
                  }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => router.push('/register')}
                    endIcon={<ArrowForwardIcon />}
                    fullWidth
                    sx={{
                      flex: 1, // 👈 equal width in row layout

                      py: { xs: 1.4, sm: 1.6 },
                      px: { xs: 2.5, sm: 4 },

                      fontSize: "clamp(0.85rem, 1vw, 0.95rem)",

                      background: 'linear-gradient(135deg, #1B6B3A, #2E8B57)',
                      boxShadow: '0 8px 32px rgba(27,107,58,0.35)',
                      borderRadius: 3,

                      whiteSpace: 'nowrap', // 👈 prevents breaking
                    }}
                  >
                    Start Free — No Signup
                  </Button>

                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => router.push('/institute/login')}
                    fullWidth
                    sx={{
                      flex: 1,

                      py: { xs: 1.4, sm: 1.6 },
                      px: { xs: 2.5, sm: 4 },

                      fontSize: "clamp(0.85rem, 1vw, 0.95rem)",

                      borderRadius: 3,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Join as Institute
                  </Button>
                </Stack>

                {/* Responsive Social Proof Counter Strip */}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },

                    alignItems: 'center',
                    justifyContent: 'space-between',

                    gap: { xs: 2, sm: 0 },

                    p: { xs: 2, sm: 3 },

                    borderRadius: '20px',
                    bgcolor: 'surface.card',
                    border: '1px solid',
                    borderColor: 'divider',

                    maxWidth: 520,
                    width: '100%',
                    mx: 'auto',
                  }}
                >
                  <StatCounter end="47,000+" label="Students" />
                  <StatCounter end="140+" label="Institutes" />
                  <StatCounter end="12 Lakh" label="Solved today" />
                </Box>
              </motion.div>
            </Box>
            <Box
              sx={{
                flex: 1,
                display: hideImage ? 'none' : 'flex',
                justifyContent: { xs: 'center', md: 'flex-end' },
                order: { xs: -1, md: 0 },

              }}
            >
              <Box
                component="img"
                src="/hero-light.png"
                alt="Hero"
                sx={{
                  width: '100%',
                  maxWidth: '600px',
                  height: 'auto',
                  objectFit: 'contain',
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Live ticker */}
        <Box
          sx={{
            width: '100%',
            minWidth: 0,
            overflow: 'hidden',
            mt: 3, // 👈 THIS FIXES THE GAP
          }}
        >
          <TickerStrip />
        </Box>
      </Box>

      {/* ===== FEATURES GRID ===== */}
      <Container id="features" maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Typography variant="h2" sx={{
            fontFamily: "'Cabinet Grotesk'",
            fontWeight: 900,
            textAlign: 'center',
            color: 'text.primary',
            mb: 1.5,
            fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.8rem' },
            letterSpacing: '-0.02em'
          }}>
            Everything You Need to
            <Box component="span" sx={{ color: '#2E8B57' }}> Top PSC</Box>
          </Typography>
          <Typography sx={{ textAlign: 'center', color: 'text.secondary', mb: 6, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
            One platform. All tools. Zero excuses.
          </Typography>
        </motion.div>

        <Grid container spacing={3}>
          {features.map((f, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={f.title}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                whileHover={{ y: -6 }}
                style={{ height: '100%' }}
              >

                <Box
                  sx={{
                    p: 4,
                    height: '100%',
                    borderRadius: '24px',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',

                    // 🌈 Premium glass base
                    backdropFilter: 'blur(14px)',
                    WebkitBackdropFilter: 'blur(14px)',
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? `${f.color}15`
                        : `${f.color}08`,

                    borderColor: `${f.color}30`,
                    border: '1px solid',

                    transition: 'all 0.45s cubic-bezier(0.22, 1, 0.36, 1)',

                    // 🌟 soft gradient shine
                    backgroundImage: `
      linear-gradient(135deg, rgba(255,255,255,0.06), transparent 60%)
    `,

                    // ✨ glow aura
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '24px',
                      background: `radial-gradient(circle at 80% 0%, ${f.color}25, transparent 70%)`,
                      opacity: 0,
                      transition: 'opacity 0.5s ease',
                    },

                    // ✨ inner light
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '24px',
                      background:
                        'radial-gradient(circle at 20% 10%, rgba(255,255,255,0.10), transparent 60%)',
                      pointerEvents: 'none',
                    },

                    '&:hover::before': {
                      opacity: 1,
                    },

                    // 🚀 premium hover
                    '&:hover': {
                      transform: 'translateY(-12px) scale(1.02)',
                      borderColor: `${f.color}55`,
                      boxShadow: `
        0 15px 40px rgba(0,0,0,0.12),
        0 25px 80px ${f.color}30
      `,
                    },
                  }}
                >
                  {/* 🔥 PREMIUM ICON CONTAINER */}
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2.5,

                      // gradient icon bg
                      background: `linear-gradient(135deg, ${f.color}, ${f.color}80)`,

                      color: '#fff',

                      boxShadow: `
        0 8px 20px ${f.color}40,
        inset 0 1px 0 rgba(255,255,255,0.3)
      `,

                      transition: 'all 0.4s ease',
                    }}
                  >
                    {f.icon || <AutoAwesomeIcon sx={{ fontSize: 30 }} />}
                  </Box>

                  {/* 🧠 TITLE */}
                  <Typography
                    sx={{
                      fontFamily: "'Cabinet Grotesk'",
                      fontWeight: 800,
                      fontSize: '1.2rem',
                      color: 'text.primary',
                      mb: 1.2,
                      letterSpacing: '-0.2px',
                    }}
                  >
                    {f.title}
                  </Typography>

                  {/* ✍️ DESCRIPTION */}
                  <Typography
                    sx={{
                      fontSize: '0.9rem',
                      color: 'text.secondary',
                      lineHeight: 1.7,
                    }}
                  >
                    {f.desc}
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ===== EXAMS COVERED ===== */}
      <Box id="exams" sx={{ py: { xs: 6, md: 8 }, borderTop: '1px solid', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Typography sx={{ textAlign: 'center', color: 'text.secondary', mb: 4, fontSize: '0.8rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 800 }}>
            Exams Covered
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25, justifyContent: 'center' }}>
            {exams.map(exam => (
              <Chip
                key={exam}
                label={exam}
                sx={{
                  bgcolor: 'surface.card',
                  border: '1px solid',
                  borderColor: 'divider',
                  color: 'text.secondary',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  py: 2,
                  px: 0.5,
                  '&:hover': { background: 'rgba(27,107,58,0.12)', borderColor: 'rgba(46,139,87,0.3)', color: '#2E8B57', transform: 'translateY(-1px)' },
                  transition: 'all 0.2s ease',
                }}
              />
            ))}
          </Box>
        </Container>
      </Box>

      {/* ===== INSTITUTE CTA ===== */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Box sx={{
            p: { xs: 4, md: 6 },
            background: 'linear-gradient(135deg, rgba(27,107,58,0.15), rgba(27,107,58,0.05))',
            border: '1px solid rgba(46,139,87,0.22)',
            borderRadius: '28px',
            textAlign: 'center',
            maxWidth: '100%',
          }}>
            <Typography sx={{ mb: 1.5 }}>
              <SchoolIcon sx={{ fontSize: 34, color: '#1B6B3A' }} />
            </Typography>
            <Typography variant="h3" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 900, color: 'text.primary', mb: 1, fontSize: { xs: '1.4rem', sm: '1.8rem', md: '2.2rem' } }}>
              Running a Coaching Center?
            </Typography>
            <Typography sx={{ color: 'text.secondary', mb: 4, maxWidth: 480, mx: 'auto', fontSize: '0.9rem', lineHeight: 1.7 }}>
              Give your students a world-class app. Custom subdomain, branded portal, attendance, fees, mock tests — all in one.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => router.push('/institute/login')}
              endIcon={<ArrowForwardIcon />}
              sx={{
                background: 'linear-gradient(135deg, #1B6B3A, #2E8B57)',
                py: 1.5,
                px: 4,
                borderRadius: 2.5
              }}
            >
              Start Institute Portal
            </Button>
          </Box>
        </motion.div>
      </Container>

      {/* ===== TESTIMONIALS ===== */}
      <Container id="testimonials" maxWidth="lg" sx={{ pb: { xs: 8, md: 12 } }}>
        <Typography
          variant="h2"
          sx={{
            fontFamily: "'Cabinet Grotesk'",
            fontWeight: 900,
            textAlign: 'center',
            color: 'text.primary',
            mb: 6,
            fontSize: { xs: '1.65rem', sm: '2rem', md: '2.5rem' },
            letterSpacing: '-0.02em',
          }}
        >
          Real Students,{" "}
          <Box component="span" sx={{ color: '#2E8B57' }}>
            Real Results
          </Box>
        </Typography>
        <Grid container spacing={3}>
          {testimonials.map((t, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={t.name}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                style={{ height: '100%' }}
              >
                <Box sx={{
                  p: 4,
                  height: '100%',
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem', lineHeight: 1.7, mb: 3.5, fontStyle: 'italic' }}>
                    "{t.text}"
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
                    <Avatar sx={{ width: 40, height: 40, background: 'linear-gradient(135deg, #1B6B3A, #2E8B57)', fontSize: '0.95rem', fontWeight: 800 }}>
                      {t.avatar}
                    </Avatar>
                    <Box>
                      <Typography sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.85rem' }}>{t.name}</Typography>
                      <Typography sx={{ fontSize: '0.725rem', color: '#2E8B57', fontWeight: 700 }}>{t.place} · {t.rank}</Typography>
                    </Box>
                  </Box>
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ===== CONTACT US ===== */}
      <Container id="contact" maxWidth="lg" sx={{ pb: { xs: 8, md: 12 } }}>
        <Typography variant="h2" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 900, textAlign: 'center', color: 'text.primary', mb: 1.5, fontSize: { xs: '1.65rem', sm: '2rem', md: '2.5rem' }, letterSpacing: '-0.02em' }}>
          Contact Us
        </Typography>
        <Typography sx={{ textAlign: 'center', color: 'text.secondary', mb: 6, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
          Have any questions? Reach out to our support team and we will get back to you.
        </Typography>

        <Grid container spacing={5} sx={{ alignItems: 'stretch' }}>
          {/* Contact Details */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{
              p: 4,
              height: '100%',
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <Box>
                <Typography sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 800, fontSize: '1.25rem', color: 'text.primary', mb: 2 }}>
                  Get In Touch
                </Typography>
                <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem', lineHeight: 1.6, mb: 4 }}>
                  Whether you are a student preparing for exams or an institute looking to use our platform, we're here to support you.
                </Typography>

                <Stack spacing={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: 'rgba(27,107,58,0.1)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#2E8B57',
                      }}
                    >
                      <EmailOutlinedIcon sx={{ fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 600 }}>Email Support</Typography>
                      <Typography sx={{ fontSize: '0.9rem', color: 'text.primary', fontWeight: 700 }}>support@kpscmaster.com</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: 'rgba(27,107,58,0.1)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#2E8B57'
                      }}
                    >
                      <PhoneOutlinedIcon fontSize="small" />
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 600 }}>Call Us</Typography>
                      <Typography sx={{ fontSize: '0.9rem', color: 'text.primary', fontWeight: 700 }}>+91 98765 43210</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: 'rgba(27,107,58,0.1)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#2E8B57'
                      }}
                    >
                      <LocationOnOutlinedIcon fontSize="small" />
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 600 }}>Location</Typography>
                      <Typography sx={{ fontSize: '0.9rem', color: 'text.primary', fontWeight: 700 }}>Kochi, Kerala, India</Typography>
                    </Box>
                  </Box>
                </Stack>
              </Box>

              <Typography sx={{ color: 'text.disabled', fontSize: '0.75rem', mt: 4 }}>
                Response time is typically under 12 hours.
              </Typography>
            </Box>
          </Grid>

          {/* Contact Form */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Box sx={{
              p: 4,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '24px',
            }}>
              <Typography sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 800, fontSize: '1.25rem', color: 'text.primary', mb: 3 }}>
                Send us a Message
              </Typography>
              <form onSubmit={(e) => { e.preventDefault(); alert('Thank you! Your message has been sent successfully. We will contact you soon.'); (e.target as HTMLFormElement).reset(); }}>
                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      required
                      fullWidth
                      label="Your Name"
                      variant="outlined"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      required
                      fullWidth
                      type="email"
                      label="Email Address"
                      variant="outlined"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      required
                      fullWidth
                      label="Subject"
                      variant="outlined"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      required
                      fullWidth
                      multiline
                      rows={4}
                      label="Your Message"
                      variant="outlined"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      sx={{
                        py: 1.5,
                        px: 4,
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #1B6B3A, #2E8B57)',
                        fontWeight: 700
                      }}
                    >
                      Send Message
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* ===== FOOTER ===== */}
      <Box sx={{ borderTop: '1px solid', borderColor: 'divider', py: 5 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Image src="/KPSC MASTER.png" alt="KPSC Master Logo" width={30} height={30} style={{ objectFit: 'contain' }} />
              <Typography sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 900, color: 'text.primary', fontSize: '1.05rem' }}>
                KPSC Master
              </Typography>
            </Box>
            <Typography sx={{ color: 'text.disabled', fontSize: '0.775rem', fontWeight: 500 }}>
              © 2026 KPSC Master. Kerala's #1 PSC Prep Platform.
            </Typography>
            <Stack direction="row" spacing={3.5}>
              {['Privacy', 'Terms', 'Contact'].map(item => (
                <Typography key={item} sx={{ fontSize: '0.775rem', color: 'text.disabled', cursor: 'pointer', '&:hover': { color: 'text.secondary' }, fontWeight: 600 }}>
                  {item}
                </Typography>
              ))}
            </Stack>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}