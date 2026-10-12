'use client';

import Image from 'next/image';
import NextLink from 'next/link';
import {
  Box, Button, Chip, Container, Grid, Link, Paper, Stack, Typography,
} from '@mui/material';
import { motion } from 'framer-motion';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const GREEN = '#1B6B3A';
const GREEN_LIGHT = '#2E8B57';
const DPS_URL = 'https://www.digitalproductsolutions.in/';
const ADARSH_URL = 'https://adarsh.digitalproductsolutions.in/';

const implementedFeatures = [
  { title: 'Daily quizzes', href: '/features', note: 'Short practice sets with explanations in English and Malayalam.' },
  { title: 'Full-length mock tests', href: '/exams', note: 'Timed papers for Kerala PSC exams such as LDC, LGS, Degree Level, and VFA.' },
  { title: 'Current affairs', href: '/current-affairs', note: 'Exam-oriented daily and weekly current affairs with practice questions.' },
  { title: 'Previous papers', href: '/previous-papers', note: 'Past-paper practice from the question bank.' },
  { title: 'Syllabus sections', href: '/topics', note: 'Study by official paper sections and weak areas.' },
  { title: 'Features overview', href: '/features', note: 'Leaderboard, study feed, streaks, and XP after you sign in.' },
  { title: 'Institute directory', href: '/institutes', note: 'Coaching centres can run branded student portals.' },
  { title: 'Support', href: '/contact', note: 'Student and institute contact for the platform team.' },
];

export default function AboutClient() {
  return (
    <Container maxWidth="md" sx={{ pt: { xs: 3, md: 6 }, pb: { xs: 8, md: 10 } }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
        <Chip
          label="About the platform"
          sx={{
            background: 'rgba(27,107,58,0.12)',
            border: '1px solid rgba(46,139,87,0.25)',
            color: GREEN_LIGHT,
            fontWeight: 800,
            fontSize: '0.75rem',
            height: 32,
            mb: 2.5,
          }}
        />
        <Typography
          component="h1"
          sx={{
            fontFamily: "'Cabinet Grotesk', sans-serif",
            fontWeight: 900,
            fontSize: { xs: '2rem', md: '2.8rem' },
            letterSpacing: '-0.03em',
            color: 'text.primary',
            lineHeight: 1.15,
            mb: 2,
          }}
        >
          KPSC Master is a Kerala PSC exam-prep platform
        </Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: '1.05rem', lineHeight: 1.7, mb: 3, maxWidth: 640 }}>
          It helps aspirants practise mock tests, daily quizzes, current affairs, and syllabus sections in English and Malayalam — on the web, from any district in Kerala.
        </Typography>
      </motion.div>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3 },
          mb: 4,
          borderRadius: '20px',
          border: '1.5px solid',
          borderColor: 'divider',
          display: 'flex',
          gap: 2.5,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <Image
          src="/KPSC MASTER.png"
          alt="KPSC Master product mark"
          width={72}
          height={72}
          style={{ objectFit: 'contain' }}
        />
        <Box sx={{ flex: 1, minWidth: 220 }}>
          <Typography component="h2" sx={{ fontWeight: 800, fontSize: '1.15rem', color: 'text.primary', mb: 0.75 }}>
            Who builds it
          </Typography>
          <Typography component="p" sx={{ color: 'text.secondary', lineHeight: 1.65, fontSize: '0.95rem' }}>
            KPSC Master is developed and maintained by{' '}
            <Link href={DPS_URL} target="_blank" rel="noopener noreferrer" sx={{ color: GREEN, fontWeight: 700 }}>
              Digital Product Solutions
            </Link>
            , with development contributions from{' '}
            <Link href={ADARSH_URL} target="_blank" rel="noopener noreferrer" sx={{ color: GREEN, fontWeight: 700 }}>
              Adarsh B S
            </Link>
            . Head office: Attingal, Thiruvananthapuram, Kerala.
          </Typography>
        </Box>
      </Paper>

      <Typography component="h2" sx={{ fontWeight: 800, fontSize: '1.35rem', color: 'text.primary', mb: 1.5 }}>
        Who it is for
      </Typography>
      <Typography sx={{ color: 'text.secondary', lineHeight: 1.7, mb: 4 }}>
        Students preparing for Kerala Public Service Commission exams, and coaching institutes that need a branded portal for batches, questions, and student progress.
      </Typography>

      <Typography component="h2" sx={{ fontWeight: 800, fontSize: '1.35rem', color: 'text.primary', mb: 1.5 }}>
        What you can do here
      </Typography>
      <Typography sx={{ color: 'text.secondary', lineHeight: 1.7, mb: 2 }}>
        These features are part of the live product. Open a page to use it; some tools require a free student account.
      </Typography>
      <Grid container spacing={1.5} sx={{ mb: 4 }}>
        {implementedFeatures.map((item) => (
          <Grid size={{ xs: 12, sm: 6 }} key={item.href}>
            <Paper
              component={NextLink}
              href={item.href}
              elevation={0}
              sx={{
                display: 'block',
                p: 2,
                height: '100%',
                borderRadius: '16px',
                border: '1.5px solid',
                borderColor: 'divider',
                textDecoration: 'none',
                color: 'inherit',
                '&:hover': { borderColor: GREEN_LIGHT },
              }}
            >
              <Typography sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>{item.title}</Typography>
              <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary', lineHeight: 1.55 }}>{item.note}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Typography component="h2" sx={{ fontWeight: 800, fontSize: '1.35rem', color: 'text.primary', mb: 1.5 }}>
        How it is built
      </Typography>
      <Typography sx={{ color: 'text.secondary', lineHeight: 1.7, mb: 4 }}>
        The public site is a Next.js web app. Practice data, accounts, and institute tools are served by a Django API. Students can sign in with email or Google, switch theme and question language, and keep a primary target exam on the home dashboard.
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <Button
          component={NextLink}
          href="/exams"
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          sx={{
            textTransform: 'none',
            fontWeight: 800,
            borderRadius: '12px',
            py: 1.2,
            background: `linear-gradient(135deg, ${GREEN}, ${GREEN_LIGHT})`,
          }}
        >
          Browse exams
        </Button>
        <Button
          component={NextLink}
          href="/contact"
          variant="outlined"
          sx={{
            textTransform: 'none',
            fontWeight: 800,
            borderRadius: '12px',
            py: 1.2,
            color: GREEN,
            borderColor: GREEN,
          }}
        >
          Contact the team
        </Button>
      </Stack>
    </Container>
  );
}
