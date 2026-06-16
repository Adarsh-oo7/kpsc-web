'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Box, Typography, Button, Container, Grid, Chip, Stack, Avatar, CircularProgress, TextField } from '@mui/material';
import { motion } from 'framer-motion';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useAppContext } from '@/context/AppContext';

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
  { emoji: '📚', title: 'Daily Quiz', desc: 'Psychology-driven questions that keep you coming back', color: '#1B6B3A' },
  { emoji: '📝', title: 'Mock Tests', desc: 'Full-length LDC, LGS, Degree Level exams with timer', color: '#7C3AED' },
  { emoji: '📰', title: 'Current Affairs', desc: 'PSC-probability tagged daily news with MCQ injection', color: '#2563EB' },
  { emoji: '🤖', title: 'AI Explanations', desc: 'Malayalam + English AI explanations for every answer', color: '#DC2626' },
  { emoji: '🏆', title: 'Leaderboard', desc: 'District & Kerala rankings — your position always visible', color: '#D97706' },
  { emoji: '⚡', title: 'Study Feed', desc: 'Instagram-like feed of questions, facts & current affairs', color: '#0891B2' },
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
        }}
      >
        {/* Background effects */}
        <Box sx={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 60% 50% at 50% 20%, rgba(27,107,58,0.18) 0%, transparent 70%)',
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
          position: 'absolute', right: '-5%', top: '50%', transform: 'translateY(-50%)',
          opacity: 0.04, fontSize: '18rem', lineHeight: 1,
          pointerEvents: 'none', display: { xs: 'none', lg: 'block' }
        }}>
          🗺️
        </Box>

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, mb: { xs: 3, md: 4 } }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Badge */}
            <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' }, mb: 3 }}>
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
                fontSize: { xs: '2.1rem', sm: '3.2rem', md: '4.2rem' },
                color: 'text.primary',
                lineHeight: { xs: 1.15, sm: 1.05 },
                letterSpacing: '-0.03em',
                textAlign: { xs: 'center', md: 'left' },
                mb: 2.5,
              }}
            >
              Kerala PSC Topper
              <Box component="span" sx={{ display: 'block', color: '#2E8B57' }}>
                in Your Pocket
              </Box>
            </Typography>

            {/* Sub-headline */}
            <Typography sx={{
              fontSize: { xs: '0.925rem', sm: '1.05rem', md: '1.2rem' },
              color: 'text.secondary',
              maxWidth: 520,
              lineHeight: 1.6,
              textAlign: { xs: 'center', md: 'left' },
              mx: { xs: 'auto', md: 0 },
              mb: 4.5,
            }}>
              Daily quiz, mock tests, current affairs, and AI doubt solving — free to start. Used by 47,000+ aspirants across Kerala.
            </Typography>

            {/* CTAs */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ 
                justifyContent: { xs: 'center', md: 'flex-start' }, 
                alignItems: 'center',
                mb: 5,
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => router.push('/register')}
                  endIcon={<ArrowForwardIcon />}
                  fullWidth
                  sx={{
                    py: 1.6, px: 4, fontSize: '0.95rem',
                    background: 'linear-gradient(135deg, #1B6B3A, #2E8B57)',
                    boxShadow: '0 8px 32px rgba(27,107,58,0.35)',
                    borderRadius: 3
                  }}
                >
                  Start Free — No Signup
                </Button>
              </Box>
              <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => router.push('/institute/login')}
                  fullWidth
                  sx={{ py: 1.6, px: 4, fontSize: '0.95rem', borderRadius: 3 }}
                >
                  Join as Institute
                </Button>
              </Box>
            </Stack>

            {/* Responsive Social Proof Counter Strip */}
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr 1fr 1fr', sm: '1fr auto 1fr auto 1fr' },
              gap: { xs: 1.5, sm: 3 },
              alignItems: 'center',
              justifyContent: 'center',
              p: { xs: 2, sm: 3 }, 
              borderRadius: '20px',
              bgcolor: 'surface.card',
              border: '1px solid',
              borderColor: 'divider',
              maxWidth: 520,
              width: '100%',
              mx: { xs: 'auto', md: 0 },
            }}>
              <StatCounter end="47,000+" label="Students" />
              <Box sx={{ display: { xs: 'none', sm: 'block' }, width: '1px', height: '32px', bgcolor: 'divider' }} />
              <StatCounter end="140+" label="Institutes" />
              <Box sx={{ display: { xs: 'none', sm: 'block' }, width: '1px', height: '32px', bgcolor: 'divider' }} />
              <StatCounter end="12 Lakh" label="Solved today" />
            </Box>
          </motion.div>
        </Container>

        {/* Live ticker */}
        <Box sx={{ width: '100%', minWidth: 0, overflow: 'hidden' }}>
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
                <Box sx={{
                  p: 3.5, 
                  height: '100%',
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    border: `1px solid ${f.color}40`,
                    boxShadow: `0 12px 36px ${f.color}15`,
                  }
                }}>
                  <Typography sx={{ fontSize: '2rem', mb: 2 }}>{f.emoji}</Typography>
                  <Typography sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 800, fontSize: '1.15rem', color: 'text.primary', mb: 1 }}>
                    {f.title}
                  </Typography>
                  <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary', lineHeight: 1.6 }}>
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
            <Typography sx={{ fontSize: '2rem', mb: 1.5 }}>🏫</Typography>
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
        <Typography variant="h2" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 900, textAlign: 'center', color: 'text.primary', mb: 6, fontSize: { xs: '1.65rem', sm: '2rem', md: '2.5rem' }, letterSpacing: '-0.02em' }}>
          Real Students, Real Results
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
                    <Box sx={{ width: 40, height: 40, bgcolor: 'rgba(27,107,58,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2E8B57' }}>
                      ✉️
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 600 }}>Email Support</Typography>
                      <Typography sx={{ fontSize: '0.9rem', color: 'text.primary', fontWeight: 700 }}>support@kpscmaster.com</Typography>
                    </Box>
                  </Box>
 
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ width: 40, height: 40, bgcolor: 'rgba(27,107,58,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2E8B57' }}>
                      📞
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 600 }}>Call Us</Typography>
                      <Typography sx={{ fontSize: '0.9rem', color: 'text.primary', fontWeight: 700 }}>+91 98765 43210</Typography>
                    </Box>
                  </Box>
 
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ width: 40, height: 40, bgcolor: 'rgba(27,107,58,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2E8B57' }}>
                      📍
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
              <Image src="/logo.png" alt="KPSC Master Logo" width={24} height={24} style={{ objectFit: 'contain' }} />
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